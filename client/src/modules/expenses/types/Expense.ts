export const EXPENSE_CATEGORIES = ['food', 'travel', 'bills', 'other'] as const;
export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];

export interface ExpenseView {
  id: number;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
}

export interface ExpensePageView {
  items: ExpenseView[];
  total_count: number;
  total_amount: number;
}

export interface NewExpenseInput {
  title: string;
  amount: number;
  category: ExpenseCategory;
  date?: string;
}

/** Raw form values; amount stays a string so partial input like "12." is editable. */
export interface ExpenseFormValues {
  title: string;
  amount: string;
  category: ExpenseCategory | '';
  date: string;
}

export type ExpenseFormErrors = Partial<Record<keyof ExpenseFormValues, string>>;
