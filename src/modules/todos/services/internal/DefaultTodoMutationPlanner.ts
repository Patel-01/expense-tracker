import RequestValidationError from '../../../../shared/errors/RequestValidationError.js';
import type { NewTodo, TodoChanges } from '../../domain/Todo.js';
import type { TodoMutationPlanner } from './TodoMutationPlanner.js';

/** Internal request validation for todo mutations. */
export default class DefaultTodoMutationPlanner implements TodoMutationPlanner {
  private readonly editableFields = ['task', 'done'] as const;

  id(value: unknown): number {
    const id = typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : NaN;
    if (!Number.isSafeInteger(id) || id < 1) throw new RequestValidationError('Todo ID must be a positive integer');
    return id;
  }

  create(payload: unknown): NewTodo {
    const body = this.object(payload);
    this.onlyAllowed(body, ['task']);
    return { task: this.nonEmptyString(body.task, 'task') };
  }

  update(payload: unknown): TodoChanges {
    const body = this.object(payload);
    if (Object.keys(body).length === 0) throw new RequestValidationError('Update must include at least one editable field');
    this.onlyAllowed(body, this.editableFields);

    const changes: TodoChanges = {};
    if ('task' in body) changes.task = this.nonEmptyString(body.task, 'task');
    if ('done' in body) changes.done = this.boolean(body.done, 'done');
    return changes;
  }

  private object(value: unknown): Record<string, unknown> {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
      throw new RequestValidationError('Request body must be an object');
    }
    return value as Record<string, unknown>;
  }

  private onlyAllowed(body: Record<string, unknown>, allowed: readonly string[]): void {
    const unexpected = Object.keys(body).find(key => !allowed.includes(key));
    if (unexpected) throw new RequestValidationError(`Field is not editable: ${unexpected}`);
  }

  private nonEmptyString(value: unknown, field: string): string {
    if (typeof value !== 'string') throw new RequestValidationError(`${field} must be a string`);
    const text = value.trim();
    if (!text) throw new RequestValidationError(`${field} is required`);
    return text;
  }

  private boolean(value: unknown, field: string): boolean {
    if (typeof value !== 'boolean') throw new RequestValidationError(`${field} must be a boolean`);
    return value;
  }
}
