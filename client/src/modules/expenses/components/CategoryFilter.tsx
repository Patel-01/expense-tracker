import React from 'react';
import Button from '../../../shared/components/Button.js';
import { EXPENSE_CATEGORIES, type ExpenseCategory } from '../types/Expense.js';

interface CategoryFilterProps {
  value: ExpenseCategory | '';
  onChange(value: ExpenseCategory | ''): void;
}

export default class CategoryFilter extends React.Component<CategoryFilterProps> {
  render(): React.ReactNode {
    const { value, onChange } = this.props;
    const options: (ExpenseCategory | '')[] = ['', ...EXPENSE_CATEGORIES];
    return <div className="xp-filter" role="group" aria-label="Filter by category">
      {options.map(option => <Button key={option || 'all'} aria-pressed={value === option} onClick={() => onChange(option)}>
        {option || 'All'}
      </Button>)}
    </div>;
  }
}
