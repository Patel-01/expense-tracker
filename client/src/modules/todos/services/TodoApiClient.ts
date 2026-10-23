import type { TodoView } from '../types/Todo.js';
import HttpClient from '../../../shared/api/HttpClient.js';

export default class TodoApiClient {
  constructor(private readonly http = new HttpClient()) {}

  async listTodos(): Promise<TodoView[]> {
    return this.http.get<TodoView[]>('/api/todos');
  }

  async createTodo(task: string): Promise<TodoView> {
    return this.http.post<TodoView>('/api/todos', { task });
  }

  async setDone(id: number, done: boolean): Promise<TodoView> {
    return this.http.patch<TodoView>(`/api/todos/${id}`, { done });
  }

  async removeTodo(id: number): Promise<void> {
    await this.http.delete(`/api/todos/${id}`);
  }
}
