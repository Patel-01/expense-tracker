export const EXPENSE_CATEGORIES = ['food', 'travel', 'bills', 'other'] as const;
export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];

export interface Expense {
  id: number;
  title: string;
  amount: number;
  category: ExpenseCategory;
  /** Calendar date, YYYY-MM-DD */
  date: string;
}

export type NewExpense = Omit<Expense, 'id'>;

export interface ExpenseFilter {
  category?: ExpenseCategory;
  from?: string;
  to?: string;
}

export interface ExpenseListQuery extends ExpenseFilter {
  page: number;
  limit: number;
}

/** Response contract: totals cover every matching expense, not just this page. */
export interface ExpensePage {
  items: Expense[];
  total_count: number;
  total_amount: number;
}

/** A calendar month as a half-open date range [from, to). */
export interface MonthRange {
  month: string;
  from: string;
  to: string;
}

export type CategoryTotals = Record<ExpenseCategory, number>;
