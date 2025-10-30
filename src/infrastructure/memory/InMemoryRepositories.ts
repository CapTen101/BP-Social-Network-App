import { Comment, Like, Post } from "../../entity/models";
import {
  CommentsRepository,
  LikesRepository,
  PostsRepository,
} from "../repositories";
import { UUID, randomUUID } from "crypto";

export class InMemoryPostsRepository implements PostsRepository {
  private posts = new Map<UUID, Post>();

  create(
    input: Omit<
      Post,
      "id" | "createdAt" | "updatedAt" | "likeCount" | "commentCount"
    >
  ): Post {
    const post: Post = {
      id: randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      likeCount: 0,
      commentCount: 0,
      ...input,
    };

    this.posts.set(post.id, post);
    return post;
  }

  getById(postId: UUID): Post | undefined {
    return this.posts.get(postId);
  }

  list(): Post[] {
    return Array.from(this.posts.values()).sort(
      (a, b) => b.createdAt - a.createdAt
    );
  }

  update(post: Post): void {
    this.posts.set(post.id, post);
  }

  delete(postId: UUID): void {
    this.posts.delete(postId);
  }
}

export class InMemoryCommentsRepository implements CommentsRepository {
  private comments = new Map<UUID, Comment>();

  add(input: Omit<Comment, "id" | "createdAt">): Comment {
    const comment: Comment = {
      id: randomUUID(),
      createdAt: Date.now(),
      ...input,
    };
    this.comments.set(comment.id, comment);
    return comment;
  }

  listByPost(postId: UUID): Comment[] {
    return Array.from(this.comments.values()).filter(
      (c) => c.postId === postId
    );
  }

  delete(commentId: UUID): void {
    this.comments.delete(commentId);
  }
}

export class InMemoryLikesRepository implements LikesRepository {
  // only one like per post allowed by a user
  // hence, store de-duplicated likes per post keyed by userId
  private likesByPost = new Map<UUID, Map<UUID, Like>>();

  add(input: Omit<Like, "createdAt">): Like {
    const post = this.likesByPost.get(input.postId) ?? new Map();
    const existing = post.get(input.userId);
    if (existing) {
      return existing; // Like already exists for (postId, userId); do not update the map
    }

    const like: Like = { ...input, createdAt: Date.now() };
    post.set(input.userId, like);
    this.likesByPost.set(input.postId, post);
    return like;
  }

  has(postId: UUID, userId: UUID): boolean {
    const post = this.likesByPost.get(postId);
    if (!post) return false;
    return post.has(userId);
  }

  count(postId: UUID): number {
    const post = this.likesByPost.get(postId);
    return post ? post.size : 0;
  }

  remove(postId: UUID, userId: UUID): void {
    const post = this.likesByPost.get(postId);
    if (!post) return;
    post.delete(userId);
  }
}
