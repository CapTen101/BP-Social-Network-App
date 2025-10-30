import { Like, Comment, Post } from "../../entity/models";
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
