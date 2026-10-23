import type { NextFunction, Request, Response } from 'express';
import type { TodoStore } from '../ports/TodoStore.js';
import { TodoMutationPolicy } from '../services/TodoMutationPolicy.js';

export default class TodoController {
  constructor(
    private readonly repository: TodoStore,
    private readonly policy: TodoMutationPolicy
  ) {}

  create = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const input = this.policy.create(request.body);
      response.status(201).json(await this.repository.create(input));
    } catch (error) {
      next(error);
    }
  };

  list = async (_request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      response.json(await this.repository.list());
    } catch (error) {
      next(error);
    }
  };

  update = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const id = this.policy.id(request.params.id);
      const todo = await this.repository.update(id, this.policy.update(request.body));
      if (!todo) {
        response.status(404).json({ error: 'Not found' });
        return;
      }
      response.json(todo);
    } catch (error) {
      next(error);
    }
  };

  remove = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const removed = await this.repository.remove(this.policy.id(request.params.id));
      if (!removed) {
        response.status(404).json({ error: 'Not found' });
        return;
      }
      response.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
