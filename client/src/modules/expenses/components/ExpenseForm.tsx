import React from 'react';
import Button from '../../../shared/components/Button.js';
import ExpenseFormValidator, { localToday } from '../services/ExpenseFormValidator.js';
import { EXPENSE_CATEGORIES, type ExpenseFormErrors, type ExpenseFormValues, type NewExpenseInput } from '../types/Expense.js';

interface ExpenseFormProps {
  onSubmit(input: NewExpenseInput): Promise<void>;
}

interface ExpenseFormState {
  values: ExpenseFormValues;
  errors: ExpenseFormErrors;
  /** Once a submit was attempted, errors update as the user types */
  attempted: boolean;
  saving: boolean;
  serverError?: string;
}

const emptyForm: ExpenseFormValues = { title: '', amount: '', category: '', date: '' };

export default class ExpenseForm extends React.Component<ExpenseFormProps, ExpenseFormState> {
  state: ExpenseFormState = { values: emptyForm, errors: {}, attempted: false, saving: false };

  private readonly validator = new ExpenseFormValidator();

  private change(field: keyof ExpenseFormValues, value: string): void {
    this.setState(state => {
      const values = { ...state.values, [field]: value };
      return { values, errors: state.attempted ? this.validator.validate(values) : state.errors };
    });
  }

  private readonly submit = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();
    if (this.state.saving) return;

    const errors = this.validator.validate(this.state.values);
    this.setState({ errors, attempted: true, serverError: undefined });
    if (Object.keys(errors).length > 0) return;

    this.setState({ saving: true });
    try {
      await this.props.onSubmit(this.validator.toInput(this.state.values));
      this.setState({ values: emptyForm, errors: {}, attempted: false });
    } catch (error) {
      this.setState({ serverError: error instanceof Error ? error.message : "Couldn't save the expense." });
    } finally {
      this.setState({ saving: false });
    }
  };

  private fieldProps(field: keyof ExpenseFormValues) {
    const error = this.state.errors[field];
    return {
      id: `expense-${field}`,
      value: this.state.values[field],
      'aria-invalid': Boolean(error),
      'aria-describedby': error ? `expense-${field}-error` : undefined
    };
  }

  private error(field: keyof ExpenseFormValues): React.ReactNode {
    const error = this.state.errors[field];
    return error && <span className="field-error" id={`expense-${field}-error`}>{error}</span>;
  }

  render(): React.ReactNode {
    const { saving, serverError } = this.state;
    return <form className="expense-form" onSubmit={event => void this.submit(event)} noValidate>
      <div className="field field-title">
        <label htmlFor="expense-title">Title</label>
        <input {...this.fieldProps('title')} maxLength={200} autoComplete="off" placeholder="e.g. Train to Pune"
          onChange={event => this.change('title', event.currentTarget.value)} />
        {this.error('title')}
      </div>
      <div className="field">
        <label htmlFor="expense-amount">Amount</label>
        <input {...this.fieldProps('amount')} inputMode="decimal" autoComplete="off" placeholder="0.00"
          onChange={event => this.change('amount', event.currentTarget.value)} />
        {this.error('amount')}
      </div>
      <div className="field">
        <label htmlFor="expense-category">Category</label>
        <select {...this.fieldProps('category')} onChange={event => this.change('category', event.currentTarget.value)}>
          <option value="" disabled>Choose…</option>
          {EXPENSE_CATEGORIES.map(category => <option key={category} value={category}>{category}</option>)}
        </select>
        {this.error('category')}
      </div>
      <div className="field">
        <label htmlFor="expense-date">Date <span className="hint">(optional, defaults to today)</span></label>
        <input {...this.fieldProps('date')} type="date" max={localToday()}
          onChange={event => this.change('date', event.currentTarget.value)} />
        {this.error('date')}
      </div>
      {serverError && <p className="note error form-error" role="alert">{serverError}</p>}
      <div className="form-actions">
        <Button variant="primary" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Add expense'}</Button>
      </div>
    </form>;
  }
}
