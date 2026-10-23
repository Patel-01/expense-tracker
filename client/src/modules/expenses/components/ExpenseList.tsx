import React from 'react';
import Button from '../../../shared/components/Button.js';
import { formatDate, formatMoney } from '../services/format.js';
import type { ExpenseView } from '../types/Expense.js';

interface ExpenseListProps {
  items: ExpenseView[];
  busy: boolean;
  confirmingId?: number;
  deletingId?: number;
  onAskDelete(id: number): void;
  onCancelDelete(): void;
  onConfirmDelete(id: number): void;
}

export default class ExpenseList extends React.Component<ExpenseListProps> {
  private actions(expense: ExpenseView): React.ReactNode {
    const { confirmingId, deletingId, onAskDelete, onCancelDelete, onConfirmDelete } = this.props;
    if (deletingId === expense.id) return <span className="xp-confirm-text">Deleting…</span>;
    if (confirmingId === expense.id) {
      return <span className="xp-row-actions" role="group" aria-label={`Confirm deleting ${expense.title}`}>
        <span className="xp-confirm-text">Delete?</span>
        <Button variant="quiet" onClick={() => onConfirmDelete(expense.id)}>Yes</Button>
        <Button variant="quiet" onClick={onCancelDelete}>Keep</Button>
      </span>;
    }
    return <Button variant="quiet" onClick={() => onAskDelete(expense.id)} disabled={deletingId !== undefined}
      aria-label={`Delete ${expense.title}`}>Delete</Button>;
  }

  render(): React.ReactNode {
    const { items, busy, deletingId } = this.props;
    return <ul className="xp-list" aria-busy={busy}>
      {items.map(expense => <li key={expense.id} className="xp-row" data-category={expense.category}
        aria-busy={deletingId === expense.id}>
        <span className="xp-row-date">{formatDate(expense.date)}</span>
        <span className="xp-row-title">
          {expense.title}
          <span className="xp-row-category">{expense.category}</span>
        </span>
        <span className="xp-row-amount">{formatMoney(expense.amount)}</span>
        <span className="xp-row-actions">{this.actions(expense)}</span>
      </li>)}
    </ul>;
  }
}
