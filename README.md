# Social Microservice (Posts, Likes, Comments)

Simple TypeScript microservice with in-memory storage:

- Create text-only posts
- Like/unlike posts
- Comment on posts

## Tech

- Node.js + TypeScript
- Express
- Zod for schema validation for entities
- Mocha, Sinon, and Chai for tests

## Architecture & Design

The project follows a layered architecture with clear separation of concerns:

- Web Layer (routes/middleware) - handles HTTP requests/responses
- Application Layer (services) - contains business logic
- Entity Layer (models/validation) - defines entities and validation rules
- Infrastructure Layer (repositories) - abstracts data access

This structure makes the code testable and maintainable. Each layer can be tested independently, and changes in one layer don't affect others.

### Design Patterns Used

**Repository Pattern**
- Data access is abstracted behind interfaces (PostsRepository, CommentsRepository, LikesRepository)
- Currently using in-memory storage, but can easily swap to a database later

**Factory Pattern**
- Using `createPostsRouter()` and `createServer()` functions initialising different repositories

**Service Pattern**
- Our PostsService contains the entire business logic instead of residing directly in routes
- Routes -> services -> repositories (separation of concerns between layers)

**Dependency Injection**
- Dependencies are injected through constructors

**Middleware Pattern**
- Using ErrorHandler and validateUUIDParam() for validating schema via middleware pattern

**Chain Of Responsibility Pattern**
- Express.JS beautifully implements the COR pattern via the `app.use()` & `next()` call inside the routes.
- Multiple handlers/routers can be 'chained' together to achieve modular functionality.

### Code Quality

**Type Safety**
- Using TypeScript in strict mode
- Zod schemas for runtime validation
- Using UUIDv4 from node's `crypto` package (minimal collisions between generated IDs) 

**Error Handling**
- Declared custom error classes (NotFoundError, ValidationError, ConflictError) for better error handling
- Centralized error handler maps errors to HTTP status codes

### Testing

The project has comprehensive test coverage (34 tests in total):

**Unit Tests** (posts.service.utc.test.ts)
- Test pure business logic in isolation

**Integration Tests** (posts.api.itc.test.ts)
- Test API behavior end-to-end

### Technical Decisions

**In-Memory Storage**
- Chose in-memory data atructures for simplicity and fast development
- Repository pattern makes it easy to swap to a database later
- Good for the current purpose of Assignment/MVP/demo

**Zod for Validation**
- Provides type-safe validation

**Factory Functions**
- Better for testing (can inject dependencies)
- Avoids singleton patterns
- More flexible approach

**Custom Error Classes**
- Easy to map to HTTP status codes

### Performance

- Using Map data structures for O(1) constant time access
- Idempotent operations (safe to retry)

## Getting Started

1. Install dependencies

```bash
npm install
```

2. Build and start

```bash
npm run build
npm start
```

Service listens on https://bp-social-network-app.onrender.com

### Health

```bash
curl https://bp-social-network-app.onrender.com/health
```

I've used [UptimeRobot](https://uptimerobot.com/) to perform health monitoring: https://stats.uptimerobot.com/5KtXbR6uN5

## API

I've uploaded the API collection for both **Bruno** and **Postman** API client:

- Bruno: `./API Collection_Bruno.json`
- Postman: `./API Collection_Postman.json`

Just download any of the two and import to start using the below mentioned APIs!

