import React from 'react';
import TodoListPage from '../modules/todos/pages/TodoListPage.js';
import '../shared/styles.css';

/** Application composition point for cross-feature providers and routing. */
export default class TodoApp extends React.Component {
  render(): React.ReactNode {
    return <TodoListPage />;
  }
}
