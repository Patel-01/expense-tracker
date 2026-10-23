import React from 'react';
import Button from '../../../shared/components/Button.js';
import ExpenseApiClient from '../services/ExpenseApiClient.js';
import type { ExpenseCategory, ExpensePageView, NewExpenseInput } from '../types/Expense.js';
import ExpenseHeader from '../components/ExpenseHeader.js';
import ExpenseForm from '../components/ExpenseForm.js';
import CategoryFilter from '../components/CategoryFilter.js';
import ExpenseList from '../components/ExpenseList.js';
import Pager from '../components/Pager.js';

const PAGE_SIZE = 10;

interface ExpensesPageState {
  category: ExpenseCategory | '';
  page: number;
  data?: ExpensePageView;
  loading: boolean;
  loadError?: string;
  confirmingId?: number;
  deletingId?: number;
  deleteError?: string;
}

/** Page-level coordinator: owns list, filter, paging and delete state. */
export default class ExpensesPage extends React.Component<object, ExpensesPageState> {
  state: ExpensesPageState = { category: '', page: 1, loading: true };

  private readonly api = new ExpenseApiClient();
  private mounted = false;
  // Only the newest request may update state, so a slow earlier response can't overwrite it
  private latestRequest = 0;

  componentDidMount(): void {
    this.mounted = true;
    void this.load(1, '');
  }

  componentWillUnmount(): void {
    this.mounted = false;
  }

  private async load(page: number, category: ExpenseCategory | ''): Promise<void> {
    const request = ++this.latestRequest;
    this.setState({ page, category, loading: true, loadError: undefined, confirmingId: undefined });
    try {
      const data = await this.api.listExpenses({ page, limit: PAGE_SIZE, ...(category ? { category } : {}) });
      if (!this.mounted || request !== this.latestRequest) return;

      // A delete can leave the current page empty; step back to the last page that has items
      const lastPage = this.totalPages(data.total_count);
      if (data.items.length === 0 && page > lastPage) {
        void this.load(lastPage, category);
        return;
      }
      this.setState({ data, loading: false });
    } catch (error) {
      if (!this.mounted || request !== this.latestRequest) return;
      this.setState({ loading: false, loadError: error instanceof Error ? error.message : 'Request failed' });
    }
  }

  private totalPages(totalCount: number): number {
    return Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  }

  private createExpense = async (input: NewExpenseInput): Promise<void> => {
    await this.api.createExpense(input);
    // Newest first, so a new expense shows on page 1
    await this.load(1, this.state.category);
  };

  private deleteExpense = async (id: number): Promise<void> => {
    this.setState({ deletingId: id, confirmingId: undefined, deleteError: undefined });
    try {
      await this.api.deleteExpense(id);
      await this.load(this.state.page, this.state.category);
    } catch (error) {
      this.setState({ deleteError: error instanceof Error ? error.message : "Couldn't delete the expense." });
    } finally {
      if (this.mounted) this.setState({ deletingId: undefined });
    }
  };

  private renderList(): React.ReactNode {
    const { data, loading, loadError, category, page, confirmingId, deletingId } = this.state;

    if (loadError) {
      return <p className="note error" role="alert">
        Couldn't load expenses: {loadError}
        <Button onClick={() => void this.load(page, category)}>Retry</Button>
      </p>;
    }
    if (!data) return <p className="note">Loading expenses…</p>;
    if (data.total_count === 0) {
      return <p className="note">
        {category ? `No ${category} expenses yet.` : 'No expenses yet. Add your first one above.'}
      </p>;
    }

    return <div className="expense-results" aria-busy={loading}>
      <ExpenseList
        items={data.items}
        confirmingId={confirmingId}
        deletingId={deletingId}
        onAskDelete={id => this.setState({ confirmingId: id, deleteError: undefined })}
        onCancelDelete={() => this.setState({ confirmingId: undefined })}
        onConfirmDelete={id => void this.deleteExpense(id)}
      />
      <Pager
        page={page}
        totalPages={this.totalPages(data.total_count)}
        disabled={loading}
        onPrevious={() => void this.load(page - 1, category)}
        onNext={() => void this.load(page + 1, category)}
      />
    </div>;
  }

  render(): React.ReactNode {
    const { data, loadError, category, deleteError } = this.state;
    const showTotals = data && !loadError;
    return <main className="sheet">
      <ExpenseHeader totalAmount={showTotals ? data.total_amount : undefined} totalCount={showTotals ? data.total_count : undefined} />
      <ExpenseForm onSubmit={this.createExpense} />
      <CategoryFilter value={category} onChange={value => void this.load(1, value)} />
      {deleteError && <p className="note error" role="alert">
        {deleteError}
        <Button onClick={() => this.setState({ deleteError: undefined })}>Dismiss</Button>
      </p>}
      {this.renderList()}
    </main>;
  }
}
