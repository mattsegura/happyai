/**
 * Formatting Utilities
 *
 * Centralized text and number formatting utilities.
 * Use these instead of inline formatting to maintain consistency.
 *
 * Created: 2025-11-04 (Phase 3: Code Deduplication)
 */

/**
 * Format number with commas (e.g., 1000 → "1,000")
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * Format number as percentage (e.g., 0.85 → "85%")
 */
export function formatPercentage(value: number, decimals: number = 0): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format grade percentage (e.g., 85.5 → "85.5%", 90 → "90%")
 */
export function formatGrade(grade: number): string {
  return `${grade % 1 === 0 ? grade : grade.toFixed(1)}%`;
}

/**
 * Format letter grade from percentage
 */
export function formatLetterGrade(percentage: number): string {
  if (percentage >= 93) return 'A';
  if (percentage >= 90) return 'A-';
  if (percentage >= 87) return 'B+';
  if (percentage >= 83) return 'B';
  if (percentage >= 80) return 'B-';
  if (percentage >= 77) return 'C+';
  if (percentage >= 73) return 'C';
  if (percentage >= 70) return 'C-';
  if (percentage >= 67) return 'D+';
  if (percentage >= 63) return 'D';
  if (percentage >= 60) return 'D-';
  return 'F';
}

/**
 * Format currency (e.g., 1999.99 → "$1,999.99")
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD'
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format currency for cents (e.g., 1999 cents → "$19.99")
 */
export function formatCentsAsDollars(cents: number): string {
  return formatCurrency(cents / 100);
}

/**
 * Truncate text to max length with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Truncate text at word boundary
 */
export function truncateWords(text: string, maxWords: number): string {
  const words = text.split(' ');
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(' ') + '...';
}

/**
 * Capitalize first letter
 */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Capitalize each word
 */
export function capitalizeWords(text: string): string {
  return text
    .split(' ')
    .map((word) => capitalize(word))
    .join(' ');
}

/**
 * Convert to title case
 */
export function toTitleCase(text: string): string {
  return text
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Format phone number (e.g., "1234567890" → "(123) 456-7890")
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
}

/**
 * Format file size (e.g., 1536 bytes → "1.5 KB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format initials from name (e.g., "John Doe" → "JD")
 */
export function formatInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);
}

/**
 * Format list with commas and "and" (e.g., ["A", "B", "C"] → "A, B, and C")
 */
export function formatList(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return items.join(' and ');

  const last = items[items.length - 1];
  const rest = items.slice(0, -1);
  return rest.join(', ') + ', and ' + last;
}

/**
 * Format ordinal number (e.g., 1 → "1st", 2 → "2nd")
 */
export function formatOrdinal(num: number): string {
  const j = num % 10;
  const k = num % 100;

  if (j === 1 && k !== 11) return num + 'st';
  if (j === 2 && k !== 12) return num + 'nd';
  if (j === 3 && k !== 13) return num + 'rd';
  return num + 'th';
}

/**
 * Format GPA (e.g., 3.67 → "3.67")
 */
export function formatGPA(gpa: number): string {
  return gpa.toFixed(2);
}

/**
 * Format compact number (e.g., 1000 → "1K", 1000000 → "1M")
 */
export function formatCompactNumber(num: number): string {
  if (num < 1000) return num.toString();
  if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
  return (num / 1000000).toFixed(1) + 'M';
}

/**
 * Format class code (uppercase, add dashes if needed)
 */
export function formatClassCode(code: string): string {
  return code.toUpperCase().replace(/(.{3})(.{3})/, '$1-$2');
}

/**
 * Format sentiment label
 */
export function formatSentimentLabel(sentiment: number): string {
  const labels = {
    1: 'Very Negative',
    2: 'Negative',
    3: 'Slightly Negative',
    4: 'Slightly Positive',
    5: 'Positive',
    6: 'Very Positive',
  };
  return labels[sentiment as keyof typeof labels] || 'Unknown';
}

/**
 * Format assignment status
 */
export function formatAssignmentStatus(
  status: 'upcoming' | 'due_soon' | 'late' | 'missing' | 'completed'
): string {
  const labels = {
    upcoming: 'Upcoming',
    due_soon: 'Due Soon',
    late: 'Late',
    missing: 'Missing',
    completed: 'Completed',
  };
  return labels[status];
}

/**
 * Format boolean as Yes/No
 */
export function formatYesNo(value: boolean): string {
  return value ? 'Yes' : 'No';
}

/**
 * Format boolean as Active/Inactive
 */
export function formatActiveStatus(value: boolean): string {
  return value ? 'Active' : 'Inactive';
}

/**
 * Format streak count (e.g., 5 → "5 days", 1 → "1 day")
 */
export function formatStreak(days: number): string {
  return `${days} day${days !== 1 ? 's' : ''}`;
}

/**
 * Strip HTML tags from string
 */
export function stripHTML(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

/**
 * Format URL to display name (e.g., "https://example.com/page" → "example.com")
 */
export function formatURLDisplay(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return url;
  }
}
