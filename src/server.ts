import 'dotenv/config';
import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ApplicationContainer from './application/ApplicationContainer.js';
import RequestValidationError from './shared/errors/RequestValidationError.js';

const app = express();
app.use(cors());
app.use(express.json());

const application = new ApplicationContainer();
const controller = application.todoController;

app.get('/healthz', (_request, response) => response.json({ status: 'ok' }));
app.post('/api/todos', controller.create);
app.get('/api/todos', controller.list);
app.patch('/api/todos/:id', controller.update);
app.delete('/api/todos/:id', controller.remove);

const clientDist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../client/dist');
app.use(express.static(clientDist));
app.get('*', (_request, response, next) => {
  response.sendFile(path.join(clientDist, 'index.html'), error => {
    if (error) next(error);
  });
});

app.use((error: Error & { status?: number }, _request: Request, response: Response, _next: NextFunction) => {
  // Validation errors and body-parser errors (which carry a 4xx status) are the client's fault
  const status = error instanceof RequestValidationError ? 400 : error.status ?? 500;
  if (status >= 500) console.error(error);
  response.status(status).json({ error: status >= 500 ? 'Internal server error' : error.message });
});

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => console.log(`API listening on ${port}`));
