import { expect } from "chai";
import { UUID } from "crypto";
import {
  InMemoryCommentsRepository,
  InMemoryLikesRepository,
  InMemoryPostsRepository,
} from "../src/infrastructure/memory/InMemoryRepositories";
import { PostsService } from "../src/application/posts.service";
import { ConflictError, NotFoundError, ValidationError } from "../src/infrastructure/errors";

describe("PostsService", () => {
  const authorId = "00000000-0000-0000-0000-000000000001" as UUID;
  const likerId = "00000000-0000-0000-0000-000000000002" as UUID;

  function makeService() {
    const posts = new InMemoryPostsRepository();
    const comments = new InMemoryCommentsRepository();
    const likes = new InMemoryLikesRepository();
    return new PostsService(posts, comments, likes);
  }

  it("create and fetch a post", () => {
    const svc = makeService();
    const post = svc.createPost({
      userId: authorId,
      description: "hello world",
    });
    const fetched = svc.getPost(post.id);
    expect(fetched.description).to.equal("hello world");
    expect(fetched.likeCount).to.equal(0);
    expect(fetched.commentCount).to.equal(0);
  });

  it("like and unlike a post", () => {
    const svc = makeService();
    const post = svc.createPost({ userId: authorId, description: "like me" });
    svc.likePost(post.id, { userId: likerId });
    const afterLike = svc.getPost(post.id);
    expect(afterLike.likeCount).to.equal(1);

    svc.unlikePost(post.id, likerId);
    const afterUnlike = svc.getPost(post.id);
    expect(afterUnlike.likeCount).to.equal(0);
  });

  it("cannot double-like a post", () => {
    const svc = makeService();
    const post = svc.createPost({
      userId: authorId,
      description: "double like",
    });
    svc.likePost(post.id, { userId: likerId });
    expect(() => svc.likePost(post.id, { userId: likerId })).to.throw(
      ConflictError
    );
  });

  it("comment on a post", () => {
    const svc = makeService();
    const post = svc.createPost({
      userId: authorId,
      description: "comment here",
    });
    svc.addComment(post.id, { userId: likerId, text: "nice post" });
    const comments = svc.listComments(post.id);
    const fetched = svc.getPost(post.id);
    expect(comments.length).to.equal(1);
    expect(fetched.commentCount).to.equal(1);
  });

  it("throws on missing post", () => {
    const svc = makeService();
    expect(() => svc.getPost("missing" as UUID)).to.throw(NotFoundError);
    expect(() => svc.likePost("missing" as UUID, { userId: likerId })).to.throw(
      NotFoundError
    );
    expect(() =>
      svc.addComment("missing" as UUID, { userId: authorId, text: "x" })
    ).to.throw(NotFoundError);
  });

  describe("deletePost", () => {
    it("should delete a post when called by owner", () => {
      const svc = makeService();
      const post = svc.createPost({
        userId: authorId,
        description: "Post to delete",
      });
      const postId = post.id;

      // Verify post exists
      expect(svc.getPost(postId)).to.exist;

      // Delete as owner
      svc.deletePost(postId, authorId);

      // Verify post is deleted
      expect(() => svc.getPost(postId)).to.throw(NotFoundError);
    });

    it("should throw ValidationError when non-owner tries to delete post", () => {
      const svc = makeService();
      const nonOwnerId = "00000000-0000-0000-0000-000000000003" as UUID;
      const post = svc.createPost({
        userId: authorId,
        description: "Post to delete",
      });
      const postId = post.id;

      // Try to delete as non-owner
      expect(() => svc.deletePost(postId, nonOwnerId)).to.throw(
        ValidationError,
        "Only the post owner can delete the post"
      );

      // Verify post still exists
      expect(svc.getPost(postId)).to.exist;
    });

    it("should throw NotFoundError when deleting non-existent post", () => {
      const svc = makeService();
      const fakeId = "00000000-0000-0000-0000-000000000999" as UUID;

      expect(() => svc.deletePost(fakeId, authorId)).to.throw(NotFoundError);
    });
  });
});
