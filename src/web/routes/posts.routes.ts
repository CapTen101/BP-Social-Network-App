import { Router } from "express";
import { z } from "zod";
import {
  addCommentSchema,
  createPostSchema,
  deletePostSchema,
  likePostSchema,
} from "../../entity/validation";
import { ValidationError } from "../../infrastructure/errors";
import {
  CommentsRepository,
  LikesRepository,
  PostsRepository,
} from "../../infrastructure/repositories";
import { PostsService } from "../../application/posts.service";
import { UUID } from "crypto";
import { validateUUIDParam } from "../middleware/validate";

/**
 * Factory design pattern: 
 * function to create posts router with injected dependencies(repositories).
 * this allows for better testability and avoids module-level singleton state.
 */
export function createPostsRouter(
  postsRepo: PostsRepository,
  commentsRepo: CommentsRepository,
  likesRepo: LikesRepository
): Router {
  const service = new PostsService(postsRepo, commentsRepo, likesRepo);
  const router = Router();

  router.post("/", (req, res, next) => {
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

  router.get("/", (_req, res) => {
    res.json(service.listPosts());
  });

  router.get("/:postId", validateUUIDParam("postId"), (req, res, next) => {
    try {
      // postId is validated by validateUUIDParam middleware, safe to cast
      const postId = req.params.postId as UUID;
      const post = service.getPost(postId);
      res.json(post);
    } catch (e) {
      next(e);
    }
  });

  router.delete("/:postId", validateUUIDParam("postId"), (req, res, next) => {
    try {
      const parsed = deletePostSchema.parse(req.body);
      const userId = parsed.userId as UUID; // userId is validated as UUID by Zod schema, safe to cast

      // postId is validated by validateUUIDParam middleware, safe to cast
      const postId = req.params.postId as UUID;
      service.deletePost(postId, userId);
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  });

  router.post("/:postId/like", validateUUIDParam("postId"), (req, res, next) => {
    try {
      const parsed = likePostSchema.parse(req.body);
      // postId is validated by validateUUIDParam middleware, safe to cast
      const postId = req.params.postId as UUID;
      const like = service.likePost(postId, parsed);
      res.status(201).json(like);
    } catch (e) {
      if (e instanceof z.ZodError)
        return next(
          new ValidationError(e.errors.map((er) => er.message).join(", "))
        );
      next(e);
    }
  });

  router.delete(
    "/:postId/like/:userId",
    validateUUIDParam("postId"),
    validateUUIDParam("userId"),
    (req, res, next) => {
      try {
        // Both params are validated by validateUUIDParam middleware, safe to cast
        const postId = req.params.postId as UUID;
        const userId = req.params.userId as UUID;
        service.unlikePost(postId, userId);
        res.status(204).send();
      } catch (e) {
        next(e);
      }
    }
  );

  router.post(
    "/:postId/comment",
    validateUUIDParam("postId"),
    (req, res, next) => {
      try {
        const parsed = addCommentSchema.parse(req.body);
        // postId is validated by validateUUIDParam middleware, safe to cast
        const postId = req.params.postId as UUID;
        const comment = service.addComment(postId, parsed);
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

  router.get(
    "/:postId/comments",
    validateUUIDParam("postId"),
    (req, res, next) => {
      try {
        // postId is validated by validateUUIDParam middleware, safe to cast
        const postId = req.params.postId as UUID;
        res.json(service.listComments(postId));
      } catch (e) {
        next(e);
      }
    }
  );

  return router;
}