![API Collection image](https://github.com/CapTen101/BP-Social-Network-App/blob/main/assets/APIs.png)

Base Hosted URL: `https://bp-social-network-app.onrender.com/api/v1/posts`

All `postId` and `userId` path parameters must be valid UUIDs. Invalid UUIDs will return a `400 Bad Request` error.

### Create Post

Creates a new text post.

**Request:**

```http
POST /posts
Content-Type: application/json
```

**Request Body:**

```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "description": "This is my first post!"
}
```

**Validation Rules:**

- `userId`: Required, must be a valid UUID
- `description`: Required, 1-1000 characters

**Response:** `201 Created`

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "description": "This is my first post!",
  "createdAt": 1704067200000,
  "updatedAt": 1704067200000,
  "likeCount": 0,
  "commentCount": 0
}
```

**Error Responses:**

- `400 Bad Request`: Invalid request payload or validation errors

**Example:**

```bash
curl -X POST https://bp-social-network-app.onrender.com/api/v1/posts \
  -H 'Content-Type: application/json' \
  -d '{"userId":"550e8400-e29b-41d4-a716-446655440000","description":"Hello world!"}'
```

---

### List Posts

Retrieves all posts, sorted by creation date (newest first).

**Request:**

```http
GET /posts
```

**Response:** `200 OK`

```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "description": "Newest post",
    "createdAt": 1704067200000,
    "updatedAt": 1704067200000,
    "likeCount": 5,
    "commentCount": 2
  },
  {
    "id": "223e4567-e89b-12d3-a456-426614174001",
    "userId": "650e8400-e29b-41d4-a716-446655440001",
    "description": "Older post",
    "createdAt": 1703980800000,
    "updatedAt": 1703980800000,
    "likeCount": 10,
    "commentCount": 3
  }
]
```

**Example:**

```bash
curl https://bp-social-network-app.onrender.com/api/v1/posts
```

---

### Get Post by ID

Retrieves a specific post by its ID.

**Request:**

```http
GET /posts/:postId
```

**Path Parameters:**

- `postId`: UUID of the post

**Response:** `200 OK`

```json
{
  "id": "7982bfb7-1780-4828-8ed6-278d468e08c6",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "description": "This is my first post!",
  "createdAt": 1704067200000,
  "updatedAt": 1704067200000,
  "likeCount": 5,
  "commentCount": 2
}
```

**Error Responses:**

- `400 Bad Request`: Invalid UUID format for `postId`
- `404 Not Found`: Post not found

**Example:**

```bash
curl https://bp-social-network-app.onrender.com/api/v1/posts/5f5ff573-c092-4360-a629-d03bf2d583e8
```

---

### Delete Post

Deletes a post by its ID. Only the post owner can delete their post.

**Request:**

```http
DELETE /posts/:postId
Content-Type: application/json
```

**Path Parameters:**

- `postId`: UUID of the post to delete

**Request Body:**

```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Validation Rules:**

- `userId`: Required, must be a valid UUID. Must match the owner of the post.

**Response:** `204 No Content`

**Error Responses:**

- `400 Bad Request`: Invalid UUID format for `postId`, missing or invalid `userId`, or user is not the post owner
- `404 Not Found`: Post not found

**Example:**

```bash
curl -X DELETE https://bp-social-network-app.onrender.com/api/v1/posts/5f5ff573-c092-4360-a629-d03bf2d583e8 \
  -H 'Content-Type: application/json' \
  -d '{"userId":"550e8400-e29b-41d4-a716-446655440000"}'
```

---

### Like Post

Adds a like to a post. Users can only like a post once. Attempting to like the same post again will return a conflict error.

**Request:**

```http
POST /posts/:postId/like
Content-Type: application/json
```

**Path Parameters:**

- `postId`: UUID of the post to like

**Request Body:**

```json
{
  "userId": "660e8400-e29b-41d4-a716-446655440002"
}
```

**Validation Rules:**

- `userId`: Required, must be a valid UUID

**Response:** `201 Created`

```json
{
  "postId": "7982bfb7-1780-4828-8ed6-278d468e08c6",
  "userId": "660e8400-e29b-41d4-a716-446655440002",
  "createdAt": 1704067300000
}
```

**Error Responses:**

- `400 Bad Request`: Invalid UUID format or validation errors
- `404 Not Found`: Post not found
- `409 Conflict`: User has already liked this post

**Example:**

