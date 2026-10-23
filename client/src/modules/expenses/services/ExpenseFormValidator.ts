import { EXPENSE_CATEGORIES, type ExpenseFormErrors, type ExpenseFormValues, type NewExpenseInput } from '../types/Expense.js';

const MAX_TITLE_LENGTH = 100;
const MAX_AMOUNT = 10_000_000_000;

/** Today's date as YYYY-MM-DD in the browser's time zone. */
export function localToday(): string {
  return new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}

/** Mirrors the backend rules in DefaultExpenseRequestPlanner; the server stays the source of truth. */
export default class ExpenseFormValidator {
  validate(values: ExpenseFormValues, today = localToday()): ExpenseFormErrors {
    const errors: ExpenseFormErrors = {};

    const title = values.title.trim();
    if (!title) errors.title = 'Enter a title.';
    else if ([...title].length > MAX_TITLE_LENGTH) errors.title = `Keep the title to ${MAX_TITLE_LENGTH} characters or fewer.`;

    const amount = values.amount.trim();
    if (!amount) errors.amount = 'Enter an amount.';
    else if (!/^\d+(\.\d{1,2})?$/.test(amount)) errors.amount = 'Use a number with at most 2 decimal places.';
    else if (Number(amount) <= 0) errors.amount = 'Amount must be more than 0.';
    else if (Number(amount) >= MAX_AMOUNT) errors.amount = 'That amount is too large.';

    if (!(EXPENSE_CATEGORIES as readonly string[]).includes(values.category)) errors.category = 'Choose a category.';

    if (values.date) {
      if (!this.isCalendarDate(values.date)) errors.date = 'Enter a valid date.';
      else if (values.date > today) errors.date = "Date can't be in the future.";
    }

    return errors;
  }

  toInput(values: ExpenseFormValues): NewExpenseInput {
    return {
      title: values.title.trim(),
      amount: Number(values.amount.trim()),
      category: values.category as NewExpenseInput['category'],
      ...(values.date ? { date: values.date } : {})
    };
  }

  private isCalendarDate(value: string): boolean {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) return false;
    const parsed = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
    return parsed.toISOString().slice(0, 10) === value;
  }
}
