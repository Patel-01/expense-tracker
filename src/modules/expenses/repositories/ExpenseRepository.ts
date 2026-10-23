import type { PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import {
  EXPENSE_COLUMNS,
  EXPENSE_TABLE,
  type ExpenseRow,
  type ExpenseSummaryRow,
  type ExpenseTotalsRow
} from '../models/ExpenseRow.js';
import {
  EXPENSE_CATEGORIES,
  type CategoryTotals,
  type Expense,
  type ExpenseCategory,
  type ExpenseListQuery,
  type ExpensePage,
  type MonthRange,
  type NewExpense
} from '../domain/Expense.js';
import type { ExpenseStore } from '../ports/ExpenseStore.js';

// PostgREST's "requested range not satisfiable", returned for a page past the end
const RANGE_NOT_SATISFIABLE = 'PGRST103';

/** Persistence adapter between the API model and the Postgres `expenses` table. */
export default class ExpenseRepository implements ExpenseStore {
  constructor(private readonly client: SupabaseClient) {}

  async create(input: NewExpense): Promise<Expense> {
    const { data, error } = await this.client.from(EXPENSE_TABLE).insert(input).select(EXPENSE_COLUMNS).single();
    if (error) throw this.storeError(error);
    return this.toDomain(data as ExpenseRow);
  }

  async list(query: ExpenseListQuery): Promise<ExpensePage> {
    let items = this.client.from(EXPENSE_TABLE).select(EXPENSE_COLUMNS);
    if (query.category) items = items.eq('category', query.category);
    if (query.from) items = items.gte('date', query.from);
    if (query.to) items = items.lte('date', query.to);

    const offset = (query.page - 1) * query.limit;
    const [itemsResult, totalsResult] = await Promise.all([
      items.order('date', { ascending: false }).order('id', { ascending: false }).range(offset, offset + query.limit - 1),
      // Totals run over every matching row, so they don't depend on the page being viewed
      this.client.rpc('expense_totals', {
        p_category: query.category ?? null,
        p_from: query.from ?? null,
        p_to: query.to ?? null
      }).single()
    ]);

    if (itemsResult.error && itemsResult.error.code !== RANGE_NOT_SATISFIABLE) throw this.storeError(itemsResult.error);
    if (totalsResult.error) throw this.storeError(totalsResult.error);

    const totals = totalsResult.data as ExpenseTotalsRow;
    return {
      items: ((itemsResult.data ?? []) as ExpenseRow[]).map(row => this.toDomain(row)),
      total_count: Number(totals.total_count),
      total_amount: Number(totals.total_amount)
    };
  }

  async remove(id: number): Promise<boolean> {
    const { data, error } = await this.client.from(EXPENSE_TABLE).delete().eq('id', id).select('id');
    if (error) throw this.storeError(error);
    return data.length > 0;
  }

  async categoryTotals(range: MonthRange): Promise<CategoryTotals> {
    const { data, error } = await this.client.rpc('expense_summary', { p_from: range.from, p_to: range.to });
    if (error) throw this.storeError(error);

    // Start every category at 0 so months with no spending in a category still list it
    const totals = Object.fromEntries(EXPENSE_CATEGORIES.map(category => [category, 0])) as CategoryTotals;
    for (const row of data as ExpenseSummaryRow[]) totals[row.category as ExpenseCategory] = Number(row.total);
    return totals;
  }

  private toDomain(row: ExpenseRow): Expense {
    return {
      id: row.id,
      title: row.title,
      amount: Number(row.amount),
      category: row.category as ExpenseCategory,
      date: row.date
    };
  }

  private storeError(error: PostgrestError): Error {
    return new Error(`Expense store request failed: ${error.message}`);
  }
}
