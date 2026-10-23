import React from 'react';
import { EXPENSE_CATEGORIES, type ExpenseCategory } from '../types/Expense.js';

interface CategoryFilterProps {
  value: ExpenseCategory | '';
  onChange(value: ExpenseCategory | ''): void;
}

export default class CategoryFilter extends React.Component<CategoryFilterProps> {
  render(): React.ReactNode {
    return <div className="filter-bar">
      <label htmlFor="category-filter">Show</label>
      <select id="category-filter" value={this.props.value}
        onChange={event => this.props.onChange(event.currentTarget.value as ExpenseCategory | '')}>
        <option value="">All categories</option>
        {EXPENSE_CATEGORIES.map(category => <option key={category} value={category}>{category}</option>)}
      </select>
    </div>;
  }
}
