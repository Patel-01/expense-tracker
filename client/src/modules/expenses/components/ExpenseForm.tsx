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
  private readonly titleInput = React.createRef<HTMLInputElement>();

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
      // Ready for the next entry
      this.titleInput.current?.focus();
    } catch (error) {
      this.setState({ serverError: error instanceof Error ? error.message : "The expense wasn't saved. Try again." });
    } finally {
      this.setState({ saving: false });
    }
  };

  private described(field: keyof ExpenseFormValues) {
    const error = this.state.errors[field];
    return { 'aria-invalid': Boolean(error), 'aria-describedby': error ? `xp-${field}-error` : undefined };
  }

  private error(field: keyof ExpenseFormValues): React.ReactNode {
    const error = this.state.errors[field];
    return error && <span className="xp-field-error" id={`xp-${field}-error`}>{error}</span>;
  }

  render(): React.ReactNode {
    const { values, errors, saving, serverError } = this.state;
    return <section className="xp-add" aria-labelledby="xp-add-title">
      <h2 id="xp-add-title">Add an expense</h2>
      <form className="xp-form" onSubmit={event => void this.submit(event)} noValidate>
        <div className="xp-field xp-field-wide">
          <label htmlFor="xp-title-input">What was it for?</label>
          <div className="xp-input" data-invalid={Boolean(errors.title)}>
            <input id="xp-title-input" ref={this.titleInput} value={values.title} autoComplete="off"
              placeholder="Train to Pune" {...this.described('title')}
              onChange={event => this.change('title', event.currentTarget.value)} />
          </div>
          {this.error('title')}
        </div>

        <div className="xp-field">
          <label htmlFor="xp-amount-input">Amount</label>
          <div className="xp-input" data-invalid={Boolean(errors.amount)}>
            <span className="xp-currency" aria-hidden="true">₹</span>
            <input id="xp-amount-input" value={values.amount} inputMode="decimal" autoComplete="off"
              placeholder="450.00" {...this.described('amount')}
              onChange={event => this.change('amount', event.currentTarget.value)} />
          </div>
          {this.error('amount')}
        </div>

        <div className="xp-field">
          <label htmlFor="xp-date-input">Date <span className="xp-optional">(leave blank for today)</span></label>
          <div className="xp-input" data-invalid={Boolean(errors.date)}>
            <input id="xp-date-input" type="date" value={values.date} max={localToday()} {...this.described('date')}
              onChange={event => this.change('date', event.currentTarget.value)} />
          </div>
          {this.error('date')}
        </div>

        <fieldset className="xp-field xp-field-category" {...this.described('category')}>
          <legend>Category</legend>
          <div className="xp-chips">
            {EXPENSE_CATEGORIES.map(category => <label key={category} className="xp-chip" data-category={category}>
              <input type="radio" name="category" value={category} checked={values.category === category}
                onChange={() => this.change('category', category)} />
              <span>{category}</span>
            </label>)}
          </div>
          {this.error('category')}
        </fieldset>

        <div className="xp-form-footer">
          <Button variant="primary" type="submit" disabled={saving}>{saving ? 'Adding…' : 'Add expense'}</Button>
          {serverError && <p className="xp-server-error" role="alert">{serverError}</p>}
        </div>
      </form>
    </section>;
  }
}
