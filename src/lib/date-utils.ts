import { format as formatDate } from 'date-fns';
import { nb } from 'date-fns/locale';

/**
 * Format a date using Norwegian locale
 * 
 * @param date The date to format
 * @param formatStr The format string (e.g., 'PP', 'PPP')
 * @returns Formatted date string in Norwegian locale
 */
export function formatDateNorwegian(date: Date | string | number, formatStr: string): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  return formatDate(dateObj, formatStr, { locale: nb });
}

/**
 * Format a date for API/database use (ISO format)
 * 
 * @param date The date to format
 * @returns Date string in yyyy-MM-dd format
 */
export function formatDateForApi(date: Date): string {
  return formatDate(date, 'yyyy-MM-dd');
} 