/** Postgres shapes, matching supabase/migrations. Numeric columns may arrive as strings. */
export interface ExpenseRow {
  id: number;
  title: string;
  amount: number | string;
  category: string;
  date: string;
}

export interface ExpenseTotalsRow {
  total_count: number;
  total_amount: number | string;
}

export interface ExpenseSummaryRow {
  category: string;
  total: number | string;
}

export const EXPENSE_TABLE = 'expenses';
export const EXPENSE_COLUMNS = 'id, title, amount, category, date';
