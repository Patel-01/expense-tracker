import type { PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import { TODO_TABLE, type TodoRow } from '../models/TodoRow.js';
import type { NewTodo, Todo, TodoChanges } from '../domain/Todo.js';
import type { TodoStore } from '../ports/TodoStore.js';

/** Persistence adapter between the API model and the Postgres `todos` table. */
export default class TodoRepository implements TodoStore {
  constructor(private readonly client: SupabaseClient) {}

  async create(input: NewTodo): Promise<Todo> {
    const { data, error } = await this.client.from(TODO_TABLE).insert({ task: input.task }).select().single();
    if (error) throw this.storeError(error);
    return this.toDomain(data as TodoRow);
  }

  async list(): Promise<Todo[]> {
    const { data, error } = await this.client.from(TODO_TABLE).select('*').order('created_at', { ascending: false });
    if (error) throw this.storeError(error);
    return (data as TodoRow[]).map(row => this.toDomain(row));
  }

  async update(id: number, changes: TodoChanges): Promise<Todo | null> {
    // maybeSingle returns null instead of an error when no row matched the ID
    const { data, error } = await this.client.from(TODO_TABLE).update(changes).eq('id', id).select().maybeSingle();
    if (error) throw this.storeError(error);
    return data ? this.toDomain(data as TodoRow) : null;
  }

  async remove(id: number): Promise<boolean> {
    const { data, error } = await this.client.from(TODO_TABLE).delete().eq('id', id).select('id');
    if (error) throw this.storeError(error);
    return data.length > 0;
  }

  private toDomain(row: TodoRow): Todo {
    return { id: row.id, task: row.task, done: row.done, createdAt: new Date(row.created_at) };
  }

  private storeError(error: PostgrestError): Error {
    return new Error(`Todo store request failed: ${error.message}`);
  }
}
