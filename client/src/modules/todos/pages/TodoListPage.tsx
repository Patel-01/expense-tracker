import React from 'react';
import TodoApiClient from '../services/TodoApiClient.js';
import type { TodoView } from '../types/Todo.js';
import TodoHeader from '../components/TodoHeader.js';
import NewTodoForm from '../components/NewTodoForm.js';
import TodoList from '../components/TodoList.js';
import Button from '../../../shared/components/Button.js';

interface TodoListPageState {
  todos: TodoView[];
  loading: boolean;
  busyIds: number[];
  error?: string;
}

/** Page-level coordinator: owns request state and composes focused UI components. */
export default class TodoListPage extends React.Component<object, TodoListPageState> {
  state: TodoListPageState = { todos: [], loading: true, busyIds: [] };

  private readonly api = new TodoApiClient();
  private mounted = false;

  componentDidMount(): void {
    this.mounted = true;
    void this.load();
  }

  componentWillUnmount(): void {
    this.mounted = false;
  }

  private async load(): Promise<void> {
    try {
      const todos = await this.api.listTodos();
      if (this.mounted) this.setState({ todos, loading: false });
    } catch {
      if (this.mounted) this.setState({
        loading: false,
        error: "Couldn't load your tasks. Check that the server is running, then reload."
      });
    }
  }

  private createTodo = async (task: string): Promise<void> => {
    try {
      const created = await this.api.createTodo(task);
      this.setState(state => ({ todos: [created, ...state.todos], error: undefined }));
    } catch (error) {
      this.setState({ error: "Couldn't add that task. Try again." });
      throw error;
    }
  };

  private toggleTodo = (todo: TodoView): Promise<void> => this.withBusy(todo.id, async () => {
    // Flip immediately so the strike draws on click, roll back if the save fails
    this.replaceTodo({ ...todo, done: !todo.done });
    try {
      this.replaceTodo(await this.api.setDone(todo.id, !todo.done));
    } catch {
      this.replaceTodo(todo);
      this.setState({ error: "Couldn't update that task. Try again." });
    }
  });

  private removeTodo = (id: number): Promise<void> => this.withBusy(id, async () => {
    try {
      await this.api.removeTodo(id);
      this.setState(state => ({ todos: state.todos.filter(todo => todo.id !== id) }));
    } catch {
      this.setState({ error: "Couldn't remove that task. Try again." });
    }
  });

  private replaceTodo(next: TodoView): void {
    this.setState(state => ({ todos: state.todos.map(todo => (todo.id === next.id ? next : todo)) }));
  }

  private async withBusy(id: number, action: () => Promise<void>): Promise<void> {
    this.setState(state => ({ busyIds: [...state.busyIds, id] }));
    try {
      await action();
    } finally {
      this.setState(state => ({ busyIds: state.busyIds.filter(busyId => busyId !== id) }));
    }
  }

  render(): React.ReactNode {
    const { todos, loading, busyIds, error } = this.state;
    return <main className="sheet">
      <TodoHeader todos={todos} loading={loading} />
      <NewTodoForm onSubmit={this.createTodo} />
      {error && <p className="note error" role="alert">
        {error}
        <Button onClick={() => this.setState({ error: undefined })}>Dismiss</Button>
      </p>}
      {loading
        ? <p className="note">Loading your tasks…</p>
        : todos.length === 0 && !error && <p className="note">Nothing on the list yet. Write your first task on the line above.</p>}
      <TodoList
        todos={todos}
        busyIds={busyIds}
        onToggle={todo => void this.toggleTodo(todo)}
        onRemove={id => void this.removeTodo(id)}
      />
    </main>;
  }
}
