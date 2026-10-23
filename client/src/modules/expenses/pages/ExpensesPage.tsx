import React from 'react';
import Button from '../../../shared/components/Button.js';
import ExpenseApiClient from '../services/ExpenseApiClient.js';
import { localToday } from '../services/ExpenseFormValidator.js';
import { formatMoney, shiftMonth } from '../services/format.js';
import type { CategoryTotals, ExpenseCategory, ExpensePageView, NewExpenseInput } from '../types/Expense.js';
import MonthOverview from '../components/MonthOverview.js';
import ExpenseForm from '../components/ExpenseForm.js';
import CategoryFilter from '../components/CategoryFilter.js';
import ExpenseList from '../components/ExpenseList.js';
import Pager from '../components/Pager.js';
import '../expenses.css';

const PAGE_SIZE = 10;

interface ExpensesPageState {
  // Entries list
  category: ExpenseCategory | '';
  page: number;
  data?: ExpensePageView;
  loading: boolean;
  loadError?: string;
  confirmingId?: number;
  deletingId?: number;
  deleteError?: string;
  // Month overview
  month: string;
  monthTotals?: CategoryTotals;
  monthError?: string;
}

/** Page-level coordinator: owns the month overview, list, filter, paging and delete state. */
export default class ExpensesPage extends React.Component<object, ExpensesPageState> {
  state: ExpensesPageState = { category: '', page: 1, loading: true, month: localToday().slice(0, 7) };

  private readonly api = new ExpenseApiClient();
  private mounted = false;
  // Only the newest request of each kind may update state, so slow earlier responses can't overwrite it
  private latestList = 0;
  private latestSummary = 0;

  componentDidMount(): void {
    this.mounted = true;
    void this.load(1, '');
    void this.loadSummary(this.state.month);
  }

  componentWillUnmount(): void {
    this.mounted = false;
  }

  private async load(page: number, category: ExpenseCategory | ''): Promise<void> {
    const request = ++this.latestList;
    this.setState({ page, category, loading: true, loadError: undefined, confirmingId: undefined });
    try {
      const data = await this.api.listExpenses({ page, limit: PAGE_SIZE, ...(category ? { category } : {}) });
      if (!this.mounted || request !== this.latestList) return;

      // A delete can leave the current page empty; step back to the last page that has items
      const lastPage = Math.max(1, Math.ceil(data.total_count / PAGE_SIZE));
      if (data.items.length === 0 && page > lastPage) {
        void this.load(lastPage, category);
        return;
      }
      this.setState({ data, loading: false });
    } catch (error) {
      if (!this.mounted || request !== this.latestList) return;
      this.setState({ loading: false, loadError: this.message(error) });
    }
  }

  private async loadSummary(month: string): Promise<void> {
    const request = ++this.latestSummary;
    this.setState({ month, monthTotals: undefined, monthError: undefined });
    try {
      const summary = await this.api.monthSummary(month);
      if (this.mounted && request === this.latestSummary) this.setState({ monthTotals: summary.totals });
    } catch (error) {
      if (this.mounted && request === this.latestSummary) this.setState({ monthError: this.message(error) });
    }
  }

  private refreshAll(page: number): Promise<unknown> {
    return Promise.all([this.load(page, this.state.category), this.loadSummary(this.state.month)]);
  }

  private createExpense = async (input: NewExpenseInput): Promise<void> => {
    await this.api.createExpense(input);
    // Newest first, so a new expense shows on page 1
    await this.refreshAll(1);
  };

  private deleteExpense = async (id: number): Promise<void> => {
    this.setState({ deletingId: id, confirmingId: undefined, deleteError: undefined });
    try {
      await this.api.deleteExpense(id);
      await this.refreshAll(this.state.page);
    } catch (error) {
      this.setState({ deleteError: `That expense wasn't deleted: ${this.message(error)}` });
    } finally {
      if (this.mounted) this.setState({ deletingId: undefined });
    }
  };

  private message(error: unknown): string {
    return error instanceof Error ? error.message : 'Request failed';
  }

  private renderEntries(): React.ReactNode {
    const { data, loading, loadError, category, page, confirmingId, deletingId } = this.state;

    if (loadError) {
      return <p className="xp-state xp-state-error" role="alert">
        Couldn't load expenses: {loadError}
        <Button onClick={() => void this.load(page, category)}>Try again</Button>
      </p>;
    }
    if (!data) return <p className="xp-state">Loading expenses…</p>;
    if (data.total_count === 0) {
      return <p className="xp-state">
        {category
          ? `No ${category} expenses yet. Pick another category or add one above.`
          : 'No expenses yet. Add your first one above and it will show up here.'}
      </p>;
    }

    return <>
      {/* Totals come from the API and cover every matching expense, not just this page */}
      <p className="xp-filter-total" aria-live="polite">
        <strong>{formatMoney(data.total_amount)}</strong> across {data.total_count}{' '}
        {category ? `${category} ` : ''}{data.total_count === 1 ? 'expense' : 'expenses'}
      </p>
      <ExpenseList
        items={data.items}
        busy={loading}
        confirmingId={confirmingId}
        deletingId={deletingId}
        onAskDelete={id => this.setState({ confirmingId: id, deleteError: undefined })}
        onCancelDelete={() => this.setState({ confirmingId: undefined })}
        onConfirmDelete={id => void this.deleteExpense(id)}
      />
      <Pager
        page={page}
        pageSize={PAGE_SIZE}
        totalCount={data.total_count}
        disabled={loading}
        onPrevious={() => void this.load(page - 1, category)}
        onNext={() => void this.load(page + 1, category)}
      />
    </>;
  }

  render(): React.ReactNode {
    const { month, monthTotals, monthError, category, deleteError } = this.state;
    return <main className="xp">
      <MonthOverview
        month={month}
        totals={monthTotals}
        error={monthError}
        canGoNext={month < localToday().slice(0, 7)}
        onPrevious={() => void this.loadSummary(shiftMonth(month, -1))}
        onNext={() => void this.loadSummary(shiftMonth(month, 1))}
        onRetry={() => void this.loadSummary(month)}
      />
      <ExpenseForm onSubmit={this.createExpense} />
      <section className="xp-entries" aria-labelledby="xp-entries-title">
        <div className="xp-entries-head">
          <h2 id="xp-entries-title">All entries</h2>
          <CategoryFilter value={category} onChange={value => void this.load(1, value)} />
        </div>
        {deleteError && <p className="xp-banner" role="alert">
          {deleteError}
          <Button variant="quiet" onClick={() => this.setState({ deleteError: undefined })}>Dismiss</Button>
        </p>}
        {this.renderEntries()}
      </section>
    </main>;
  }
}
