import { UUID } from "crypto";

export interface Post {
  id: UUID;
  userId: UUID;
  description: string;
  createdAt: number;
  updatedAt: number;
  likeCount: number;
  commentCount: number;
}

export interface Comment {
  id: UUID;
  postId: UUID;
  userId: UUID;
  text: string;
  createdAt: number;
}

export interface Like {
  postId: UUID;
  userId: UUID;
  createdAt: number;
}
