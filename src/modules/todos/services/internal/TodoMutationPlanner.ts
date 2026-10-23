import type { NewTodo, TodoChanges } from '../../domain/Todo.js';

export interface TodoMutationPlanner {
  id(value: unknown): number;
  create(payload: unknown): NewTodo;
  update(payload: unknown): TodoChanges;
}
