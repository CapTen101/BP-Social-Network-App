import { Comment, Like, Post } from "../entity/models";
import { UUID } from "crypto";

export interface PostsRepository {
  create(post: Post): Post;
  getById(postId: UUID): Post | undefined;
  list(): Post[];
  update(post: Post): void;
  delete(postId: UUID): void;
}

export interface CommentsRepository {
  add(comment: Comment): Comment;
  listByPost(postId: UUID): Comment[];
  delete(commentId: UUID): void;
}

export interface LikesRepository {
  add(like: Like): Like;
  has(postId: UUID, userId: UUID): boolean;
  count(postId: UUID): number;
  remove(postId: UUID, userId: UUID): void;
}
