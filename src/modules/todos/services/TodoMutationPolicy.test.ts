import assert from 'node:assert/strict';
import test from 'node:test';
import { TodoMutationPolicy } from './TodoMutationPolicy.js';
import DefaultTodoMutationPlanner from './internal/DefaultTodoMutationPlanner.js';

const policy = new TodoMutationPolicy(new DefaultTodoMutationPlanner());

test('creation trims the task and rejects blank or missing tasks', () => {
  assert.deepEqual(policy.create({ task: '  Buy milk  ' }), { task: 'Buy milk' });
  assert.throws(() => policy.create({ task: '   ' }), /task is required/);
  assert.throws(() => policy.create({}), /task must be a string/);
});

test('clients cannot set server-owned fields', () => {
  assert.throws(() => policy.create({ task: 'Buy milk', done: true }), /not editable: done/);
  assert.throws(() => policy.update({ id: 5 }), /not editable: id/);
  assert.throws(() => policy.update({ created_at: '2026-01-01' }), /not editable/);
});

test('updates accept task and done with strict types', () => {
  assert.deepEqual(policy.update({ done: true }), { done: true });
  assert.deepEqual(policy.update({ task: ' Renamed ', done: false }), { task: 'Renamed', done: false });
  assert.throws(() => policy.update({ done: 'true' }), /done must be a boolean/);
  assert.throws(() => policy.update({}), /at least one editable field/);
  assert.throws(() => policy.update(null), /must be an object/);
});

test('IDs must be positive integers', () => {
  assert.equal(policy.id('42'), 42);
  for (const bad of ['0', '-1', '1.5', 'abc', '', undefined, '99999999999999999999']) {
    assert.throws(() => policy.id(bad), /positive integer/);
  }
});
