import type { ExpenseListQuery, MonthRange, NewExpense } from '../../domain/Expense.js';

export interface ExpenseRequestPlanner {
  id(value: unknown): number;
  create(payload: unknown): NewExpense;
  listQuery(query: unknown): ExpenseListQuery;
  month(query: unknown): MonthRange;
}
