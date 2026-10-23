import type { CategoryTotals, Expense, ExpenseListQuery, ExpensePage, MonthRange, NewExpense } from '../domain/Expense.js';

// Dependency boundary: the controller does not depend on Supabase.
export interface ExpenseStore {
  create(input: NewExpense): Promise<Expense>;
  list(query: ExpenseListQuery): Promise<ExpensePage>;
  remove(id: number): Promise<boolean>;
  categoryTotals(range: MonthRange): Promise<CategoryTotals>;
}
