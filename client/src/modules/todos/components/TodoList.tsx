import React from 'react';
import type { TodoView } from '../types/Todo.js';
import TodoItem from './TodoItem.js';

// Empty ruled lines keep the page looking like a pad when the list is short
const MIN_LINES = 8;

interface TodoListProps {
  todos: TodoView[];
  busyIds: number[];
  onToggle(todo: TodoView): void;
  onRemove(id: number): void;
}

export default class TodoList extends React.Component<TodoListProps> {
  render(): React.ReactNode {
    const { todos, busyIds, onToggle, onRemove } = this.props;
    const blankLines = Math.max(0, MIN_LINES - todos.length);
    return <>
      <ul className="list">
        {todos.map(todo => <TodoItem
          key={todo.id}
          todo={todo}
          busy={busyIds.includes(todo.id)}
          onToggle={() => onToggle(todo)}
          onRemove={() => onRemove(todo.id)}
        />)}
      </ul>
      {Array.from({ length: blankLines }, (_, index) => <div key={index} className="blank" aria-hidden="true" />)}
    </>;
  }
}
