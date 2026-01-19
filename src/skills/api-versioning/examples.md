# Code Examples

## Versioning Strategies

### URI Path Versioning (Express.js)

```typescript
// Express.js implementation
const express = require("express");
const app = express();

// V1 API
app.get("/v1/users/:id", async (req, res) => {
  const user = await userService.getById(req.params.id);

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
  });
});

// V2 API - Added profile field
app.get("/v2/users/:id", async (req, res) => {
  const user = await userService.getById(req.params.id);

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    profile: {
      avatar: user.avatar,
      bio: user.bio,
      createdAt: user.createdAt,
    },
  });
});
```

### Header Versioning (Middleware)

```typescript
// Middleware to extract version from header
app.use((req, res, next) => {
  const acceptHeader = req.get("Accept") || "";
  const versionMatch = acceptHeader.match(/vnd\.myapi\.v(\d+)/);

  req.apiVersion = versionMatch ? parseInt(versionMatch[1]) : 1;
  next();
});

// Single endpoint, multiple versions
app.get("/users/:id", async (req, res) => {
  const user = await userService.getById(req.params.id);

  switch (req.apiVersion) {
    case 1:
      res.json({ /* ... */ });
      break;
    case 2:
      res.json({ /* ... */ });
      break;
    default:
      res.status(400).json({ error: "Unsupported API version" });
  }
});
```

### Query Parameter Versioning

```typescript
app.get("/users/:id", async (req, res) => {
  const version = parseInt(req.query.version) || 1;
  const user = await userService.getById(req.params.id);

  const serializer = getSerializerForVersion(version);
  res.json(serializer.serialize(user));
});
```

### Custom Header Versioning

```typescript
// Middleware
app.use((req, res, next) => {
  req.apiVersion = parseInt(req.get("X-API-Version")) || 1;
  next();
});
```

## Breaking vs Non-Breaking Changes

### Non-Breaking Changes

```typescript
// ✅ Adding optional fields
// V1
interface UserV1 {
  id: string;
  name: string;
}

// V2 - Adding optional field
interface UserV2 {
  id: string;
  name: string;
  avatar?: string; // Optional - clients can ignore
}
```

### Breaking Changes Requirements

```typescript
// ❌ Removing fields
// V1
interface UserV1 {
  id: string;
  name: string;
  email: string;
}

// V2 - BREAKING: removed email
interface UserV2 {
  id: string;
  name: string;
}
```

## Implementation Patterns

### Version Adapter Pattern

```typescript
// Domain model (internal representation)
class User {
  constructor(
    public id: string,
    public fullName: string,
    public emailAddress: string,
    public avatarUrl: string | null,
    public biography: string | null,
    public registeredAt: Date,
  ) {}
}

// Version adapters
interface UserAdapter {
  toExternal(user: User): any;
  fromExternal(data: any): User;
}

class UserAdapterV1 implements UserAdapter {
  toExternal(user: User) {
    return {
      id: user.id,
      name: user.fullName,
      email: user.emailAddress,
    };
  }
  // ...
}
```

### Feature Flags

```typescript
class FeatureFlags {
  static isV3Enabled(userId: string): boolean {
    // Roll out V3 to 10% of users
    const hash = this.hashUserId(userId);
    return hash % 100 < 10;
  }
}

app.get("/users/:id", async (req, res) => {
  const version = FeatureFlags.isV3Enabled(req.userId) ? 3 : 2;
  const adapter = adapters.get(version);

  const user = await userService.getById(req.params.id);
  res.json(adapter.toExternal(user));
});
```

## Documentation & Contracts

### OpenAPI Specification

```yaml
# openapi-v1.yaml
openapi: 3.0.0
info:
  title: User API
  version: 1.0.0
paths:
  /v1/users/{id}:
    get:
      summary: Get user by ID
      responses:
        "200":
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/UserV1"
```

### GraphQL Versioning

```graphql
# Schema V2 - Additive changes
type User {
  id: ID!
  name: String!
  email: String!
  # New optional fields
  avatar: String
}

# Schema V3 - Deprecation
type User {
  id: ID!
  name: String! @deprecated(reason: "Use 'fullName' instead")
  fullName: String! # New preferred field
}
```

## Deprecation & Testing

### Deprecation Headers

```typescript
app.get("/v1/users/:id", async (req, res) => {
  res.set("Sunset", "Sat, 31 Dec 2024 23:59:59 GMT");
  res.set("Deprecation", "true");
  res.set("Link", '<https://api.example.com/docs/migration/v1-to-v2>; rel="deprecation"');
  // ...
});
```

### Contract Testing

```typescript
import { PactV3 } from "@pact-foundation/pact";

describe("User API Contract Tests", () => {
  const provider = new PactV3({
    consumer: "web-app",
    provider: "user-api",
  });
  // ... tests
});
```

### Client SDK Versioning

```typescript
// SDK V1
class UserAPIClientV1 {
  constructor(private baseUrl: string) {}
  async getUser(id: string): Promise<UserV1> { /* ... */ }
}

// SDK V2 - Backward compatible
class UserAPIClientV2 extends UserAPIClientV1 {
  async getUserWithProfile(id: string): Promise<UserV2> { /* ... */ }
}
```
