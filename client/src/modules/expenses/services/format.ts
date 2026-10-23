// Amounts are rupees, grouped the Indian way (1,23,456.00)
const money = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

export function formatMoney(amount: number): string {
  return money.format(amount);
}

/** Shows a YYYY-MM-DD calendar date without shifting it through the browser's time zone. */
export function formatDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-IN', { timeZone: 'UTC', day: 'numeric', month: 'short' });
}

/** "2026-10" → "October 2026" */
export function formatMonth(month: string, style: 'long' | 'name' = 'long'): string {
  return new Date(`${month}-01T00:00:00Z`).toLocaleDateString('en-IN', {
    timeZone: 'UTC',
    month: 'long',
    ...(style === 'long' ? { year: 'numeric' } : {})
  });
}

/** Moves a YYYY-MM month by `delta` months. */
export function shiftMonth(month: string, delta: number): string {
  const [year, monthIndex] = month.split('-').map(Number) as [number, number];
  return new Date(Date.UTC(year, monthIndex - 1 + delta, 1)).toISOString().slice(0, 7);
}
