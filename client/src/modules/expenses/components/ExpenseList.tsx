import React from 'react';
import Button from '../../../shared/components/Button.js';
import { formatDate, formatMoney } from '../services/formatMoney.js';
import type { ExpenseView } from '../types/Expense.js';

interface ExpenseListProps {
  items: ExpenseView[];
  confirmingId?: number;
  deletingId?: number;
  onAskDelete(id: number): void;
  onCancelDelete(): void;
  onConfirmDelete(id: number): void;
}

export default class ExpenseList extends React.Component<ExpenseListProps> {
  private actions(expense: ExpenseView): React.ReactNode {
    const { confirmingId, deletingId, onAskDelete, onCancelDelete, onConfirmDelete } = this.props;
    if (deletingId === expense.id) return <span className="hint">Deleting…</span>;
    if (confirmingId === expense.id) {
      return <span className="confirm" role="group" aria-label={`Confirm deleting "${expense.title}"`}>
        Delete?
        <Button variant="quiet" onClick={() => onConfirmDelete(expense.id)}>Yes</Button>
        <Button variant="quiet" onClick={onCancelDelete}>Cancel</Button>
      </span>;
    }
    return <Button variant="quiet" onClick={() => onAskDelete(expense.id)} disabled={deletingId !== undefined}
      aria-label={`Delete "${expense.title}"`}>Delete</Button>;
  }

  render(): React.ReactNode {
    return <ul className="list">
      {this.props.items.map(expense => <li key={expense.id} className="line expense" aria-busy={this.props.deletingId === expense.id}>
        <span className="expense-date">{formatDate(expense.date)}</span>
        <span className="expense-title">
          {expense.title}
          <span className={`tag tag-${expense.category}`}>{expense.category}</span>
        </span>
        <span className="expense-amount">{formatMoney(expense.amount)}</span>
        <span className="expense-actions">{this.actions(expense)}</span>
      </li>)}
    </ul>;
  }
}
