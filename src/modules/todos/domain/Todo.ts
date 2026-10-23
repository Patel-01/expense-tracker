export interface TodoFields {
  task: string;
  done: boolean;
}

export interface Todo extends TodoFields {
  id: number;
  createdAt: Date;
}

export type NewTodo = Pick<TodoFields, 'task'>;
export type TodoChanges = Partial<TodoFields>;
