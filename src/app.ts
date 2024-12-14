import express, { Application } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";

import { createBullBoard } from "@bull-board/api";
import { BullAdapter } from "@bull-board/api/bullAdapter.js";
import { ExpressAdapter } from "@bull-board/express";
import { fetchQueue, commentQueue, likeQueue } from "./config/queue.js";

import userRoutes from "./routes/users.js";
import taskRoutes from "./routes/tasks.js";
import postRoutes from "./routes/posts.js";
import selectedUserRouters from "./routes/selecteduser.js";
import templateRoutes from "./routes/template.js";

dotenv.config();

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
  queues: [
    new BullAdapter(fetchQueue),
    new BullAdapter(commentQueue),
    new BullAdapter(likeQueue),
  ],
  serverAdapter: serverAdapter,
});

const app: Application = express();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const corsOptions = {
  origin: FRONTEND_URL,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.use(bodyParser.json());

app.use("/admin/queues", serverAdapter.getRouter());

app.use("/users", userRoutes);
app.use("/tasks", taskRoutes);
app.use("/posts", postRoutes);
app.use("/selecteduser", selectedUserRouters);
app.use("/template", templateRoutes);

export default app;
