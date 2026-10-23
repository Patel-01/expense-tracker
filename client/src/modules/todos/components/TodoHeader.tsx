import React from 'react';
import type { TodoView } from '../types/Todo.js';

interface TodoHeaderProps {
  todos: TodoView[];
  loading: boolean;
}

export default class TodoHeader extends React.Component<TodoHeaderProps> {
  render(): React.ReactNode {
    const { todos, loading } = this.props;
    const doneCount = todos.filter(todo => todo.done).length;
    return <header className="masthead">
      <h1>Todos</h1>
      {!loading && todos.length > 0 && (
        <p className="tally" aria-live="polite">{todos.length - doneCount} to do, {doneCount} done</p>
      )}
    </header>;
  }
}
