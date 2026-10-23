import { Router, type Request, type Response } from "express";
import { supabase } from "../supabaseClient.js";

export const todosRouter = Router();

todosRouter.get("/", async (_req: Request, res: Response) => {
  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

todosRouter.post("/", async (req: Request, res: Response) => {
  const { task } = req.body as { task?: string };
  if (!task?.trim()) return res.status(400).json({ error: "task is required" });

  const { data, error } = await supabase
    .from("todos")
    .insert({ task: task.trim() })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

todosRouter.patch("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { task, done } = req.body as { task?: string; done?: boolean };

  const { data, error } = await supabase
    .from("todos")
    .update({ ...(task !== undefined && { task }), ...(done !== undefined && { done }) })
    .eq("id", id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

todosRouter.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { error } = await supabase.from("todos").delete().eq("id", id);

  if (error) return res.status(500).json({ error: error.message });
  res.status(204).send();
});
