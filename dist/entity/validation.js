"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addCommentSchema = exports.likePostSchema = exports.createPostSchema = void 0;
const zod_1 = require("zod");
// using zod schema validation for all entities
exports.createPostSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid().min(1),
    description: zod_1.z.string().min(1).max(1000),
});
exports.likePostSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid().min(1),
});
exports.addCommentSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid().min(1),
    text: zod_1.z.string().min(1).max(500),
});
