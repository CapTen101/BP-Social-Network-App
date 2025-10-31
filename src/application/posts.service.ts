import {
  AddCommentInput,
  CreatePostInput,
  LikePostInput,
} from "../entity/validation";
import { Comment, Like, Post } from "../entity/models";
import {
  CommentsRepository,
  LikesRepository,
  PostsRepository,
} from "../infrastructure/repositories";
import { UUID } from "crypto";
import { ConflictError, NotFoundError } from "../infrastructure/errors";

// Posts Service Definition (Service pattern):
// - Encapsulates business logic for posts without exposing any persistence mechanism.
// - I've used repository interfaces here (Repository pattern) to allow storage logic be swappable.
// - Currently using In-Memory storage logic
export class PostsService {
  private readonly postsRepo: PostsRepository;
  private readonly commentsRepo: CommentsRepository;
  private readonly likesRepo: LikesRepository;

  constructor(
    postsRepo: PostsRepository,
    commentsRepo: CommentsRepository,
    likesRepo: LikesRepository
  ) {
    this.postsRepo = postsRepo;
    this.commentsRepo = commentsRepo;
    this.likesRepo = likesRepo;
  }

  createPost(input: CreatePostInput): Post {
    const post = this.postsRepo.create({
      userId: input.userId as UUID,
      description: input.description,
    });

    return post;
  }

  getPost(postId: UUID): Post {
    const post = this.postsRepo.getById(postId);
    if (!post) throw new NotFoundError("Post not found");
    return post;
  }

  listPosts(): Post[] {
    return this.postsRepo.list();
  }

  deletePost(postId: UUID): void {
    const post = this.postsRepo.getById(postId);
    if (!post) throw new NotFoundError("Post not found");
    this.postsRepo.delete(postId);
  }

  likePost(postId: UUID, input: LikePostInput): Like {
    const post = this.postsRepo.getById(postId);
    if (!post) throw new NotFoundError("Post not found");

    // avoid duplicate likes
    if (this.likesRepo.has(postId, input.userId as UUID)) {
      throw new ConflictError("User already liked this post");
    }

    const like = this.likesRepo.add({ postId, userId: input.userId as UUID });

    post.likeCount = this.likesRepo.count(postId); // fetch like count from source of truth to avoid edge cases
    post.updatedAt = Date.now();

    this.postsRepo.update(post);
    return like;
  }

  unlikePost(postId: UUID, userId: UUID): void {}

  addComment(postId: UUID, input: AddCommentInput): Comment {}

  listComments(postId: UUID): Comment[] {}
}
