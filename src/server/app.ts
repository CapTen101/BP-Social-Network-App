import express from "express";
import cors from "cors";
import morgan from "morgan";
import { createPostsRouter } from "../web/routes/posts.routes";
import { errorHandler } from "../web/middleware/errorHandler";
import {
  InMemoryCommentsRepository,
  InMemoryLikesRepository,
  InMemoryPostsRepository,
} from "../infrastructure/memory/InMemoryRepositories";

export function createServer() {
  const app = express();

  app.use(cors()); // enable CORS for all routes
  app.use(express.json()); // parse JSON bodies
  app.use(morgan("dev")); // log requests to the console

  app.get("/", (req, res) => {
    res.send("Welcome to the Social Network Application!");
  });

  // health check endpoint
  app.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Initialize repositories
  const postsRepo = new InMemoryPostsRepository();
  const commentsRepo = new InMemoryCommentsRepository();
  const likesRepo = new InMemoryLikesRepository();

  // feature routes - using factory pattern for dependency injection
  app.use(
    "/api/v1/posts",
    createPostsRouter(postsRepo, commentsRepo, likesRepo)
  );

  // centralized error handling
  app.use(errorHandler);

  return app;
}
