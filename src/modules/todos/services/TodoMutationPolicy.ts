import type { NewTodo, TodoChanges } from '../domain/Todo.js';
import type { TodoMutationPlanner } from './internal/TodoMutationPlanner.js';

/** Validates todo IDs and payloads before they reach the store. */
export class TodoMutationPolicy {
  constructor(private readonly planner: TodoMutationPlanner) {}

  id(value: unknown): number {
    return this.planner.id(value);
  }

  create(payload: unknown): NewTodo {
    return this.planner.create(payload);
  }

  update(payload: unknown): TodoChanges {
    return this.planner.update(payload);
  }
}
