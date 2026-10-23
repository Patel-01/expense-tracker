export interface Todo {
  id: number;
  task: string;
  done: boolean;
  created_at: string;
}

// Production builds are served by the backend, so default to the same origin
const API_URL =
  import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? "http://localhost:3000" : "");

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  list: () => request<Todo[]>("/api/todos"),
  create: (task: string) =>
    request<Todo>("/api/todos", { method: "POST", body: JSON.stringify({ task }) }),
  toggle: (id: number, done: boolean) =>
    request<Todo>(`/api/todos/${id}`, { method: "PATCH", body: JSON.stringify({ done }) }),
  remove: (id: number) => request<void>(`/api/todos/${id}`, { method: "DELETE" }),
};
