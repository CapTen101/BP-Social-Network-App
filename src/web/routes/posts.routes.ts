import { Router } from "express";
import { z } from "zod";
import {
  addCommentSchema,
  createPostSchema,
  likePostSchema,
} from "../../entity/validation";
import { ValidationError } from "../../infrastructure/errors";
import {
  InMemoryCommentsRepository,
  InMemoryLikesRepository,
  InMemoryPostsRepository,
} from "../../infrastructure/memory/InMemoryRepositories";
import { PostsService } from "../../application/posts.service";
import { UUID } from "crypto";
import { validateUUIDParam } from "../middleware/validate";

// Initialize in-memory repositories
const postsRepo = new InMemoryPostsRepository();
const commentsRepo = new InMemoryCommentsRepository();
const likesRepo = new InMemoryLikesRepository();

// Initialize posts service
const service = new PostsService(postsRepo, commentsRepo, likesRepo);

export const postsRouter = Router();

postsRouter.post("/", (req, res, next) => {
  try {
    const parsed = createPostSchema.parse(req.body);
    const post = service.createPost(parsed);
    res.status(201).json(post);
  } catch (e) {
    // Translating zod validation errors into our custom ValidationError type
    if (e instanceof z.ZodError)
      return next(
        new ValidationError(e.errors.map((er) => er.message).join(", "))
      );

    next(e);
  }
});

postsRouter.get("/", (_req, res) => {
  res.json(service.listPosts());
});

postsRouter.get("/:postId", validateUUIDParam("postId"), (req, res, next) => {
  try {
    const post = service.getPost(req.params.postId as UUID);
    res.json(post);
  } catch (e) {
    next(e);
  }
});

postsRouter.delete(
  "/:postId",
  validateUUIDParam("postId"),
  (req, res, next) => {
    try {
      service.deletePost(req.params.postId as UUID);
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  }
);

postsRouter.post(
  "/:postId/like",
  validateUUIDParam("postId"),
  (req, res, next) => {
    try {
      const parsed = likePostSchema.parse(req.body);
      const like = service.likePost(req.params.postId as UUID, parsed);
      res.status(201).json(like);
    } catch (e) {
      if (e instanceof z.ZodError)
        return next(
          new ValidationError(e.errors.map((er) => er.message).join(", "))
        );
      next(e);
    }
  }
);

postsRouter.delete(
  "/:postId/like/:userId",
  validateUUIDParam("postId"),
  validateUUIDParam("userId"),
  (req, res, next) => {
    try {
      service.unlikePost(req.params.postId as UUID, req.params.userId as UUID);
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  }
);

postsRouter.post(
  "/:postId/comment",
  validateUUIDParam("postId"),
  (req, res, next) => {
    try {
      const parsed = addCommentSchema.parse(req.body);
      const comment = service.addComment(req.params.postId as UUID, parsed);
      res.status(201).json(comment);
    } catch (e) {
      if (e instanceof z.ZodError)
        return next(
          new ValidationError(e.errors.map((er) => er.message).join(", "))
        );
      next(e);
    }
  }
);

postsRouter.get(
  "/:postId/comments",
  validateUUIDParam("postId"),
  (req, res, next) => {
    try {
      res.json(service.listComments(req.params.postId as UUID));
    } catch (e) {
      next(e);
    }
  }
);
