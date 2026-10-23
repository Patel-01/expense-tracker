import type { NextFunction, Request, Response } from 'express';
import type { ExpenseStore } from '../ports/ExpenseStore.js';
import { ExpenseRequestPolicy } from '../services/ExpenseRequestPolicy.js';

export default class ExpenseController {
  constructor(
    private readonly repository: ExpenseStore,
    private readonly policy: ExpenseRequestPolicy
  ) {}

  create = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const input = this.policy.create(request.body);
      response.status(201).json(await this.repository.create(input));
    } catch (error) {
      next(error);
    }
  };

  list = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      response.json(await this.repository.list(this.policy.listQuery(request.query)));
    } catch (error) {
      next(error);
    }
  };

  summary = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const range = this.policy.month(request.query);
      response.json({ month: range.month, totals: await this.repository.categoryTotals(range) });
    } catch (error) {
      next(error);
    }
  };

  remove = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const removed = await this.repository.remove(this.policy.id(request.params.id));
      if (!removed) {
        response.status(404).json({ error: 'Expense not found' });
        return;
      }
      response.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
