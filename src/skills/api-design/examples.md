# Code Examples

## REST Design

### Resource Modeling

```
GET    /users
GET    /users/{id}
POST   /users
PATCH  /users/{id}
DELETE /users/{id}

GET    /users/{id}/orders    # Ownership relation
```

### Pagination, Filtering, Sorting

```
GET /users?limit=50&cursor=abc&sort=-created_at&filter=status:active

Response:
{
  "data": [ ... ],
  "page": {
    "next_cursor": "def",
    "limit": 50
  }
}
```

### Response Shapes & Error Format

```
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "email is invalid",
    "details": [{ "field": "email", "issue": "invalid_format" }],
    "request_id": "rq_123",
    "timestamp": "2026-01-17T03:21:00Z"
  }
}
```

## GraphQL Design

### Schema Guidelines

```
type User {
  id: ID!
  name: String!
  email: String!
  createdAt: DateTime!
}

type Query {
  user(id: ID!): User
  users(first: Int, after: String): UserConnection!
}
```

## Documentation

### OpenAPI Example

```
openapi: 3.0.3
info:
  title: Example API
  version: 1.0.0
paths:
  /users:
    get:
      summary: List users
      parameters:
        - in: query
          name: limit
          schema:
            type: integer
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserList'
components:
  schemas:
    User:
      type: object
      required: [id, name, email]
      properties:
        id: { type: string }
        name: { type: string }
        email: { type: string, format: email }
        created_at: { type: string, format: date-time }
```
