import { Comment, Like, Post } from "../entity/models";
import { UUID } from "crypto";

// Repository design pattern: abstracts persistence for domain aggregates (aka DAO - Data Access Object)
// Interfaces make the application layer independent of storage (memory/DB/etc.)
export interface PostsRepository {
  create(
    post: Omit<
      Post,
      "id" | "createdAt" | "updatedAt" | "likeCount" | "commentCount"
    >
  ): Post;
  getById(postId: UUID): Post | undefined;
  list(): Post[];
  update(post: Post): void;
  delete(postId: UUID): void;
}

export interface CommentsRepository {
  add(comment: Omit<Comment, "id" | "createdAt">): Comment;
  listByPost(postId: UUID): Comment[];
  delete(commentId: UUID): void;
}

// likes are uniquely identified by (postId, userId)
export interface LikesRepository {
  add(like: Omit<Like, "createdAt">): Like;
  has(postId: UUID, userId: UUID): boolean;
  count(postId: UUID): number;
  remove(postId: UUID, userId: UUID): void;
}
