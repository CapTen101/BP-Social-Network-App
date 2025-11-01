import express from "express";
import cors from "cors";
import morgan from "morgan";
import { postsRouter } from "../web/routes/posts.routes";
import { errorHandler } from "../web/middleware/errorHandler";

export function createServer() {
  const app = express();

  app.use(cors()); // enable CORS for all routes
  app.use(express.json()); // parse JSON bodies
  app.use(morgan("dev")); // log requests to the console

  app.get("/", (req, res) => {
    res.json({ message: "Welcome to Social Network Application Backend!" });
  });

  // health check endpoint
  app.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // feature routes
  app.use("/api/v1/posts", postsRouter);

  // centralized error handling
  app.use(errorHandler);

  return app;
}
