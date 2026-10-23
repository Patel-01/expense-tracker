import React from 'react';
import { formatMoney } from '../services/formatMoney.js';

interface ExpenseHeaderProps {
  /** Totals from the API, covering every matching expense rather than the visible page */
  totalAmount?: number;
  totalCount?: number;
}

export default class ExpenseHeader extends React.Component<ExpenseHeaderProps> {
  render(): React.ReactNode {
    const { totalAmount, totalCount } = this.props;
    return <header className="masthead">
      <h1>Expenses</h1>
      {totalAmount !== undefined && totalCount !== undefined && (
        <p className="tally" aria-live="polite">
          <strong>{formatMoney(totalAmount)}</strong> across {totalCount} {totalCount === 1 ? 'expense' : 'expenses'}
        </p>
      )}
    </header>;
  }
}
