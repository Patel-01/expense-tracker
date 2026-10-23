import React from 'react';
import Button from '../../../shared/components/Button.js';

interface PagerProps {
  page: number;
  pageSize: number;
  totalCount: number;
  disabled: boolean;
  onPrevious(): void;
  onNext(): void;
}

export default class Pager extends React.Component<PagerProps> {
  render(): React.ReactNode {
    const { page, pageSize, totalCount, disabled, onPrevious, onNext } = this.props;
    const first = (page - 1) * pageSize + 1;
    const last = Math.min(page * pageSize, totalCount);
    return <nav className="xp-pager" aria-label="Expense pages">
      <span aria-live="polite">Showing {first}–{last} of {totalCount}</span>
      <span className="xp-pager-buttons">
        <Button onClick={onPrevious} disabled={disabled || page <= 1}>Previous</Button>
        <Button onClick={onNext} disabled={disabled || last >= totalCount}>Next</Button>
      </span>
    </nav>;
  }
}
