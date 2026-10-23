const money = new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function formatMoney(amount: number): string {
  return money.format(amount);
}

/** Shows a YYYY-MM-DD calendar date without shifting it through the browser's time zone. */
export function formatDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString(undefined, {
    timeZone: 'UTC', day: 'numeric', month: 'short', year: 'numeric'
  });
}
