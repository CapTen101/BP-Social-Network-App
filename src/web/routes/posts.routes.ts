import { Router } from "express";

export const postsRouter = Router();

postsRouter.post("/", (req, res, next) => {});

postsRouter.get("/", (_req, res) => {});

postsRouter.get("/:postId", (req, res, next) => {});

postsRouter.delete("/:postId", (req, res, next) => {});

postsRouter.post("/:postId/like", (req, res, next) => {});

postsRouter.delete("/:postId/like/:userId", (req, res, next) => {});

postsRouter.post("/:postId/comment", (req, res, next) => {});

postsRouter.get("/:postId/comments", (req, res, next) => {});
