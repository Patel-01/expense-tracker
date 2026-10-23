import React from 'react';
import Button from '../../../shared/components/Button.js';
import { formatMoney, formatMonth } from '../services/format.js';
import { EXPENSE_CATEGORIES, type CategoryTotals } from '../types/Expense.js';

interface MonthOverviewProps {
  month: string;
  totals?: CategoryTotals;
  error?: string;
  canGoNext: boolean;
  onPrevious(): void;
  onNext(): void;
  onRetry(): void;
}

/** Hero: what the month cost, split by category from GET /expenses/summary. */
export default class MonthOverview extends React.Component<MonthOverviewProps> {
  private body(): React.ReactNode {
    const { month, totals, error, onRetry } = this.props;
    if (error) {
      return <p className="xp-overview-status xp-state-error" role="alert">
        Couldn't load {formatMonth(month, 'name')}'s summary: {error}
        <Button onClick={onRetry}>Try again</Button>
      </p>;
    }
    if (!totals) return <p className="xp-overview-status">Adding up {formatMonth(month, 'name')}…</p>;

    const spent = EXPENSE_CATEGORIES.reduce((sum, category) => sum + totals[category], 0);
    return <>
      <p className="xp-spent">{formatMoney(spent)}</p>
      <p className="xp-spent-caption">
        {spent === 0 ? `Nothing spent in ${formatMonth(month, 'name')} yet.` : `spent in ${formatMonth(month)}`}
      </p>
      {spent > 0 && (
        // The key restarts the grow animation whenever the month or its totals change
        <div className="xp-strip" key={`${month}-${spent}`} aria-hidden="true">
          {EXPENSE_CATEGORIES.filter(category => totals[category] > 0).map(category =>
            <span key={category} className="xp-strip-segment" data-category={category}
              style={{ flexGrow: totals[category] }} />)}
        </div>
      )}
      <ul className="xp-legend" aria-label={`Spending by category in ${formatMonth(month)}`}>
        {EXPENSE_CATEGORIES.map(category => <li key={category} data-category={category}>
          <span className="xp-swatch" aria-hidden="true" />
          <span className="xp-legend-name">{category}</span>
          <span className="xp-legend-amount">{formatMoney(totals[category])}</span>
        </li>)}
      </ul>
    </>;
  }

  render(): React.ReactNode {
    const { month, canGoNext, onPrevious, onNext } = this.props;
    return <section className="xp-overview" aria-labelledby="xp-title">
      <div className="xp-month-bar">
        <h1 id="xp-title">Expenses</h1>
        <div className="xp-month-nav">
          <Button onClick={onPrevious} aria-label="Previous month">‹</Button>
          <span className="xp-month-name" aria-live="polite">{formatMonth(month)}</span>
          <Button onClick={onNext} disabled={!canGoNext} aria-label="Next month">›</Button>
        </div>
      </div>
      {this.body()}
    </section>;
  }
}