```bash
curl -X POST https://bp-social-network-app.onrender.com/api/v1/posts/5f5ff573-c092-4360-a629-d03bf2d583e8/like \
  -H 'Content-Type: application/json' \
  -d '{"userId":"660e8400-e29b-41d4-a716-446655440002"}'
```

---

### Unlike Post

Removes a like from a post. This operation is idempotent - removing a non-existent like will succeed silently.

**Request:**

```http
DELETE /posts/:postId/like/:userId
```

**Path Parameters:**

- `postId`: UUID of the post
- `userId`: UUID of the user who liked the post

**Response:** `204 No Content`

**Error Responses:**

- `400 Bad Request`: Invalid UUID format for `postId` or `userId`
- `404 Not Found`: Post not found

**Example:**

```bash
curl -X DELETE https://bp-social-network-app.onrender.com/api/v1/posts/5f5ff573-c092-4360-a629-d03bf2d583e8/like/660e8400-e29b-41d4-a716-446655440002
```

---

### Add Comment

Adds a comment to a post.

**Request:**

```http
POST /posts/:postId/comment
Content-Type: application/json
```

**Path Parameters:**

- `postId`: UUID of the post to comment on

**Request Body:**

```json
{
  "userId": "660e8400-e29b-41d4-a716-446655440002",
  "text": "Great post! Thanks for sharing."
}
```

**Validation Rules:**

- `userId`: Required, must be a valid UUID
- `text`: Required, 1-500 characters

**Response:** `201 Created`

```json
{
  "id": "789e4567-e89b-12d3-a456-426614174003",
  "postId": "7982bfb7-1780-4828-8ed6-278d468e08c6",
  "userId": "660e8400-e29b-41d4-a716-446655440002",
  "text": "Great post! Thanks for sharing.",
  "createdAt": 1704067400000
}
```

**Error Responses:**

- `400 Bad Request`: Invalid UUID format or validation errors
- `404 Not Found`: Post not found

**Example:**

```bash
curl -X POST https://bp-social-network-app.onrender.com/api/v1/posts/5f5ff573-c092-4360-a629-d03bf2d583e8/comment \
  -H 'Content-Type: application/json' \
  -d '{"userId":"660e8400-e29b-41d4-a716-446655440002","text":"Great post!"}'
```

---

### List Comments

Retrieves all comments for a specific post.

**Request:**

```http
GET /posts/:postId/comments
```

**Path Parameters:**

- `postId`: UUID of the post

**Response:** `200 OK`

```json
[
  {
    "id": "789e4567-e89b-12d3-a456-426614174003",
    "postId": "7982bfb7-1780-4828-8ed6-278d468e08c6",
    "userId": "660e8400-e29b-41d4-a716-446655440002",
    "text": "Great post! Thanks for sharing.",
    "createdAt": 1704067400000
  },
  {
    "id": "889e4567-e89b-12d3-a456-426614174004",
    "postId": "7982bfb7-1780-4828-8ed6-278d468e08c6",
    "userId": "770e8400-e29b-41d4-a716-446655440003",
    "text": "I totally agree!",
    "createdAt": 1704067500000
  }
]
```

**Error Responses:**

- `400 Bad Request`: Invalid UUID format for `postId`
- `404 Not Found`: Post not found

**Example:**

```bash
curl https://bp-social-network-app.onrender.com/api/v1/posts/5f5ff573-c092-4360-a629-d03bf2d583e8/comments
```

---

## Error Response Format

All error responses follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

**HTTP Status Codes:**

- `400 Bad Request`: Validation errors or invalid UUID format
- `404 Not Found`: Resource not found (post, comment, etc.)
- `409 Conflict`: Business rule violation (e.g., duplicate like)
- `500 Internal Server Error`: Unexpected server errors

## Tests

Run tests with:

```bash
npm test
```

## Repository Structure

```
src/
  application/       # services (business logic)
  domain/            # models and validation
  infrastructure/    # repos + errors
    memory/          # in-memory repo implementations
  server/            # express app
  web/               # routes + middleware
```
