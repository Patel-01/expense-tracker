/** Postgres row shape, matching supabase/migrations. */
export interface TodoRow {
  id: number;
  task: string;
  done: boolean;
  created_at: string;
}

export const TODO_TABLE = 'todos';
