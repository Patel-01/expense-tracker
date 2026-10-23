import RequestValidationError from '../../../../shared/errors/RequestValidationError.js';
import {
  EXPENSE_CATEGORIES,
  type ExpenseCategory,
  type ExpenseListQuery,
  type MonthRange,
  type NewExpense
} from '../../domain/Expense.js';
import type { ExpenseRequestPlanner } from './ExpenseRequestPlanner.js';

const MAX_TITLE_LENGTH = 100;
// numeric(12, 2) holds up to 9,999,999,999.99
const MAX_AMOUNT = 10_000_000_000;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;
const MAX_PAGE = 1_000_000;

/** Internal request validation for expense creation and queries. */
export default class DefaultExpenseRequestPlanner implements ExpenseRequestPlanner {
  /** `today` returns the current calendar date as YYYY-MM-DD in the app's time zone. */
  constructor(private readonly today: () => string) {}

  id(value: unknown): number {
    const id = typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : NaN;
    if (!Number.isSafeInteger(id) || id < 1) throw new RequestValidationError('Expense ID must be a positive integer');
    return id;
  }

  create(payload: unknown): NewExpense {
    const body = this.object(payload, 'Request body');
    const unexpected = Object.keys(body).find(key => !['title', 'amount', 'category', 'date'].includes(key));
    if (unexpected) throw new RequestValidationError(`Unknown field: ${unexpected}`);

    const date = body.date === undefined || body.date === null ? this.today() : this.date(body.date, 'date');
    if (date > this.today()) throw new RequestValidationError('date cannot be in the future');

    return {
      title: this.title(body.title),
      amount: this.amount(body.amount),
      category: this.category(body.category),
      date
    };
  }

  listQuery(query: unknown): ExpenseListQuery {
    const params = this.object(query, 'Query');
    const category = this.param(params.category, 'category');
    const from = this.param(params.from, 'from');
    const to = this.param(params.to, 'to');
    const page = this.param(params.page, 'page');
    const limit = this.param(params.limit, 'limit');

    const result: ExpenseListQuery = {
      page: page === undefined ? 1 : this.positiveInteger(page, 'page', MAX_PAGE),
      limit: limit === undefined ? DEFAULT_LIMIT : this.positiveInteger(limit, 'limit', MAX_LIMIT)
    };
    if (category !== undefined) result.category = this.category(category);
    if (from !== undefined) result.from = this.date(from, 'from');
    if (to !== undefined) result.to = this.date(to, 'to');
    if (result.from && result.to && result.from > result.to) {
      throw new RequestValidationError('from must be on or before to');
    }
    return result;
  }

  month(query: unknown): MonthRange {
    const month = this.param(this.object(query, 'Query').month, 'month');
    const match = month === undefined ? null : /^(\d{4})-(0[1-9]|1[0-2])$/.exec(month);
    if (!month || !match) throw new RequestValidationError('month must be in YYYY-MM format');

    // Date.UTC months are 0-based, so passing the 1-based month gives the first of the next month
    const next = new Date(Date.UTC(Number(match[1]), Number(match[2]), 1)).toISOString().slice(0, 10);
    return { month, from: `${month}-01`, to: next };
  }

  private object(value: unknown, label: string): Record<string, unknown> {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
      throw new RequestValidationError(`${label} must be an object`);
    }
    return value as Record<string, unknown>;
  }

  /** Query parameters are optional single strings; an empty value means "not set". */
  private param(value: unknown, field: string): string | undefined {
    if (value === undefined || value === '') return undefined;
    if (typeof value !== 'string') throw new RequestValidationError(`${field} must be a single value`);
    return value;
  }

  private title(value: unknown): string {
    if (typeof value !== 'string' || !value.trim()) throw new RequestValidationError('title is required');
    const title = value.trim();
    // Count code points, as Postgres char_length does, not UTF-16 units
    if ([...title].length > MAX_TITLE_LENGTH) {
      throw new RequestValidationError(`title must be at most ${MAX_TITLE_LENGTH} characters`);
    }
    return title;
  }

  private amount(value: unknown): number {
    if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
      throw new RequestValidationError('amount must be a number greater than 0');
    }
    // String form avoids float artefacts such as 0.29 * 100 = 28.999999999999996
    if (!/^\d+(\.\d{1,2})?$/.test(String(value))) {
      throw new RequestValidationError('amount can have at most 2 decimal places');
    }
    if (value >= MAX_AMOUNT) throw new RequestValidationError('amount is too large');
    return value;
  }

  private category(value: unknown): ExpenseCategory {
    if (typeof value !== 'string' || !(EXPENSE_CATEGORIES as readonly string[]).includes(value)) {
      throw new RequestValidationError(`category must be one of: ${EXPENSE_CATEGORIES.join(', ')}`);
    }
    return value as ExpenseCategory;
  }

  private date(value: unknown, field: string): string {
    const match = typeof value === 'string' ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(value) : null;
    if (!match) throw new RequestValidationError(`${field} must be a date in YYYY-MM-DD format`);
    // Round-trip through UTC to reject impossible dates such as 2026-02-30
    const parsed = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
    if (parsed.toISOString().slice(0, 10) !== value) throw new RequestValidationError(`${field} is not a valid date`);
    return value as string;
  }

  private positiveInteger(value: string, field: string, max: number): number {
    const number = /^\d+$/.test(value) ? Number(value) : NaN;
    if (!Number.isSafeInteger(number) || number < 1 || number > max) {
      throw new RequestValidationError(`${field} must be an integer from 1 to ${max}`);
    }
    return number;
  }
}
