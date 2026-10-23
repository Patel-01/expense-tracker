import { createClient } from '@supabase/supabase-js';
import TodoController from '../modules/todos/controllers/TodoController.js';
import TodoRepository from '../modules/todos/repositories/TodoRepository.js';
import { TodoMutationPolicy } from '../modules/todos/services/TodoMutationPolicy.js';
import DefaultTodoMutationPlanner from '../modules/todos/services/internal/DefaultTodoMutationPlanner.js';

function createSupabaseClient() {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
  }
  // The service_role key bypasses RLS, so it must only ever be used server-side.
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
}

/** Composition root: creates concrete adapters and wires application services. */
export default class ApplicationContainer {
  readonly todoController: TodoController;

  constructor() {
    const repository = new TodoRepository(createSupabaseClient());
    const mutationPolicy = new TodoMutationPolicy(new DefaultTodoMutationPlanner());

    this.todoController = new TodoController(repository, mutationPolicy);
  }
}
