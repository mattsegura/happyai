/**
 * Canvas LMS to Supabase Sync Service
 *
 * This service syncs data from Canvas LMS API to the HapiAI Supabase database.
 * It handles the transformation and storage of Canvas courses, enrollments, and assignments.
 */

import { canvasService } from './canvasService';
import { supabase } from '../supabase';

// Note: canvasService currently returns legacy types from mock data
// When using real Canvas API, these will match canvasTypesOfficial

export type SyncStatus = {
  success: boolean;
  syncedAt: string;
  counts: {
    courses: number;
    enrollments: number;
    assignments?: number;
  };
  errors: string[];
};

/**
 * Main Canvas Sync Service
 */
class CanvasSyncService {
  private userId: string | null = null;

  /**
   * Initialize sync service for a specific user
   */
  setUser(userId: string) {
    this.userId = userId;
  }

  /**
   * Full sync: courses, enrollments, and optionally assignments
   */
  async fullSync(options?: {
    syncAssignments?: boolean;
    onProgress?: (message: string) => void;
  }): Promise<SyncStatus> {
    const errors: string[] = [];
    let courseCount = 0;
    let enrollmentCount = 0;
    let assignmentCount = 0;

    const { syncAssignments = false, onProgress } = options || {};

    try {
      onProgress?.('Fetching courses from Canvas...');

      // 1. Fetch courses from Canvas
      const canvasCourses = await canvasService.getCourses();
      // Type assertion needed because mock data has different structure
      const activeCourses = (canvasCourses as any[]).filter(
        (c: any) => c.workflow_state === 'available' || !c.workflow_state
      );

      onProgress?.(`Found ${activeCourses.length} active courses`);

      // 2. Check for Canvas Account ID and assign university
      if (this.userId && activeCourses.length > 0) {
        try {
          const firstCourse = activeCourses[0];
          const rootAccountId = firstCourse.root_account_id || firstCourse.account_id;

          if (rootAccountId) {
            onProgress?.('Checking university assignment...');

            // Try to match Canvas account to university
            const { data: universityId, error: univError } = await supabase.rpc(
              'get_university_id_by_canvas_account',
              { canvas_account_id: String(rootAccountId) }
            );

            if (!univError && universityId) {
              // Update user's university based on Canvas account
              const { error: updateError } = await supabase
                .from('profiles')
                .update({ university_id: universityId })
                .eq('id', this.userId);

              if (!updateError) {
                onProgress?.('✓ University assigned based on Canvas account');
              }
            }

            // Also save Canvas root account ID to settings for future reference
            await supabase
              .from('canvas_settings')
              .upsert({
                user_id: this.userId,
                canvas_root_account_id: String(rootAccountId),
              }, { onConflict: 'user_id' });
          }
        } catch (err) {
          errors.push(`University assignment: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      }

      // 3. Sync each course
      for (const course of activeCourses) {
        try {
          onProgress?.(`Syncing course: ${course.name}`);

          // Transform and insert course
          const classData = this.transformCourseToClass(course as any);
          const { error: courseError } = await supabase
            .from('classes')
            .upsert(classData, { onConflict: 'id' });

          if (courseError) {
            errors.push(`Course ${course.id}: ${courseError.message}`);
            continue;
          }

          courseCount++;

          // 4. Sync enrollments for this course
          if (course.enrollments) {
            const studentEnrollments = course.enrollments.filter(
              (e: any) => e.type === 'StudentEnrollment' && e.enrollment_state === 'active'
            );

            for (const enrollment of studentEnrollments) {
              try {
                const memberData = this.transformEnrollmentToMember(enrollment as any, classData.id);
                const { error: memberError } = await supabase
                  .from('class_members')
                  .upsert(memberData, { onConflict: 'user_id,class_id' });

                if (!memberError) {
                  enrollmentCount++;
                } else {
                  errors.push(`Enrollment ${enrollment.id}: ${memberError.message}`);
                }
              } catch (err) {
                errors.push(`Enrollment ${enrollment.id}: ${err instanceof Error ? err.message : 'Unknown error'}`);
              }
            }
          }

          // 5. Optionally sync assignments
          if (syncAssignments) {
            try {
              const assignments = await canvasService.getAssignments(String(course.id));
              for (const assignment of assignments) {
                // Only sync published assignments
                if ((assignment as any).published) {
                  const pulseSetData = await this.transformAssignmentToPulseSet(
                    assignment as any,
                    classData.id,
                    classData.teacher_id
                  );

                  const { error: assignmentError } = await supabase
                    .from('pulse_check_sets')
                    .upsert(pulseSetData, { onConflict: 'id' });

                  if (!assignmentError) {
                    assignmentCount++;
                  } else {
                    errors.push(`Assignment ${assignment.id}: ${assignmentError.message}`);
                  }
                }
              }
            } catch (err) {
              errors.push(`Assignments for course ${course.id}: ${err instanceof Error ? err.message : 'Unknown error'}`);
            }
          }
        } catch (err) {
          errors.push(`Course ${course.id}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      }

      onProgress?.('Sync completed!');

      return {
        success: errors.length === 0,
        syncedAt: new Date().toISOString(),
        counts: {
          courses: courseCount,
          enrollments: enrollmentCount,
          assignments: assignmentCount,
        },
        errors,
      };
    } catch (err) {
      return {
        success: false,
        syncedAt: new Date().toISOString(),
        counts: {
          courses: 0,
          enrollments: 0,
          assignments: 0,
        },
        errors: [err instanceof Error ? err.message : 'Unknown error during sync'],
      };
    }
  }

  /**
   * Sync only courses and enrollments (faster, no assignments)
   */
  async quickSync(): Promise<SyncStatus> {
    return this.fullSync({ syncAssignments: false });
  }

  /**
   * Transform Canvas Course to Supabase Class
   */
  private transformCourseToClass(course: any) {
    // Extract teacher from enrollments
    const teacherEnrollment = course.enrollments?.find(
      (e: any) => e.type === 'TeacherEnrollment'
    );

    return {
      id: `canvas-${course.id}`,
      name: course.name,
      description: course.course_code,
      teacher_name: teacherEnrollment?.user?.name || 'Canvas Teacher',
      teacher_id: teacherEnrollment?.user_id
        ? `canvas-user-${teacherEnrollment.user_id}`
        : null,
      class_code: course.course_code,
      created_at: course.created_at,
      updated_at: new Date().toISOString(),
    };
  }

  /**
   * Transform Canvas Enrollment to Supabase Class Member
   */
  private transformEnrollmentToMember(enrollment: any, classId: string) {
    return {
      user_id: this.userId!, // Current user
      class_id: classId,
      class_points: 0, // Initialize points to 0
      joined_at: enrollment.created_at,
    };
  }

  /**
   * Transform Canvas Assignment to Supabase Pulse Set
   */
  private async transformAssignmentToPulseSet(
    assignment: any,
    classId: string,
    teacherId: string | null
  ) {
    // Strip HTML from description
    const description = this.stripHTML(assignment.description || '');

    return {
      id: `canvas-assignment-${assignment.id}`,
      class_id: classId,
      teacher_id: teacherId,
      title: assignment.name,
      description,
      expires_at: assignment.due_at || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      is_active: assignment.published,
      is_draft: false,
      scheduled_for: null,
      total_points: Math.round(assignment.points_possible || 10),
      created_at: assignment.created_at,
      updated_at: assignment.updated_at,
    };
  }

  /**
   * Strip HTML tags from string
   */
  private stripHTML(html: string): string {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }

  /**
   * Create wellness check questions for imported assignment
   */
  async createWellnessQuestions(pulseSetId: string): Promise<void> {
    const questions = [
      {
        id: `${pulseSetId}-q1`,
        pulse_set_id: pulseSetId,
        question_text: 'How confident do you feel about completing this assignment?',
        question_type: 'rating_scale',
        position: 0,
        is_required: true,
        points_value: 5,
        configuration: JSON.stringify({
          min: 1,
          max: 5,
          min_label: 'Not confident',
          max_label: 'Very confident',
        }),
      },
      {
        id: `${pulseSetId}-q2`,
        pulse_set_id: pulseSetId,
        question_text: 'How do you feel about this assignment?',
        question_type: 'multiple_choice_single',
        position: 1,
        is_required: true,
        points_value: 5,
        configuration: JSON.stringify({}),
      },
      {
        id: `${pulseSetId}-q3`,
        pulse_set_id: pulseSetId,
        question_text: 'Do you need help with this assignment?',
        question_type: 'yes_no_maybe',
        position: 2,
        is_required: false,
        points_value: 0,
        configuration: JSON.stringify({}),
      },
    ];

    await supabase.from('pulse_questions').insert(questions);

    // Add options for multiple choice question
    const options = [
      { question_id: `${pulseSetId}-q2`, option_text: 'Excited', position: 0 },
      { question_id: `${pulseSetId}-q2`, option_text: 'Confident', position: 1 },
      { question_id: `${pulseSetId}-q2`, option_text: 'Neutral', position: 2 },
      { question_id: `${pulseSetId}-q2`, option_text: 'Anxious', position: 3 },
      { question_id: `${pulseSetId}-q2`, option_text: 'Overwhelmed', position: 4 },
    ];

    await supabase.from('question_options').insert(options);
  }

  /**
   * Get sync status from last run
   */
  async getLastSyncStatus(): Promise<{ syncedAt: string | null; counts: any } | null> {
    // This would typically be stored in a sync_history table
    // For now, return null
    return null;
  }

  /**
   * Check if sync is needed (based on last sync time)
   */
  shouldSync(lastSyncTime: string | null): boolean {
    if (!lastSyncTime) return true;

    const lastSync = new Date(lastSyncTime);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastSync.getTime()) / (1000 * 60);

    // Sync if more than 30 minutes since last sync
    return diffMinutes > 30;
  }
}

// Export singleton instance
export const canvasSyncService = new CanvasSyncService();

// Export class for testing
export { CanvasSyncService };
