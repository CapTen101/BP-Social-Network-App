"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postsRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const validation_1 = require("../../entity/validation");
const errors_1 = require("../../infrastructure/errors");
const InMemoryRepositories_1 = require("../../infrastructure/memory/InMemoryRepositories");
const posts_service_1 = require("../../application/posts.service");
const validate_1 = require("../middleware/validate");
// Initialize in-memory repositories
const postsRepo = new InMemoryRepositories_1.InMemoryPostsRepository();
const commentsRepo = new InMemoryRepositories_1.InMemoryCommentsRepository();
const likesRepo = new InMemoryRepositories_1.InMemoryLikesRepository();
// Initialize posts service
const service = new posts_service_1.PostsService(postsRepo, commentsRepo, likesRepo);
exports.postsRouter = (0, express_1.Router)();
exports.postsRouter.post("/", (req, res, next) => {
    try {
        const parsed = validation_1.createPostSchema.parse(req.body);
        const post = service.createPost(parsed);
        res.status(201).json(post);
    }
    catch (e) {
        // Translating zod validation errors into our custom ValidationError type
        if (e instanceof zod_1.z.ZodError)
            return next(new errors_1.ValidationError(e.errors.map((er) => er.message).join(", ")));
        next(e);
    }
});
exports.postsRouter.get("/", (_req, res) => {
    res.json(service.listPosts());
});
exports.postsRouter.get("/:postId", (0, validate_1.validateUUIDParam)("postId"), (req, res, next) => {
    try {
        const post = service.getPost(req.params.postId);
        res.json(post);
    }
    catch (e) {
        next(e);
    }
});
exports.postsRouter.delete("/:postId", (0, validate_1.validateUUIDParam)("postId"), (req, res, next) => {
    try {
        service.deletePost(req.params.postId);
        res.status(204).send();
    }
    catch (e) {
        next(e);
    }
});
exports.postsRouter.post("/:postId/like", (0, validate_1.validateUUIDParam)("postId"), (req, res, next) => {
    try {
        const parsed = validation_1.likePostSchema.parse(req.body);
        const like = service.likePost(req.params.postId, parsed);
        res.status(201).json(like);
    }
    catch (e) {
        if (e instanceof zod_1.z.ZodError)
            return next(new errors_1.ValidationError(e.errors.map((er) => er.message).join(", ")));
        next(e);
    }
});
exports.postsRouter.delete("/:postId/like/:userId", (0, validate_1.validateUUIDParam)("postId"), (0, validate_1.validateUUIDParam)("userId"), (req, res, next) => {
    try {
        service.unlikePost(req.params.postId, req.params.userId);
        res.status(204).send();
    }
    catch (e) {
        next(e);
    }
});
exports.postsRouter.post("/:postId/comment", (0, validate_1.validateUUIDParam)("postId"), (req, res, next) => {
    try {
        const parsed = validation_1.addCommentSchema.parse(req.body);
        const comment = service.addComment(req.params.postId, parsed);
        res.status(201).json(comment);
    }
    catch (e) {
        if (e instanceof zod_1.z.ZodError)
            return next(new errors_1.ValidationError(e.errors.map((er) => er.message).join(", ")));
        next(e);
    }
});
exports.postsRouter.get("/:postId/comments", (0, validate_1.validateUUIDParam)("postId"), (req, res, next) => {
    try {
        res.json(service.listComments(req.params.postId));
    }
    catch (e) {
        next(e);
    }
});
