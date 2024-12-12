import express, { Application } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";

import { createBullBoard } from "@bull-board/api";
import { BullAdapter } from "@bull-board/api/bullAdapter.js";
import { ExpressAdapter } from "@bull-board/express";
import { fetchQueue, commentQueue } from "./config/queue.js";

import userRoutes from "./routes/users.js";
import taskRoutes from "./routes/tasks.js";
import postRoutes from "./routes/posts.js";
import selectedUserRouters from "./routes/selecteduser.js"

dotenv.config();

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
  queues: [new BullAdapter(fetchQueue), new BullAdapter(commentQueue)],
  serverAdapter: serverAdapter,
});
const app: Application = express();

app.use(cors());
app.use(bodyParser.json());

app.use("/admin/queues", serverAdapter.getRouter());

app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/selecteduser", selectedUserRouters);

export default app;
