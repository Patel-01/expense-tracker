import React from 'react';
import Button from '../../../shared/components/Button.js';

interface PagerProps {
  page: number;
  totalPages: number;
  disabled: boolean;
  onPrevious(): void;
  onNext(): void;
}

export default class Pager extends React.Component<PagerProps> {
  render(): React.ReactNode {
    const { page, totalPages, disabled, onPrevious, onNext } = this.props;
    return <nav className="pager" aria-label="Expense pages">
      <Button onClick={onPrevious} disabled={disabled || page <= 1}>← Previous</Button>
      <span aria-live="polite">Page {page} of {totalPages}</span>
      <Button onClick={onNext} disabled={disabled || page >= totalPages}>Next →</Button>
    </nav>;
  }
}
