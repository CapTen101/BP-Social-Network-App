import { Router } from "express";
import { validateUUIDParam } from "../middleware/validate";

export const postsRouter = Router();

postsRouter.post("/", validateUUIDParam("postId"), (req, res, next) => {});

postsRouter.get("/", validateUUIDParam("postId"), (_req, res) => {});

postsRouter.get(
  "/:postId",
  validateUUIDParam("postId"),
  (req, res, next) => {}
);

postsRouter.delete(
  "/:postId",
  validateUUIDParam("postId"),
  (req, res, next) => {}
);

postsRouter.post(
  "/:postId/like",
  validateUUIDParam("postId"),
  (req, res, next) => {}
);

postsRouter.delete(
  "/:postId/like/:userId",
  validateUUIDParam("postId"),
  (req, res, next) => {}
);

postsRouter.post(
  "/:postId/comment",
  validateUUIDParam("postId"),
  (req, res, next) => {}
);

postsRouter.get(
  "/:postId/comments",
  validateUUIDParam("postId"),
  (req, res, next) => {}
);
