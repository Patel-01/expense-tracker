import { useEffect, useState } from "react";
import { api, type Todo } from "./api";

// Empty ruled lines keep the page looking like a pad when the list is short
const MIN_LINES = 8;

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [task, setTask] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyIds, setBusyIds] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .list()
      .then(setTodos)
      .catch(() => setError("Couldn't load your tasks. Check that the server is running, then reload."))
      .finally(() => setLoading(false));
  }, []);

  const withBusy = async (id: number, action: () => Promise<void>) => {
    setBusyIds((prev) => [...prev, id]);
    try {
      await action();
    } finally {
      setBusyIds((prev) => prev.filter((b) => b !== id));
    }
  };

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task.trim()) return;
    try {
      const created = await api.create(task.trim());
      setTodos((prev) => [created, ...prev]);
      setTask("");
      setError(null);
    } catch {
      setError("Couldn't add that task. Try again.");
    }
  };

  const toggleTodo = (todo: Todo) =>
    withBusy(todo.id, async () => {
      // Flip immediately so the strike draws on click, roll back if the save fails
      setTodos((prev) => prev.map((t) => (t.id === todo.id ? { ...t, done: !todo.done } : t)));
      try {
        const updated = await api.toggle(todo.id, !todo.done);
        setTodos((prev) => prev.map((t) => (t.id === todo.id ? updated : t)));
      } catch {
        setTodos((prev) => prev.map((t) => (t.id === todo.id ? todo : t)));
        setError("Couldn't update that task. Try again.");
      }
    });

  const removeTodo = (id: number) =>
    withBusy(id, async () => {
      try {
        await api.remove(id);
        setTodos((prev) => prev.filter((t) => t.id !== id));
      } catch {
        setError("Couldn't remove that task. Try again.");
      }
    });

  const doneCount = todos.filter((t) => t.done).length;
  const openCount = todos.length - doneCount;
  const blankLines = Math.max(0, MIN_LINES - todos.length);

  return (
    <main className="sheet">
      <header className="masthead">
        <h1>Todos</h1>
        {!loading && todos.length > 0 && (
          <p className="tally" aria-live="polite">
            {openCount} to do, {doneCount} done
          </p>
        )}
      </header>

      <form className="line compose" onSubmit={addTodo}>
        <label htmlFor="new-task" className="visually-hidden">
          New task
        </label>
        <input
          id="new-task"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="Write a task and press Enter"
          autoComplete="off"
          autoFocus
        />
        <button type="submit" className="add" disabled={!task.trim()}>
          Add task
        </button>
      </form>

      {error && (
        <p className="note error" role="alert">
          {error}
          <button type="button" onClick={() => setError(null)}>
            Dismiss
          </button>
        </p>
      )}

      {loading ? (
        <p className="note">Loading your tasks…</p>
      ) : (
        todos.length === 0 &&
        !error && <p className="note">Nothing on the list yet. Write your first task on the line above.</p>
      )}

      <ul className="list">
        {todos.map((todo) => (
          <li
            key={todo.id}
            className={`line task${todo.done ? " done" : ""}`}
            aria-busy={busyIds.includes(todo.id)}
          >
            <input
              type="checkbox"
              id={`todo-${todo.id}`}
              checked={todo.done}
              onChange={() => toggleTodo(todo)}
              disabled={busyIds.includes(todo.id)}
            />
            <label htmlFor={`todo-${todo.id}`} className="label">
              <span className="label-text">{todo.task}</span>
            </label>
            <button
              type="button"
              className="remove"
              onClick={() => removeTodo(todo.id)}
              disabled={busyIds.includes(todo.id)}
              aria-label={`Remove "${todo.task}"`}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      {Array.from({ length: blankLines }, (_, i) => (
        <div key={i} className="blank" aria-hidden="true" />
      ))}
    </main>
  );
}
