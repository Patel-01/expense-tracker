import express from "express";
import cors from "cors";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { todosRouter } from "./routes/todos.js";

// Built frontend, copied here by the root Dockerfile (absent in local dev)
const PUBLIC_DIR = fileURLToPath(new URL("../public", import.meta.url));

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors({ origin: process.env.CORS_ORIGIN ?? "*" }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api/todos", todosRouter);

if (existsSync(PUBLIC_DIR)) {
  app.use(express.static(PUBLIC_DIR));
  app.get("*", (_req, res) => res.sendFile("index.html", { root: PUBLIC_DIR }));
}

app.listen(PORT, () => {
  console.log(`backend listening on port ${PORT}`);
});
