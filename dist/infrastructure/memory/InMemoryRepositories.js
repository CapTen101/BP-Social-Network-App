"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryLikesRepository = exports.InMemoryCommentsRepository = exports.InMemoryPostsRepository = void 0;
const crypto_1 = require("crypto");
class InMemoryPostsRepository {
    constructor() {
        this.posts = new Map();
    }
    create(input) {
        const post = {
            id: (0, crypto_1.randomUUID)(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
            likeCount: 0,
            commentCount: 0,
            ...input,
        };
        this.posts.set(post.id, post);
        return post;
    }
    getById(postId) {
        return this.posts.get(postId);
    }
    list() {
        return Array.from(this.posts.values()).sort((a, b) => b.createdAt - a.createdAt);
    }
    update(post) {
        this.posts.set(post.id, post);
    }
    delete(postId) {
        this.posts.delete(postId);
    }
}
exports.InMemoryPostsRepository = InMemoryPostsRepository;
class InMemoryCommentsRepository {
    constructor() {
        this.comments = new Map();
    }
    add(input) {
        const comment = {
            id: (0, crypto_1.randomUUID)(),
            createdAt: Date.now(),
            ...input,
        };
        this.comments.set(comment.id, comment);
        return comment;
    }
    listByPost(postId) {
        return Array.from(this.comments.values()).filter((c) => c.postId === postId);
    }
    delete(commentId) {
        this.comments.delete(commentId);
    }
}
exports.InMemoryCommentsRepository = InMemoryCommentsRepository;
class InMemoryLikesRepository {
    constructor() {
        // only one like per post allowed by a user
        // hence, store de-duplicated likes per post keyed by userId
        this.likesByPost = new Map();
    }
    add(input) {
        const post = this.likesByPost.get(input.postId) ?? new Map();
        const existing = post.get(input.userId);
        if (existing) {
            return existing; // Like already exists for (postId, userId); do not update the map
        }
        const like = { ...input, createdAt: Date.now() };
        post.set(input.userId, like);
        this.likesByPost.set(input.postId, post);
        return like;
    }
    has(postId, userId) {
        const post = this.likesByPost.get(postId);
        if (!post)
            return false;
        return post.has(userId);
    }
    count(postId) {
        const post = this.likesByPost.get(postId);
        return post ? post.size : 0;
    }
    remove(postId, userId) {
        const post = this.likesByPost.get(postId);
        if (!post)
            return;
        post.delete(userId);
    }
}
exports.InMemoryLikesRepository = InMemoryLikesRepository;
