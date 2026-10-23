import assert from 'node:assert/strict';
import test from 'node:test';
import type { Request, Response } from 'express';
import TodoController from './TodoController.js';
import type { NewTodo, Todo, TodoChanges } from '../domain/Todo.js';
import type { TodoStore } from '../ports/TodoStore.js';
import { TodoMutationPolicy } from '../services/TodoMutationPolicy.js';
import DefaultTodoMutationPlanner from '../services/internal/DefaultTodoMutationPlanner.js';
import RequestValidationError from '../../../shared/errors/RequestValidationError.js';

class InMemoryTodoStore implements TodoStore {
  private todos: Todo[] = [];
  private nextId = 1;

  async create(input: NewTodo): Promise<Todo> {
    const todo = { id: this.nextId++, task: input.task, done: false, createdAt: new Date() };
    this.todos.unshift(todo);
    return todo;
  }

  async list(): Promise<Todo[]> {
    return [...this.todos];
  }

  async update(id: number, changes: TodoChanges): Promise<Todo | null> {
    const todo = this.todos.find(candidate => candidate.id === id);
    return todo ? Object.assign(todo, changes) : null;
  }

  async remove(id: number): Promise<boolean> {
    const before = this.todos.length;
    this.todos = this.todos.filter(todo => todo.id !== id);
    return this.todos.length < before;
  }
}

function call(handler: TodoController['create'], request: Partial<Request>) {
  const result: { status: number; body?: unknown; error?: unknown } = { status: 200 };
  const response = {
    status(code: number) { result.status = code; return this; },
    json(body: unknown) { result.body = body; return this; },
    send() { return this; }
  } as unknown as Response;
  return handler({ params: {}, ...request } as Request, response, error => { result.error = error; }).then(() => result);
}

function setup() {
  return new TodoController(new InMemoryTodoStore(), new TodoMutationPolicy(new DefaultTodoMutationPlanner()));
}

test('create returns 201 with the stored todo', async () => {
  const result = await call(setup().create, { body: { task: 'Write tests' } });
  assert.equal(result.status, 201);
  assert.equal((result.body as Todo).task, 'Write tests');
});

test('invalid input is passed to the error handler as a validation error', async () => {
  const result = await call(setup().create, { body: { task: '' } });
  assert.ok(result.error instanceof RequestValidationError);
});

test('update and remove return 404 for unknown IDs', async () => {
  const controller = setup();
  assert.equal((await call(controller.update, { params: { id: '7' }, body: { done: true } })).status, 404);
  assert.equal((await call(controller.remove, { params: { id: '7' } })).status, 404);
});

test('update toggles done and remove returns 204', async () => {
  const controller = setup();
  await call(controller.create, { body: { task: 'Ship it' } });
  const updated = await call(controller.update, { params: { id: '1' }, body: { done: true } });
  assert.equal((updated.body as Todo).done, true);
  assert.equal((await call(controller.remove, { params: { id: '1' } })).status, 204);
});
