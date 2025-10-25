import { supabase } from './supabase';

interface ReportData {
  headers: string[];
  rows: any[][];
}

/**
 * Generate CSV content from report data
 */
function generateCSV(data: ReportData): string {
  const csvRows = [];

  // Add headers
  csvRows.push(data.headers.join(','));

  // Add data rows
  for (const row of data.rows) {
    const escapedRow = row.map(cell => {
      // Escape commas and quotes
      const cellStr = String(cell || '');
      if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
        return `"${cellStr.replace(/"/g, '""')}"`;
      }
      return cellStr;
    });
    csvRows.push(escapedRow.join(','));
  }

  return csvRows.join('\n');
}

/**
 * Download CSV file
 */
function downloadCSV(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Download JSON file
 */
function downloadJSON(filename: string, data: any) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate User Activity Report
 */
export async function generateUserActivityReport(format: 'csv' | 'json' = 'csv') {
  try {
    const { data: users, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, total_points, current_streak, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (format === 'json') {
      downloadJSON(`user-activity-${new Date().toISOString().split('T')[0]}.json`, users);
      return;
    }

    const reportData: ReportData = {
      headers: ['Email', 'Full Name', 'Role', 'Total Points', 'Current Streak', 'Created At'],
      rows: (users || []).map(user => [
        user.email,
        user.full_name,
        user.role,
        user.total_points || 0,
        user.current_streak || 0,
        new Date(user.created_at).toLocaleDateString(),
      ]),
    };

    const csv = generateCSV(reportData);
    downloadCSV(`user-activity-${new Date().toISOString().split('T')[0]}.csv`, csv);
  } catch (error) {
    console.error('Error generating user activity report:', error);
    throw error;
  }
}

/**
 * Generate Sentiment Trends Report
 */
export async function generateSentimentReport(format: 'csv' | 'json' = 'csv') {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: pulseChecks, error } = await supabase
      .from('pulse_checks')
      .select('user_id, emotion, intensity, created_at, profiles(email, full_name)')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (format === 'json') {
      downloadJSON(`sentiment-trends-${new Date().toISOString().split('T')[0]}.json`, pulseChecks);
      return;
    }

    const reportData: ReportData = {
      headers: ['Date', 'Email', 'Full Name', 'Emotion', 'Intensity'],
      rows: (pulseChecks || []).map(check => [
        new Date(check.created_at).toLocaleDateString(),
        (check.profiles as any)?.email || 'Unknown',
        (check.profiles as any)?.full_name || 'Unknown',
        check.emotion,
        check.intensity || 'N/A',
      ]),
    };

    const csv = generateCSV(reportData);
    downloadCSV(`sentiment-trends-${new Date().toISOString().split('T')[0]}.csv`, csv);
  } catch (error) {
    console.error('Error generating sentiment report:', error);
    throw error;
  }
}

/**
 * Generate Class Performance Report
 */
export async function generateClassPerformanceReport(format: 'csv' | 'json' = 'csv') {
  try {
    const { data: classes, error } = await supabase
      .from('classes')
      .select('id, name, subject, created_at, profiles(full_name)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Get enrollment counts for each class
    const classesWithCounts = await Promise.all(
      (classes || []).map(async (cls) => {
        const { count } = await supabase
          .from('class_members')
          .select('*', { count: 'exact', head: true })
          .eq('class_id', cls.id);

        return {
          ...cls,
          student_count: count || 0,
        };
      })
    );

    if (format === 'json') {
      downloadJSON(`class-performance-${new Date().toISOString().split('T')[0]}.json`, classesWithCounts);
      return;
    }

    const reportData: ReportData = {
      headers: ['Class Name', 'Subject', 'Teacher', 'Students Enrolled', 'Created At'],
      rows: classesWithCounts.map(cls => [
        cls.name,
        cls.subject,
        (cls.profiles as any)?.full_name || 'Unknown',
        cls.student_count,
        new Date(cls.created_at).toLocaleDateString(),
      ]),
    };

    const csv = generateCSV(reportData);
    downloadCSV(`class-performance-${new Date().toISOString().split('T')[0]}.csv`, csv);
  } catch (error) {
    console.error('Error generating class performance report:', error);
    throw error;
  }
}

/**
 * Generate Daily Check-ins Report
 */
export async function generateDailyCheckInsReport(format: 'csv' | 'json' = 'csv') {
  try {
    const { data: pulseChecks, error } = await supabase
      .from('pulse_checks')
      .select('created_at, emotion, profiles(email, full_name)')
      .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (format === 'json') {
      downloadJSON(`daily-checkins-${new Date().toISOString().split('T')[0]}.json`, pulseChecks);
      return;
    }

    const reportData: ReportData = {
      headers: ['Time', 'Email', 'Full Name', 'Emotion'],
      rows: (pulseChecks || []).map(check => [
        new Date(check.created_at).toLocaleTimeString(),
        (check.profiles as any)?.email || 'Unknown',
        (check.profiles as any)?.full_name || 'Unknown',
        check.emotion,
      ]),
    };

    const csv = generateCSV(reportData);
    downloadCSV(`daily-checkins-${new Date().toISOString().split('T')[0]}.csv`, csv);
  } catch (error) {
    console.error('Error generating daily check-ins report:', error);
    throw error;
  }
}

/**
 * Generate Platform Analytics Report
 */
export async function generatePlatformAnalyticsReport(format: 'csv' | 'json' = 'csv') {
  try {
    // Get aggregate statistics
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    const { count: totalClasses } = await supabase
      .from('classes')
      .select('*', { count: 'exact', head: true });

    const { count: totalCheckIns } = await supabase
      .from('pulse_checks')
      .select('*', { count: 'exact', head: true });

    const { count: totalMoments } = await supabase
      .from('hapi_moments')
      .select('*', { count: 'exact', head: true });

    const analytics = {
      generated_at: new Date().toISOString(),
      total_users: totalUsers || 0,
      total_classes: totalClasses || 0,
      total_check_ins: totalCheckIns || 0,
      total_hapi_moments: totalMoments || 0,
    };

    if (format === 'json') {
      downloadJSON(`platform-analytics-${new Date().toISOString().split('T')[0]}.json`, analytics);
      return;
    }

    const reportData: ReportData = {
      headers: ['Metric', 'Value'],
      rows: [
        ['Total Users', analytics.total_users],
        ['Total Classes', analytics.total_classes],
        ['Total Check-ins', analytics.total_check_ins],
        ['Total Hapi Moments', analytics.total_hapi_moments],
        ['Report Generated', new Date(analytics.generated_at).toLocaleString()],
      ],
    };

    const csv = generateCSV(reportData);
    downloadCSV(`platform-analytics-${new Date().toISOString().split('T')[0]}.csv`, csv);
  } catch (error) {
    console.error('Error generating platform analytics report:', error);
    throw error;
  }
}
