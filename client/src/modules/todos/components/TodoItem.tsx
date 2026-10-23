import React from 'react';
import type { TodoView } from '../types/Todo.js';
import Button from '../../../shared/components/Button.js';

interface TodoItemProps {
  todo: TodoView;
  busy: boolean;
  onToggle(): void;
  onRemove(): void;
}

export default class TodoItem extends React.Component<TodoItemProps> {
  render(): React.ReactNode {
    const { todo, busy, onToggle, onRemove } = this.props;
    return <li className={`line task${todo.done ? ' done' : ''}`} aria-busy={busy}>
      <input type="checkbox" id={`todo-${todo.id}`} checked={todo.done} onChange={onToggle} disabled={busy} />
      <label htmlFor={`todo-${todo.id}`} className="label">
        <span className="label-text">{todo.task}</span>
      </label>
      <Button variant="quiet" onClick={onRemove} disabled={busy} aria-label={`Remove "${todo.task}"`}>Remove</Button>
    </li>;
  }
}
