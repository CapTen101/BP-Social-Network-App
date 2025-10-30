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

  createPost(input: CreatePostInput): Post {}

  getPost(postId: UUID): Post {}

  listPosts(): Post[] {}

  deletePost(postId: UUID): void {}

  likePost(postId: UUID, input: LikePostInput): Like {}

  unlikePost(postId: UUID, userId: UUID): void {}

  addComment(postId: UUID, input: AddCommentInput): Comment {}

  listComments(postId: UUID): Comment[] {}
}
