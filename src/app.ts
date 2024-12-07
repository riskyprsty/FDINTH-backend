import express, {Application} from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';

import { createBullBoard } from "@bull-board/api";
import { BullAdapter } from "@bull-board/api/bullAdapter.js"
import { ExpressAdapter } from "@bull-board/express";

import { fetchQueue } from './config/queue.js';
import userRoutes from './routes/users.js';
import taskRoutes from './routes/tasks.js';

dotenv.config();

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
  queues: [
    new BullAdapter(fetchQueue),
  ],
  serverAdapter: serverAdapter,
});
const app: Application = express();


app.use(cors());
app.use(bodyParser.json());

app.use("/admin/queues", serverAdapter.getRouter());

app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);

export default app;