export const MONTHS: readonly string[] = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

export function getDefaultYears(): number[] {
  const currentYear = new Date().getFullYear();
  return [currentYear - 1, currentYear];
}

export function periodKey(month: string, year: number): string {
  return `${month}-${year}`;
}

export function parsePeriodKey(key: string): { month: string; year: number } | null {
  const parts = key.split('-');
  if (parts.length < 2) return null;
  const year = parseInt(parts[parts.length - 1], 10);
  if (Number.isNaN(year)) return null;
  const month = parts.slice(0, -1).join('-');
  return { month, year };
}
