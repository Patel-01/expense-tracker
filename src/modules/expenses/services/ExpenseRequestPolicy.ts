import type { ExpenseListQuery, MonthRange, NewExpense } from '../domain/Expense.js';
import type { ExpenseRequestPlanner } from './internal/ExpenseRequestPlanner.js';

/** Validates expense payloads and query strings before they reach the store. */
export class ExpenseRequestPolicy {
  constructor(private readonly planner: ExpenseRequestPlanner) {}

  id(value: unknown): number {
    return this.planner.id(value);
  }

  create(payload: unknown): NewExpense {
    return this.planner.create(payload);
  }

  listQuery(query: unknown): ExpenseListQuery {
    return this.planner.listQuery(query);
  }

  month(query: unknown): MonthRange {
    return this.planner.month(query);
  }
}
