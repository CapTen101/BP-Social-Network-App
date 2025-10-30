import { Comment, Like, Post } from "../entity/models";
import { UUID } from "crypto";

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

export interface LikesRepository {
  add(like: Omit<Like, "createdAt">): Like;
  has(postId: UUID, userId: UUID): boolean;
  count(postId: UUID): number;
  remove(postId: UUID, userId: UUID): void;
}
