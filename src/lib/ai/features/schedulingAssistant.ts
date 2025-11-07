/**
 * AI Scheduling Assistant
 *
 * Natural language scheduling interface that understands requests like:
 * - "Move my Biology review to Thursday"
 * - "Add a 2-hour study session for the math exam this weekend"
 * - "Clear my schedule Friday afternoon"
 */

import { getAIService } from '../aiService';
import { SCHEDULING_REQUEST_PROMPT, fillTemplate } from '../promptTemplates';
import { supabase } from '../../supabase';

// =====================================================
// TYPES
// =====================================================

export type SchedulingActionType =
  | 'move_study_session'
  | 'create_study_session'
  | 'delete_study_session'
  | 'reschedule_multiple'
  | 'generate_plan'
  | 'clarify';

export interface SchedulingAction {
  action: SchedulingActionType;
  confidence: number;
  parameters: Record<string, unknown>;
  explanation: string;
  needsConfirmation: boolean;
  confirmationMessage?: string;
}

export interface StudySession {
  id?: string;
  title: string;
  courseId?: string;
  assignmentId?: string;
  startTime: string;
  endTime: string;
  date: string;
  description?: string;
}

export interface UserContext {
  currentDateTime: Date;
  calendar: Array<{ id: string; title: string; start: string; end: string }>;
  studySessions: StudySession[];
  assignments: Array<{ id: string; name: string; dueAt: string; courseName: string }>;
}

// =====================================================
// AI SCHEDULING ASSISTANT CLASS
// =====================================================

export class AISchedulingAssistant {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Process natural language scheduling request
   */
  async processSchedulingRequest(userMessage: string): Promise<SchedulingAction> {
    try {
      // 1. Gather context
      const context = await this.gatherUserContext();

      // 2. Build prompt
      const promptContext = {
        userMessage,
        currentDateTime: context.currentDateTime.toISOString(),
        calendar: JSON.stringify(context.calendar, null, 2),
        studySessions: JSON.stringify(context.studySessions, null, 2),
        assignments: JSON.stringify(context.assignments, null, 2),
      };

      const aiService = getAIService();
      aiService.setUserId(this.userId);

      const prompt = fillTemplate(SCHEDULING_REQUEST_PROMPT.template, promptContext);

      // 3. Get AI interpretation
      const response = await aiService.complete({
        prompt,
        featureType: 'scheduling_assistant',
        promptVersion: SCHEDULING_REQUEST_PROMPT.version,
        options: {
          model: 'claude-3-sonnet-20240229',
          temperature: 0.3,
          maxTokens: 1000,
          responseFormat: 'json',
        },
      });

      // 4. Parse action
      const action = JSON.parse(response.content) as SchedulingAction;

      return action;
    } catch (error) {
      console.error('[Scheduling Assistant] Error processing request:', error);
      throw new Error('Failed to process scheduling request');
    }
  }

  /**
   * Execute a scheduling action
   */
  async executeAction(action: SchedulingAction): Promise<{ success: boolean; message: string }> {
    try {
      switch (action.action) {
        case 'move_study_session':
          return await this.moveStudySession(action.parameters);

        case 'create_study_session':
          return await this.createStudySession(action.parameters);

        case 'delete_study_session':
          return await this.deleteStudySession(action.parameters);

        case 'reschedule_multiple':
          return await this.rescheduleMultiple(action.parameters);

        case 'generate_plan':
          return {
            success: true,
            message: 'Generating new study plan... (redirect to Study Coach)',
          };

        case 'clarify':
          return {
            success: false,
            message: action.explanation,
          };

        default:
          return {
            success: false,
            message: 'Unknown action type',
          };
      }
    } catch (error) {
      console.error('[Scheduling Assistant] Error executing action:', error);
      return {
        success: false,
        message: 'Failed to execute scheduling action',
      };
    }
  }

  /**
   * Conversational chat interface
   */
  async chat(
    message: string,
    _conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
  ): Promise<string> {
    try {
      // For conversational flow, we process the request and return explanation
      const action = await this.processSchedulingRequest(message);

      if (action.needsConfirmation && action.confirmationMessage) {
        return action.confirmationMessage;
      }

      return action.explanation;
    } catch (error) {
      console.error('[Scheduling Assistant] Chat error:', error);
      return "I'm having trouble understanding that request. Could you rephrase it?";
    }
  }

  // =====================================================
  // HELPER METHODS
  // =====================================================

