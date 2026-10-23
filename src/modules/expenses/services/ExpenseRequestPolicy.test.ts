import assert from 'node:assert/strict';
import test from 'node:test';
import { ExpenseRequestPolicy } from './ExpenseRequestPolicy.js';
import DefaultExpenseRequestPlanner from './internal/DefaultExpenseRequestPlanner.js';

const TODAY = '2026-10-23';
const policy = new ExpenseRequestPolicy(new DefaultExpenseRequestPlanner(() => TODAY));
const valid = { title: 'Lunch', amount: 12.5, category: 'food' };

test('creation trims the title and defaults the date to today', () => {
  assert.deepEqual(policy.create({ ...valid, title: '  Lunch  ' }), { ...valid, date: TODAY });
  assert.equal(policy.create({ ...valid, date: '2026-01-31' }).date, '2026-01-31');
});

test('title is required and at most 100 characters', () => {
  assert.throws(() => policy.create({ ...valid, title: '   ' }), /title is required/);
  assert.throws(() => policy.create({ ...valid, title: undefined }), /title is required/);
  assert.equal(policy.create({ ...valid, title: 'x'.repeat(100) }).title.length, 100);
  assert.throws(() => policy.create({ ...valid, title: 'x'.repeat(101) }), /at most 100/);
});

test('amount must be a positive number with at most 2 decimals', () => {
  for (const amount of [0.1, 0.29, 1, 19.99, 1234.5]) {
    assert.equal(policy.create({ ...valid, amount }).amount, amount);
  }
  assert.throws(() => policy.create({ ...valid, amount: 0 }), /greater than 0/);
  assert.throws(() => policy.create({ ...valid, amount: -5 }), /greater than 0/);
  assert.throws(() => policy.create({ ...valid, amount: '12' }), /greater than 0/);
  assert.throws(() => policy.create({ ...valid, amount: 1.234 }), /2 decimal places/);
  assert.throws(() => policy.create({ ...valid, amount: 1e10 }), /too large/);
});

test('category must be one of the allowed values', () => {
  assert.throws(() => policy.create({ ...valid, category: 'rent' }), /category must be one of/);
  assert.throws(() => policy.create({ ...valid, category: 'Food' }), /category must be one of/);
});

test('date must be a real YYYY-MM-DD date that is not in the future', () => {
  assert.throws(() => policy.create({ ...valid, date: '2026-10-24' }), /cannot be in the future/);
  assert.throws(() => policy.create({ ...valid, date: '2026-02-30' }), /not a valid date/);
  assert.throws(() => policy.create({ ...valid, date: '23/10/2026' }), /YYYY-MM-DD/);
  assert.throws(() => policy.create({ ...valid, extra: 1 }), /Unknown field: extra/);
});

test('list query applies defaults and validates filters', () => {
  assert.deepEqual(policy.listQuery({}), { page: 1, limit: 10 });
  assert.deepEqual(
    policy.listQuery({ category: 'travel', from: '2026-10-01', to: '2026-10-31', page: '2', limit: '5' }),
    { category: 'travel', from: '2026-10-01', to: '2026-10-31', page: 2, limit: 5 }
  );
  assert.deepEqual(policy.listQuery({ category: '' }), { page: 1, limit: 10 });
  assert.throws(() => policy.listQuery({ page: '0' }), /page must be an integer/);
  assert.throws(() => policy.listQuery({ limit: '101' }), /limit must be an integer from 1 to 100/);
  assert.throws(() => policy.listQuery({ limit: '2.5' }), /limit must be an integer/);
  assert.throws(() => policy.listQuery({ category: 'rent' }), /category must be one of/);
  assert.throws(() => policy.listQuery({ from: '2026-10-31', to: '2026-10-01' }), /from must be on or before to/);
  assert.throws(() => policy.listQuery({ category: ['food', 'bills'] }), /single value/);
});

test('month becomes a half-open date range', () => {
  assert.deepEqual(policy.month({ month: '2026-10' }), { month: '2026-10', from: '2026-10-01', to: '2026-11-01' });
  assert.deepEqual(policy.month({ month: '2026-12' }), { month: '2026-12', from: '2026-12-01', to: '2027-01-01' });
  assert.throws(() => policy.month({ month: '2026-13' }), /YYYY-MM/);
  assert.throws(() => policy.month({}), /YYYY-MM/);
});

test('IDs must be positive integers', () => {
  assert.equal(policy.id('7'), 7);
  assert.throws(() => policy.id('abc'), /positive integer/);
  assert.throws(() => policy.id('0'), /positive integer/);
});
