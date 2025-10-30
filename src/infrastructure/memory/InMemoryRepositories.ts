import { Post } from "../../entity/models";
import { PostsRepository } from "../repositories";
import { UUID, randomUUID } from "crypto";

export class InMemoryPostsRepository implements PostsRepository {
  private posts = new Map<UUID, Post>();

  create(
    input: Post
  ): Post {
    const post: Post = {
      id: randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      likeCount: 0,
      commentCount: 0,
      userId: "",
      description: ""
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
