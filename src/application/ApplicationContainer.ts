import { createClient } from '@supabase/supabase-js';
import TodoController from '../modules/todos/controllers/TodoController.js';
import TodoRepository from '../modules/todos/repositories/TodoRepository.js';
import { TodoMutationPolicy } from '../modules/todos/services/TodoMutationPolicy.js';
import DefaultTodoMutationPlanner from '../modules/todos/services/internal/DefaultTodoMutationPlanner.js';
import ExpenseController from '../modules/expenses/controllers/ExpenseController.js';
import ExpenseRepository from '../modules/expenses/repositories/ExpenseRepository.js';
import { ExpenseRequestPolicy } from '../modules/expenses/services/ExpenseRequestPolicy.js';
import DefaultExpenseRequestPlanner from '../modules/expenses/services/internal/DefaultExpenseRequestPlanner.js';

function createSupabaseClient() {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
  }
  // The service_role key bypasses RLS, so it must only ever be used server-side.
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
}

/** Returns a function giving today's date (YYYY-MM-DD) in the configured time zone. */
function createCalendar(timeZone: string): () => string {
  // en-CA formats as YYYY-MM-DD; an unknown time zone throws here, at startup
  const format = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' });
  return () => format.format(new Date());
}

/** Composition root: creates concrete adapters and wires application services. */
export default class ApplicationContainer {
  readonly todoController: TodoController;
  readonly expenseController: ExpenseController;

  constructor() {
    const client = createSupabaseClient();
    const today = createCalendar(process.env.APP_TIME_ZONE ?? 'UTC');

    this.todoController = new TodoController(
      new TodoRepository(client),
      new TodoMutationPolicy(new DefaultTodoMutationPlanner())
    );
    this.expenseController = new ExpenseController(
      new ExpenseRepository(client),
      new ExpenseRequestPolicy(new DefaultExpenseRequestPlanner(today))
    );
  }
}