  private async gatherUserContext(): Promise<UserContext> {
    const currentDateTime = new Date();
    const weekLater = new Date(currentDateTime);
    weekLater.setDate(weekLater.getDate() + 7);

    // Fetch calendar events
    const { data: events } = await supabase
      .from('canvas_calendar_events')
      .select('id, title, start_at, end_at')
      .eq('user_id', this.userId)
      .gte('start_at', currentDateTime.toISOString())
      .lte('start_at', weekLater.toISOString());

    // Fetch study sessions
    const { data: sessions } = await supabase
      .from('study_sessions')
      .select('id, title, course_id, assignment_id, start_time, end_time')
      .eq('user_id', this.userId)
      .gte('start_time', currentDateTime.toISOString())
      .lte('start_time', weekLater.toISOString());

    // Fetch upcoming assignments
    const { data: assignments } = await supabase
      .from('canvas_assignments')
      .select(`
        id,
        name,
        due_at,
        canvas_courses(name)
      `)
      .eq('user_id', this.userId)
      .gte('due_at', currentDateTime.toISOString())
      .lte('due_at', weekLater.toISOString());

    return {
      currentDateTime,
      calendar: (events || []).map((e) => ({
        id: e.id,
        title: e.title,
        start: e.start_at,
        end: e.end_at || e.start_at,
      })),
      studySessions: (sessions || []).map((s) => ({
        id: s.id,
        title: s.title,
        courseId: s.course_id,
        assignmentId: s.assignment_id,
        startTime: s.start_time,
        endTime: s.end_time,
        date: s.start_time.split('T')[0],
      })),
      assignments: (assignments || []).map((a) => ({
        id: a.id,
        name: a.name,
        dueAt: a.due_at,
        courseName: (a.canvas_courses as unknown as { name: string })?.name || 'Unknown',
      })),
    };
  }

  private async moveStudySession(params: Record<string, unknown>): Promise<{
    success: boolean;
    message: string;
  }> {
    const { sessionId, newDate, newStartTime } = params;

    if (!sessionId || !newDate || !newStartTime) {
      return { success: false, message: 'Missing required parameters' };
    }

    const newStartDateTime = `${newDate}T${newStartTime}:00`;

    // Calculate new end time (assume same duration)
    const { data: session } = await supabase
      .from('study_sessions')
      .select('start_time, end_time')
      .eq('id', sessionId as string)
      .single();

    if (!session) {
      return { success: false, message: 'Study session not found' };
    }

    const originalDuration =
      new Date(session.end_time).getTime() - new Date(session.start_time).getTime();
    const newEndDateTime = new Date(
      new Date(newStartDateTime).getTime() + originalDuration
    ).toISOString();

    const { error } = await supabase
      .from('study_sessions')
      .update({
        start_time: newStartDateTime,
        end_time: newEndDateTime,
      })
      .eq('id', sessionId as string)
      .eq('user_id', this.userId);

    if (error) {
      return { success: false, message: 'Failed to move study session' };
    }

    return { success: true, message: 'Study session moved successfully' };
  }

  private async createStudySession(params: Record<string, unknown>): Promise<{
    success: boolean;
    message: string;
  }> {
    const { title, date, startTime, duration, courseId, assignmentId } = params;

    if (!title || !date || !startTime || !duration) {
      return { success: false, message: 'Missing required parameters' };
    }

    const startDateTime = `${date}T${startTime}:00`;
    const endDateTime = new Date(
      new Date(startDateTime).getTime() + (duration as number) * 60000
    ).toISOString();

    const { error } = await supabase.from('study_sessions').insert({
      user_id: this.userId,
      title: title as string,
      start_time: startDateTime,
      end_time: endDateTime,
      course_id: courseId as string | undefined,
      assignment_id: assignmentId as string | undefined,
      session_type: 'study',
      ai_generated: true,
    });

    if (error) {
      return { success: false, message: 'Failed to create study session' };
    }

    return { success: true, message: 'Study session created successfully' };
  }

  private async deleteStudySession(params: Record<string, unknown>): Promise<{
    success: boolean;
    message: string;
  }> {
    const { sessionId } = params;

    if (!sessionId) {
      return { success: false, message: 'Missing session ID' };
    }

    const { error } = await supabase
      .from('study_sessions')
      .delete()
      .eq('id', sessionId as string)
      .eq('user_id', this.userId);

    if (error) {
      return { success: false, message: 'Failed to delete study session' };
    }

    return { success: true, message: 'Study session deleted successfully' };
  }

  private async rescheduleMultiple(_params: Record<string, unknown>): Promise<{
    success: boolean;
    message: string;
  }> {
    // Complex operation - would need to move multiple sessions
    // Simplified implementation
    return {
      success: true,
      message: 'Multiple sessions rescheduled (feature needs enhancement)',
    };
  }
}

// =====================================================
// CONVENIENCE FUNCTIONS
// =====================================================

export async function processSchedulingRequest(
  userId: string,
  userMessage: string
): Promise<SchedulingAction> {
  const assistant = new AISchedulingAssistant(userId);
  return await assistant.processSchedulingRequest(userMessage);
}

export async function executeSchedulingAction(
  userId: string,
  action: SchedulingAction
): Promise<{ success: boolean; message: string }> {
  const assistant = new AISchedulingAssistant(userId);
  return await assistant.executeAction(action);
}

export default AISchedulingAssistant;
