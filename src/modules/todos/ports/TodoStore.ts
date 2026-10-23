import type { NewTodo, Todo, TodoChanges } from '../domain/Todo.js';

// Dependency boundary: the controller does not depend on Supabase.
export interface TodoStore {
  create(input: NewTodo): Promise<Todo>;
  list(): Promise<Todo[]>;
  update(id: number, changes: TodoChanges): Promise<Todo | null>;
  remove(id: number): Promise<boolean>;
}
