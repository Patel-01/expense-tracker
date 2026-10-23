import { useEffect, useState } from "react";
import { api, type Todo } from "./api";

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [task, setTask] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.list().then(setTodos).catch((e) => setError(e.message));
  }, []);

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task.trim()) return;
    try {
      const created = await api.create(task.trim());
      setTodos((prev) => [created, ...prev]);
      setTask("");
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const toggleTodo = async (todo: Todo) => {
    try {
      const updated = await api.toggle(todo.id, !todo.done);
      setTodos((prev) => prev.map((t) => (t.id === todo.id ? updated : t)));
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const removeTodo = async (id: number) => {
    try {
      await api.remove(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <main style={{ maxWidth: 480, margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h1>Todos</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={addTodo} style={{ display: "flex", gap: 8 }}>
        <input
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="New task"
          style={{ flex: 1 }}
        />
        <button type="submit">Add</button>
      </form>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {todos.map((todo) => (
          <li key={todo.id} style={{ display: "flex", gap: 8, alignItems: "center", padding: "4px 0" }}>
            <input type="checkbox" checked={todo.done} onChange={() => toggleTodo(todo)} />
            <span style={{ flex: 1, textDecoration: todo.done ? "line-through" : "none" }}>
              {todo.task}
            </span>
            <button onClick={() => removeTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </main>
  );
}
