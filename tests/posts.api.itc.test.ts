import { expect } from "chai";
import request from "supertest";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import {
    InMemoryCommentsRepository,
    InMemoryLikesRepository,
    InMemoryPostsRepository,
} from "../src/infrastructure/memory/InMemoryRepositories";
import { createPostsRouter } from "../src/web/routes/posts.routes";
import { errorHandler } from "../src/web/middleware/errorHandler";

/**
 * Creates a test server with fresh repositories for each test
 */
function createTestServer() {
    const app = express();

    app.use(cors());
    app.use(express.json());
    app.use(morgan("dev"));

    app.get("/", (req, res) => {
        res.send("Welcome to the Social Network Application!");
    });

    app.get("/health", (req, res) => {
        res.json({ status: "ok" });
    });

    // Create fresh repositories for each test
    const postsRepo = new InMemoryPostsRepository();
    const commentsRepo = new InMemoryCommentsRepository();
    const likesRepo = new InMemoryLikesRepository();

    app.use("/api/v1/posts", createPostsRouter(postsRepo, commentsRepo, likesRepo));
    app.use(errorHandler);

    return app;
}

describe("Posts API Integration Tests", () => {
    let app: ReturnType<typeof createTestServer>;
    const validUserId = "550e8400-e29b-41d4-a716-446655440000";
    const validUserId2 = "660e8400-e29b-41d4-a716-446655440001";

    beforeEach(() => {
        app = createTestServer();
    });

    describe("POST /api/v1/posts", () => {
        it("should create a post with valid input", async () => {
            const response = await request(app)
                .post("/api/v1/posts")
                .send({
                    userId: validUserId,
                    description: "This is my first post!",
                })
                .expect(201);

            expect(response.body).to.have.property("id");
            expect(response.body.userId).to.equal(validUserId);
            expect(response.body.description).to.equal("This is my first post!");
            expect(response.body.likeCount).to.equal(0);
            expect(response.body.commentCount).to.equal(0);
            expect(response.body).to.have.property("createdAt");
            expect(response.body).to.have.property("updatedAt");
        });

        it("should return 400 for invalid UUID", async () => {
            const response = await request(app)
                .post("/api/v1/posts")
                .send({
                    userId: "invalid-uuid",
                    description: "Test post",
                })
                .expect(400);

            expect(response.body).to.have.property("error");
        });

        it("should return 400 for missing userId", async () => {
            const response = await request(app)
                .post("/api/v1/posts")
                .send({
                    description: "Test post",
                })
                .expect(400);

            expect(response.body).to.have.property("error");
        });

        it("should return 400 for empty description", async () => {
            const response = await request(app)
                .post("/api/v1/posts")
                .send({
                    userId: validUserId,
                    description: "",
                })
                .expect(400);

            expect(response.body).to.have.property("error");
        });

        it("should return 400 for description too long", async () => {
            const longDescription = "a".repeat(1001);
            const response = await request(app)
                .post("/api/v1/posts")
                .send({
                    userId: validUserId,
                    description: longDescription,
                })
                .expect(400);

            expect(response.body).to.have.property("error");
        });
    });

    describe("GET /api/v1/posts", () => {
        it("should return empty array when no posts exist", async () => {
            const response = await request(app)
                .get("/api/v1/posts")
                .expect(200);

            expect(response.body).to.be.an("array");
            expect(response.body).to.have.length(0);
        });

        it("should return all posts sorted by creation date (newest first)", async () => {
            // Create two posts
            const post1 = await request(app)
                .post("/api/v1/posts")
                .send({
                    userId: validUserId,
                    description: "First post",
                })
                .expect(201);

            const post2 = await request(app)
                .post("/api/v1/posts")
                .send({
                    userId: validUserId,
                    description: "Second post",
                })
                .expect(201);

            const response = await request(app)
                .get("/api/v1/posts")
                .expect(200);

            expect(response.body).to.be.an("array");
            expect(response.body).to.have.length(2);
            // Newest post should be first
            expect(response.body[0].id).to.equal(post2.body.id);
            expect(response.body[1].id).to.equal(post1.body.id);
        });
    });

    describe("GET /api/v1/posts/:postId", () => {
        it("should return a post by ID", async () => {
            const createResponse = await request(app)
                .post("/api/v1/posts")
                .send({
                    userId: validUserId,
                    description: "Test post",
                })
                .expect(201);

            const postId = createResponse.body.id;

            const response = await request(app)
                .get(`/api/v1/posts/${postId}`)
                .expect(200);

            expect(response.body.id).to.equal(postId);
            expect(response.body.description).to.equal("Test post");
        });

        it("should return 404 for non-existent post", async () => {
            const fakeId = "123e4567-e89b-12d3-a456-426614174000";
            const response = await request(app)
                .get(`/api/v1/posts/${fakeId}`)
                .expect(404);

            expect(response.body).to.have.property("error");
        });

        it("should return 400 for invalid UUID format", async () => {
            const response = await request(app)
                .get("/api/v1/posts/invalid-uuid")
                .expect(400);

            expect(response.body).to.have.property("error");
        });
    });

    describe("DELETE /api/v1/posts/:postId", () => {
        it("should delete a post", async () => {
            const createResponse = await request(app)
                .post("/api/v1/posts")
                .send({
                    userId: validUserId,
                    description: "Post to delete",
                })
                .expect(201);

            const postId = createResponse.body.id;

            await request(app).delete(`/api/v1/posts/${postId}`).send({ userId: validUserId }).expect(204);

            // Verify it's deleted
            await request(app).get(`/api/v1/posts/${postId}`).send({ userId: validUserId }).expect(404);
        });

        it("should return 400 when non-owner tries to delete post", async () => {
            const createResponse = await request(app)
                .post("/api/v1/posts")
                .send({
                    userId: validUserId,
                    description: "Post to delete",
                })
                .expect(201);

            const postId = createResponse.body.id;

            const response = await request(app)
                .delete(`/api/v1/posts/${postId}`)
                .send({ userId: validUserId2 })
                .expect(400);

            expect(response.body).to.have.property("error");
            expect(response.body.error).to.include("Only the post owner can delete the post");

            // Verify post still exists
            await request(app).get(`/api/v1/posts/${postId}`).expect(200);
        });

        it("should return 400 for missing userId in request body", async () => {
            const createResponse = await request(app)
                .post("/api/v1/posts")
                .send({
                    userId: validUserId,
                    description: "Post",
                })
                .expect(201);

            const postId = createResponse.body.id;

            const response = await request(app)
                .delete(`/api/v1/posts/${postId}`)
                .send({})
                .expect(400);

            expect(response.body).to.have.property("error");
        });

        it("should return 400 for invalid userId format", async () => {
            const createResponse = await request(app)
                .post("/api/v1/posts")
                .send({
                    userId: validUserId,
                    description: "Post",
                })
                .expect(201);

            const postId = createResponse.body.id;

            const response = await request(app)
                .delete(`/api/v1/posts/${postId}`)
                .send({ userId: "invalid-uuid" })
                .expect(400);

            expect(response.body).to.have.property("error");
        });

        it("should return 404 for non-existent post", async () => {
            const fakeId = "123e4567-e89b-12d3-a456-426614174000";
            await request(app).delete(`/api/v1/posts/${fakeId}`).send({ userId: validUserId }).expect(404);
        });
    });

    describe("POST /api/v1/posts/:postId/like", () => {
        it("should like a post", async () => {
            const createResponse = await request(app)
                .post("/api/v1/posts")
                .send({
                    userId: validUserId,
                    description: "Post to like",
                })
                .expect(201);

            const postId = createResponse.body.id;

            const likeResponse = await request(app)
                .post(`/api/v1/posts/${postId}/like`)
                .send({
                    userId: validUserId2,
                })
                .expect(201);

            expect(likeResponse.body.postId).to.equal(postId);
            expect(likeResponse.body.userId).to.equal(validUserId2);
            expect(likeResponse.body).to.have.property("createdAt");

            // Verify like count increased
            const getResponse = await request(app)
                .get(`/api/v1/posts/${postId}`)
                .expect(200);
            expect(getResponse.body.likeCount).to.equal(1);
        });

        it("should return 409 when user already liked the post", async () => {
            const createResponse = await request(app)
                .post("/api/v1/posts")
                .send({
                    userId: validUserId,
                    description: "Post to like",
                })
                .expect(201);

            const postId = createResponse.body.id;

            await request(app)
                .post(`/api/v1/posts/${postId}/like`)
                .send({
                    userId: validUserId2,
                })
                .expect(201);

            // Try to like again
            const response = await request(app)
                .post(`/api/v1/posts/${postId}/like`)
                .send({
                    userId: validUserId2,
                })
                .expect(409);

            expect(response.body).to.have.property("error");
        });

        it("should return 404 for non-existent post", async () => {
            const fakeId = "123e4567-e89b-12d3-a456-426614174000";
            await request(app)
                .post(`/api/v1/posts/${fakeId}/like`)
                .send({
                    userId: validUserId2,
                })
                .expect(404);
        });
    });

    describe("DELETE /api/v1/posts/:postId/like/:userId", () => {
        it("should unlike a post", async () => {
            const createResponse = await request(app)
                .post("/api/v1/posts")
                .send({
                    userId: validUserId,
                    description: "Post to unlike",
                })
                .expect(201);

            const postId = createResponse.body.id;

            // Like first
            await request(app)
                .post(`/api/v1/posts/${postId}/like`)
                .send({
                    userId: validUserId2,
                })
                .expect(201);

            // Unlike
            await request(app)
                .delete(`/api/v1/posts/${postId}/like/${validUserId2}`)
                .expect(204);

            // Verify like count decreased
            const getResponse = await request(app)
                .get(`/api/v1/posts/${postId}`)
                .expect(200);
            expect(getResponse.body.likeCount).to.equal(0);
        });

        it("should be idempotent (unlike non-existent like succeeds)", async () => {
            const createResponse = await request(app)
                .post("/api/v1/posts")
                .send({
                    userId: validUserId,
                    description: "Post",
                })
                .expect(201);

            const postId = createResponse.body.id;

            // Unlike without liking first should succeed (idempotent)
            await request(app)
                .delete(`/api/v1/posts/${postId}/like/${validUserId2}`)
                .expect(204);
        });
    });

    describe("POST /api/v1/posts/:postId/comment", () => {
        it("should add a comment to a post", async () => {
            const createResponse = await request(app)
                .post("/api/v1/posts")
                .send({
                    userId: validUserId,
                    description: "Post to comment on",
                })
                .expect(201);

            const postId = createResponse.body.id;

            const commentResponse = await request(app)
                .post(`/api/v1/posts/${postId}/comment`)
                .send({
                    userId: validUserId2,
                    text: "Great post!",
                })
                .expect(201);

            expect(commentResponse.body.postId).to.equal(postId);
            expect(commentResponse.body.userId).to.equal(validUserId2);
            expect(commentResponse.body.text).to.equal("Great post!");
            expect(commentResponse.body).to.have.property("id");
            expect(commentResponse.body).to.have.property("createdAt");

            // Verify comment count increased
            const getResponse = await request(app)
                .get(`/api/v1/posts/${postId}`)
                .expect(200);
            expect(getResponse.body.commentCount).to.equal(1);
        });

        it("should return 400 for empty comment text", async () => {
            const createResponse = await request(app)
                .post("/api/v1/posts")
                .send({
                    userId: validUserId,
                    description: "Post",
                })
                .expect(201);

            const postId = createResponse.body.id;

            await request(app)
                .post(`/api/v1/posts/${postId}/comment`)
                .send({
                    userId: validUserId2,
                    text: "",
                })
                .expect(400);
        });

        it("should return 400 for comment text too long", async () => {
            const createResponse = await request(app)
                .post("/api/v1/posts")
                .send({
                    userId: validUserId,
                    description: "Post",
                })
                .expect(201);

            const postId = createResponse.body.id;
            const longText = "a".repeat(501);

            await request(app)
                .post(`/api/v1/posts/${postId}/comment`)
                .send({
                    userId: validUserId2,
                    text: longText,
                })
                .expect(400);
        });
    });

    describe("GET /api/v1/posts/:postId/comments", () => {
        it("should return comments for a post", async () => {
            const createResponse = await request(app)
                .post("/api/v1/posts")
                .send({
                    userId: validUserId,
                    description: "Post",
                })
                .expect(201);

            const postId = createResponse.body.id;

            // Add two comments
            await request(app)
                .post(`/api/v1/posts/${postId}/comment`)
                .send({
                    userId: validUserId2,
                    text: "First comment",
                })
                .expect(201);

            await request(app)
                .post(`/api/v1/posts/${postId}/comment`)
                .send({
                    userId: validUserId,
                    text: "Second comment",
                })
                .expect(201);

            const response = await request(app)
                .get(`/api/v1/posts/${postId}/comments`)
                .expect(200);

            expect(response.body).to.be.an("array");
            expect(response.body).to.have.length(2);
            expect(response.body[0]).to.have.property("text");
            expect(response.body[0]).to.have.property("userId");
        });

        it("should return empty array when post has no comments", async () => {
            const createResponse = await request(app)
                .post("/api/v1/posts")
                .send({
                    userId: validUserId,
                    description: "Post",
                })
                .expect(201);

            const postId = createResponse.body.id;

            const response = await request(app)
                .get(`/api/v1/posts/${postId}/comments`)
                .expect(200);

            expect(response.body).to.be.an("array");
            expect(response.body).to.have.length(0);
        });
    });

    describe("Health check", () => {
        it("should return 200 for health endpoint", async () => {
            await request(app).get("/health").expect(200, { status: "ok" });
        });
    });
});

