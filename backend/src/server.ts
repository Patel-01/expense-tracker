import express from "express";
import cors from "cors";
import { todosRouter } from "./routes/todos.js";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors({ origin: process.env.CORS_ORIGIN ?? "*" }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api/todos", todosRouter);

app.listen(PORT, () => {
  console.log(`backend listening on port ${PORT}`);
});
