# Social Microservice (Posts, Likes, Comments)

Simple TypeScript microservice with in-memory storage:
- Create text-only posts
- Like/unlike posts
- Comment on posts

## Tech
- Node.js + TypeScript
- Express
- Zod for validation
- Mocha, Sinon, and Chai for tests

## Getting Started

1) Install dependencies
```bash
npm install
```

2) Run in dev
```bash
npm run dev
```

3) Build and start
```bash
npm run build
npm start
```

Service listens on `http://localhost:3000`.

### Health
```bash
curl http://localhost:3000/health
```

## API

![API Collection image](https://github.com/CapTen101/BP-Social-Network-App/blob/main/assets/APIs.png)

Base URL: `http://localhost:3000/posts`

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
curl -X POST http://localhost:3000/posts \
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
curl http://localhost:3000/posts
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
  "id": "123e4567-e89b-12d3-a456-426614174000",
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
curl http://localhost:3000/posts/123e4567-e89b-12d3-a456-426614174000
```

---

### Delete Post

Deletes a post by its ID.

**Request:**
```http
DELETE /posts/:postId
```

**Path Parameters:**
- `postId`: UUID of the post to delete

**Response:** `204 No Content`

**Error Responses:**
- `400 Bad Request`: Invalid UUID format for `postId`
- `404 Not Found`: Post not found

**Example:**
```bash
curl -X DELETE http://localhost:3000/posts/123e4567-e89b-12d3-a456-426614174000
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
  "postId": "123e4567-e89b-12d3-a456-426614174000",
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
curl -X POST http://localhost:3000/posts/123e4567-e89b-12d3-a456-426614174000/like \
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
curl -X DELETE http://localhost:3000/posts/123e4567-e89b-12d3-a456-426614174000/like/660e8400-e29b-41d4-a716-446655440002
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
  "postId": "123e4567-e89b-12d3-a456-426614174000",
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
curl -X POST http://localhost:3000/posts/123e4567-e89b-12d3-a456-426614174000/comment \
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
    "postId": "123e4567-e89b-12d3-a456-426614174000",
    "userId": "660e8400-e29b-41d4-a716-446655440002",
    "text": "Great post! Thanks for sharing.",
    "createdAt": 1704067400000
  },
  {
    "id": "889e4567-e89b-12d3-a456-426614174004",
    "postId": "123e4567-e89b-12d3-a456-426614174000",
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
curl http://localhost:3000/posts/123e4567-e89b-12d3-a456-426614174000/comments
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

## Design Notes
- Layered architecture: domain models → repositories → services → routes/controllers.
- In-memory repositories implement repository interfaces and can be swapped later.
- Services encapsulate business rules (e.g., no double-like, counters update).
- Zod validates request DTOs; custom errors map to HTTP responses.

## Tests
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

## License
MIT
