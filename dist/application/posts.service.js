"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostsService = void 0;
const errors_1 = require("../infrastructure/errors");
// Posts Service Definition (Service pattern):
// - Encapsulates business logic for posts without exposing any persistence mechanism.
// - I've used repository interfaces here (Repository pattern) to allow storage logic be swappable.
// - Currently using In-Memory storage logic
class PostsService {
    constructor(postsRepo, commentsRepo, likesRepo) {
        this.postsRepo = postsRepo;
        this.commentsRepo = commentsRepo;
        this.likesRepo = likesRepo;
    }
    createPost(input) {
        const post = this.postsRepo.create({
            userId: input.userId,
            description: input.description,
        });
        return post;
    }
    getPost(postId) {
        const post = this.postsRepo.getById(postId);
        if (!post)
            throw new errors_1.NotFoundError("Post not found");
        return post;
    }
    listPosts() {
        return this.postsRepo.list();
    }
    deletePost(postId) {
        const post = this.postsRepo.getById(postId);
        if (!post)
            throw new errors_1.NotFoundError("Post not found");
        this.postsRepo.delete(postId);
    }
    likePost(postId, input) {
        const post = this.postsRepo.getById(postId);
        if (!post)
            throw new errors_1.NotFoundError("Post not found");
        // avoid duplicate likes
        if (this.likesRepo.has(postId, input.userId)) {
            throw new errors_1.ConflictError("User already liked this post");
        }
        const like = this.likesRepo.add({ postId, userId: input.userId });
        post.likeCount = this.likesRepo.count(postId); // fetch like count from source of truth to avoid edge cases
        post.updatedAt = Date.now();
        this.postsRepo.update(post);
        return like;
    }
    unlikePost(postId, userId) {
        const post = this.postsRepo.getById(postId);
        if (!post)
            throw new errors_1.NotFoundError("Post not found");
        if (!this.likesRepo.has(postId, userId))
            return;
        this.likesRepo.remove(postId, userId);
        post.likeCount = this.likesRepo.count(postId);
        post.updatedAt = Date.now();
        this.postsRepo.update(post);
    }
    addComment(postId, input) {
        const post = this.postsRepo.getById(postId);
        if (!post)
            throw new errors_1.NotFoundError("Post not found");
        const comment = this.commentsRepo.add({
            postId,
            userId: input.userId,
            text: input.text,
        });
        post.commentCount += 1;
        post.updatedAt = Date.now();
        this.postsRepo.update(post);
        return comment;
    }
    listComments(postId) {
        const post = this.postsRepo.getById(postId);
        if (!post)
            throw new errors_1.NotFoundError("Post not found");
        return this.commentsRepo.listByPost(postId);
    }
}
exports.PostsService = PostsService;
