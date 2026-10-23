import type { ExpenseCategory, ExpensePageView, ExpenseView, MonthSummaryView, NewExpenseInput } from '../types/Expense.js';
import HttpClient from '../../../shared/api/HttpClient.js';

export interface ExpenseListParams {
  category?: ExpenseCategory;
  page: number;
  limit: number;
}

export default class ExpenseApiClient {
  constructor(private readonly http = new HttpClient()) {}

  async listExpenses({ category, page, limit }: ExpenseListParams): Promise<ExpensePageView> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (category) params.set('category', category);
    return this.http.get<ExpensePageView>(`/api/expenses?${params}`);
  }

  async monthSummary(month: string): Promise<MonthSummaryView> {
    return this.http.get<MonthSummaryView>(`/api/expenses/summary?month=${encodeURIComponent(month)}`);
  }

  async createExpense(input: NewExpenseInput): Promise<ExpenseView> {
    return this.http.post<ExpenseView>('/api/expenses', input);
  }

  async deleteExpense(id: number): Promise<void> {
    await this.http.delete(`/api/expenses/${id}`);
  }
}
