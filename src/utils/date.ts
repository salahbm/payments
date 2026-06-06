import { Locale, format, formatDistance, formatRelative } from 'date-fns';
import { enUS, ru } from 'date-fns/locale';

type SupportedLocale = 'en' | 'ru';

// Map locale codes to date-fns locale objects
const dateLocales: Record<SupportedLocale, Locale> = {
  en: enUS,
  ru: ru,
};

/**
 * Format a date using date-fns with the appropriate locale
 * @param date The date to format
 * @param formatStr The format string to use
 * @param locale The locale code (e.g., 'en', 'ru')
 * @returns The formatted date string
 */
export function formatDate(
  date: Date | number,
  formatStr: string,
  locale: SupportedLocale,
): string {
  return format(date, formatStr, { locale: dateLocales[locale] });
}

/**
 * Format the distance between two dates with the appropriate locale
 * @param date The date to compare to baseDate
 * @param baseDate The base date to compare from
 * @param locale The locale code (e.g., 'en', 'ru')
 * @returns The formatted distance string
 */
export function formatDateDistance(
  date: Date | number,
  baseDate: Date | number,
  locale: SupportedLocale,
): string {
  return formatDistance(date, baseDate, { locale: dateLocales[locale] });
}

/**
 * Format a date relative to the current date with the appropriate locale
 * @param date The date to format
 * @param baseDate The base date to compare from
 * @param locale The locale code (e.g., 'en', 'ru')
 * @returns The formatted relative date string
 */
export function formatDateRelative(
  date: Date | number,
  baseDate: Date | number,
  locale: SupportedLocale,
): string {
  return formatRelative(date, baseDate, { locale: dateLocales[locale] });
}

/**
 * Convert a date to an ISO string
 * @param date The date to convert
 * @returns The ISO string representation of the date
 */
export const dateToISOString = (date?: Date) => date?.toISOString() ?? '';
/**
 * Convert an ISO string to a date
 * @param isoString The ISO string to convert
 * @returns The date representation of the ISO string
 */
export const isoStringToDate = (iso?: string) =>
  iso ? new Date(iso) : new Date();

/**
 * Get the year from a date
 * @param date The date to get the year from
 * @returns The year of the date
 */
export const dateToYear = (date?: Date): number =>
  date ? date.getFullYear() : 0;

/**
 * Get the year from a date
 * @param year The year to get the date from
 * @returns The date of the year
 */
export const yearToDate = (year?: number): Date =>
  year ? new Date(year, 0, 1) : new Date();

/**
 * Get the month from a date
 * @param date The date to get the month from
 * @returns The month of the date
 */
export const dateToMonth = (date?: Date): number =>
  date ? date.getMonth() : 0;

/**
 * Get the month from a date
 * @param month The month to get the date from
 * @returns The date of the month
 */
export const monthToDate = (month?: number): Date =>
  month ? new Date(month, 0, 1) : new Date();
