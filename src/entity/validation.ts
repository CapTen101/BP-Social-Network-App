import { z } from "zod";

// using zod schema validation for all entities
export const createPostSchema = z.object({
  userId: z.string().uuid().min(1),
  description: z.string().min(1).max(1000),
});

export const likePostSchema = z.object({
  userId: z.string().uuid().min(1),
});

export const addCommentSchema = z.object({
  userId: z.string().uuid().min(1),
  text: z.string().min(1).max(500),
});

export const deletePostSchema = z.object({
  userId: z.string().uuid().min(1),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type LikePostInput = z.infer<typeof likePostSchema>;
export type AddCommentInput = z.infer<typeof addCommentSchema>;
export type DeletePostInput = z.infer<typeof deletePostSchema>;