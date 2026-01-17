---
name: API Versioning
description: Evolve APIs gracefully while maintaining backward compatibility and managing deprecation lifecycles
---

# API Versioning Skill

Master strategies for versioning REST APIs, GraphQL schemas, and gRPC services to support multiple client versions simultaneously while enabling continuous evolution.

## Core Principles

### 1. API Contract Stability

- **Contract**: The interface between API provider and consumer
- **Breaking Changes**: Modifications that break existing clients
- **Backward Compatibility**: New versions work with old clients
- **Deprecation**: Phasing out old versions gracefully

### 2. Version Lifecycle

```
Alpha → Beta → Stable → Deprecated → Sunset
  │       │       │         │          │
  │       │       │         │          └─ Removed
  │       │       │         └─ Warning period
  │       │       └─ Production-ready
  │       └─ Feature-complete
  └─ Experimental
```

### 3. Semantic Versioning for APIs

```
MAJOR.MINOR.PATCH
  │     │     │
  │     │     └─ Bug fixes (backward compatible)
  │     └─ New features (backward compatible)
  └─ Breaking changes
```

## Versioning Strategies

### 1. URI Path Versioning

**Format:** `/v{version}/resource`

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

// V3 API - Breaking change: renamed field
app.get("/v3/users/:id", async (req, res) => {
  const user = await userService.getById(req.params.id);

  res.json({
    id: user.id,
    fullName: user.name, // Renamed from 'name'
    email: user.email,
    profile: {
      avatarUrl: user.avatar, // Renamed from 'avatar'
      biography: user.bio, // Renamed from 'bio'
      memberSince: user.createdAt,
    },
  });
});
```

**Pros:**

- ✅ Explicit and visible in URLs
- ✅ Easy to route to different implementations
- ✅ Simple to cache
- ✅ Works with all HTTP clients

**Cons:**

- ❌ URL pollution
- ❌ Not RESTful (URI should identify resource, not version)
- ❌ Can't version individual endpoints

### 2. Header Versioning

**Format:** `Accept: application/vnd.myapi.v2+json`

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
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
      });
      break;

    case 2:
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
      break;

    case 3:
      res.json({
        id: user.id,
        fullName: user.name,
        email: user.email,
        profile: {
          avatarUrl: user.avatar,
          biography: user.bio,
          memberSince: user.createdAt,
        },
      });
      break;

    default:
      res.status(400).json({ error: "Unsupported API version" });
  }
});
```

**Pros:**

- ✅ RESTful (URI stays clean)
- ✅ Can version individual resources
- ✅ Content negotiation standard

**Cons:**

- ❌ Not visible in URLs
- ❌ Harder to test in browsers
- ❌ Requires custom header support

### 3. Query Parameter Versioning

**Format:** `/users?version=2`

```typescript
app.get("/users/:id", async (req, res) => {
  const version = parseInt(req.query.version) || 1;
  const user = await userService.getById(req.params.id);

  const serializer = getSerializerForVersion(version);
  res.json(serializer.serialize(user));
});

// Serializers for different versions
const serializers = {
  1: {
    serialize(user) {
      return {
        id: user.id,
        name: user.name,
        email: user.email,
      };
    },
  },
  2: {
    serialize(user) {
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        profile: {
          avatar: user.avatar,
          bio: user.bio,
          createdAt: user.createdAt,
        },
      };
    },
  },
};

function getSerializerForVersion(version) {
  return serializers[version] || serializers[1];
}
```

**Pros:**

- ✅ Easy to test and debug
- ✅ Can be mixed with other parameters
- ✅ Simple implementation

**Cons:**

- ❌ Pollutes query parameters
- ❌ Not RESTful
- ❌ Can conflict with other query params

### 4. Custom Header Versioning

**Format:** `X-API-Version: 2`

```typescript
// Middleware
app.use((req, res, next) => {
  req.apiVersion = parseInt(req.get("X-API-Version")) || 1;
  next();
});

// Version controller
class UserController {
  async getUser(req, res) {
    const user = await this.userService.getById(req.params.id);
    const presenter = this.getPresenter(req.apiVersion);

    res.json(presenter.present(user));
  }

  getPresenter(version) {
    const presenters = {
      1: new UserPresenterV1(),
      2: new UserPresenterV2(),
      3: new UserPresenterV3(),
    };

    return presenters[version] || presenters[1];
  }
}

// Presenters (view layer)
class UserPresenterV1 {
  present(user) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }
}

class UserPresenterV2 {
  present(user) {
    return {
      ...new UserPresenterV1().present(user),
      profile: {
        avatar: user.avatar,
        bio: user.bio,
        createdAt: user.createdAt,
      },
    };
  }
}
```

**Pros:**

- ✅ Simple and explicit
- ✅ Separate from URL and body
- ✅ Easy to add middleware

**Cons:**

- ❌ Not standard (unlike Accept header)
- ❌ Requires header support
- ❌ Less discoverable

## Breaking vs Non-Breaking Changes

### Non-Breaking Changes (Safe)

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

// ✅ Adding new endpoints
// V1 has /users/:id
// V2 adds /users/:id/posts (new endpoint)

// ✅ Adding new optional query parameters
// V1: GET /users?page=1
// V2: GET /users?page=1&sort=name (optional)

// ✅ Adding new values to enums (with careful handling)
enum Status {
  ACTIVE = "active",
  INACTIVE = "inactive",
  PENDING = "pending", // New value
}

// ✅ Relaxing validation
// V1: name must be 1-50 chars
// V2: name must be 1-100 chars (more permissive)
```

### Breaking Changes (Require New Version)

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

// ❌ Renaming fields
// V1: { "user_id": "123" }
// V2: { "id": "123" }  // BREAKING

// ❌ Changing field types
// V1: { "amount": 100 }  // number
// V2: { "amount": "100.00" }  // string - BREAKING

// ❌ Removing endpoints
// V1: DELETE /users/:id
// V2: Endpoint removed - BREAKING

// ❌ Changing required fields
// V1: name is optional
// V2: name is required - BREAKING

// ❌ Changing URL structure
// V1: /users/:id
// V2: /accounts/:id  // BREAKING

// ❌ Changing authentication
// V1: API key
// V2: OAuth only - BREAKING
```

## Implementation Patterns

### 1. Version Adapter Pattern

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

  fromExternal(data: any): User {
    return new User(data.id, data.name, data.email, null, null, new Date());
  }
}

class UserAdapterV2 implements UserAdapter {
  toExternal(user: User) {
    return {
      id: user.id,
      name: user.fullName,
      email: user.emailAddress,
      profile: {
        avatar: user.avatarUrl,
        bio: user.biography,
        createdAt: user.registeredAt.toISOString(),
      },
    };
  }

  fromExternal(data: any): User {
    return new User(
      data.id,
      data.name,
      data.email,
      data.profile?.avatar || null,
      data.profile?.bio || null,
      new Date(data.profile?.createdAt || Date.now()),
    );
  }
}

class UserAdapterV3 implements UserAdapter {
  toExternal(user: User) {
    return {
      id: user.id,
      fullName: user.fullName, // Renamed field
      email: user.emailAddress,
      profile: {
        avatarUrl: user.avatarUrl,
        biography: user.biography,
        memberSince: user.registeredAt.toISOString(),
      },
    };
  }

  fromExternal(data: any): User {
    return new User(
      data.id,
      data.fullName,
      data.email,
      data.profile?.avatarUrl || null,
      data.profile?.biography || null,
      new Date(data.profile?.memberSince || Date.now()),
    );
  }
}

// Controller uses adapter
class UserController {
  constructor(
    private userService: UserService,
    private adapters: Map<number, UserAdapter>,
  ) {
    this.adapters.set(1, new UserAdapterV1());
    this.adapters.set(2, new UserAdapterV2());
    this.adapters.set(3, new UserAdapterV3());
  }

  async getUser(req, res) {
    const user = await this.userService.getById(req.params.id);
    const adapter = this.adapters.get(req.apiVersion) || this.adapters.get(1);

    res.json(adapter.toExternal(user));
  }

  async createUser(req, res) {
    const adapter = this.adapters.get(req.apiVersion) || this.adapters.get(1);
    const user = adapter.fromExternal(req.body);

    const created = await this.userService.create(user);
    res.status(201).json(adapter.toExternal(created));
  }
}
```

### 2. OpenAPI Specification Versioning

```yaml
# openapi-v1.yaml
openapi: 3.0.0
info:
  title: User API
  version: 1.0.0
  description: User management API v1
paths:
  /v1/users/{id}:
    get:
      summary: Get user by ID
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        "200":
          description: Success
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/UserV1"
components:
  schemas:
    UserV1:
      type: object
      required:
        - id
        - name
        - email
      properties:
        id:
          type: string
        name:
          type: string
        email:
          type: string
          format: email
```

```yaml
# openapi-v2.yaml
openapi: 3.0.0
info:
  title: User API
  version: 2.0.0
  description: User management API v2
paths:
  /v2/users/{id}:
    get:
      summary: Get user by ID
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        "200":
          description: Success
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/UserV2"
components:
  schemas:
    UserV2:
      type: object
      required:
        - id
        - name
        - email
      properties:
        id:
          type: string
        name:
          type: string
        email:
          type: string
          format: email
        profile:
          type: object
          properties:
            avatar:
              type: string
              format: uri
            bio:
              type: string
            createdAt:
              type: string
              format: date-time
```

### 3. GraphQL Versioning

GraphQL encourages evolution without versioning, but you can still version:

```graphql
# Schema V1
type User {
  id: ID!
  name: String!
  email: String!
}

type Query {
  user(id: ID!): User
}

# Schema V2 - Additive changes (non-breaking)
type User {
  id: ID!
  name: String!
  email: String!
  # New optional fields
  avatar: String
  bio: String
  createdAt: DateTime
}

type Query {
  user(id: ID!): User
  # New query
  users(limit: Int = 10, offset: Int = 0): [User!]!
}

# Schema V3 - Deprecation
type User {
  id: ID!
  name: String! @deprecated(reason: "Use 'fullName' instead")
  fullName: String! # New preferred field
  email: String!
  avatar: String @deprecated(reason: "Use 'avatarUrl' instead")
  avatarUrl: String
  bio: String
  createdAt: DateTime
}
```

**Client queries with field selection:**

```graphql
# Client can request only what they need
query GetUser($id: ID!) {
  user(id: $id) {
    id
    name # V1 field
    avatar # V2 field
    fullName # V3 field
  }
}
```

## Deprecation Strategy

### 1. Deprecation Headers

```typescript
// Add deprecation warnings
app.get("/v1/users/:id", async (req, res) => {
  // Sunset header (RFC 8594)
  res.set("Sunset", "Sat, 31 Dec 2024 23:59:59 GMT");

  // Deprecation header
  res.set("Deprecation", "true");

  // Link to migration guide
  res.set(
    "Link",
    '<https://api.example.com/docs/migration/v1-to-v2>; rel="deprecation"',
  );

  const user = await userService.getById(req.params.id);
  res.json(user);
});

// Track deprecated API usage
app.use("/v1/*", (req, res, next) => {
  metrics.increment("api.deprecated.v1.requests", {
    endpoint: req.path,
    client: req.get("User-Agent"),
  });

  next();
});
```

### 2. Deprecation Timeline

```
Month 1-2: Announce deprecation
  - Add Sunset headers
  - Update documentation
  - Email notifications

Month 3-4: Warning period
  - Log deprecated usage
  - Contact high-volume users
  - Provide migration guides

Month 5-6: Grace period
  - Reduce support for deprecated version
  - Add response warnings
  - Final reminders

Month 7: Sunset
  - Disable deprecated endpoints
  - Return 410 Gone
  - Redirect to migration guide
```

### 3. Sunset Response

```typescript
app.get("/v1/users/:id", (req, res) => {
  res.status(410).json({
    error: {
      code: "API_VERSION_RETIRED",
      message: "API v1 was retired on December 31, 2024",
      migrationGuide: "https://api.example.com/docs/migration/v1-to-v2",
      currentVersion: "v2",
      links: {
        v2Endpoint: "/v2/users/:id",
        docs: "https://api.example.com/docs/v2",
      },
    },
  });
});
```

## Testing Across Versions

### Contract Testing

```typescript
import { PactV3 } from "@pact-foundation/pact";

describe("User API Contract Tests", () => {
  const provider = new PactV3({
    consumer: "web-app",
    provider: "user-api",
  });

  describe("V1 API", () => {
    test("GET /v1/users/:id returns user", async () => {
      await provider
        .given("user 123 exists")
        .uponReceiving("a request for user 123")
        .withRequest({
          method: "GET",
          path: "/v1/users/123",
        })
        .willRespondWith({
          status: 200,
          body: {
            id: "123",
            name: "John Doe",
            email: "john@example.com",
          },
        });

      await provider.executeTest(async (mockServer) => {
        const response = await fetch(`${mockServer.url}/v1/users/123`);
        const user = await response.json();

        expect(user).toHaveProperty("id");
        expect(user).toHaveProperty("name");
        expect(user).toHaveProperty("email");
      });
    });
  });

  describe("V2 API", () => {
    test("GET /v2/users/:id returns user with profile", async () => {
      await provider
        .given("user 123 exists")
        .uponReceiving("a request for user 123")
        .withRequest({
          method: "GET",
          path: "/v2/users/123",
        })
        .willRespondWith({
          status: 200,
          body: {
            id: "123",
            name: "John Doe",
            email: "john@example.com",
            profile: {
              avatar: "https://example.com/avatar.jpg",
              bio: "Software engineer",
              createdAt: "2024-01-01T00:00:00Z",
            },
          },
        });

      await provider.executeTest(async (mockServer) => {
        const response = await fetch(`${mockServer.url}/v2/users/123`);
        const user = await response.json();

        expect(user).toHaveProperty("profile");
        expect(user.profile).toHaveProperty("avatar");
      });
    });
  });
});
```

### Version Compatibility Tests

```typescript
describe("API Version Compatibility", () => {
  test("V1 response structure is valid", async () => {
    const response = await fetch("/v1/users/123");
    const user = await response.json();

    // V1 schema validation
    expect(user).toMatchObject({
      id: expect.any(String),
      name: expect.any(String),
      email: expect.any(String),
    });

    // Should not have V2 fields
    expect(user).not.toHaveProperty("profile");
  });

  test("V2 is backward compatible with V1", async () => {
    const v1Response = await fetch("/v1/users/123");
    const v2Response = await fetch("/v2/users/123");

    const v1User = await v1Response.json();
    const v2User = await v2Response.json();

    // V2 should include all V1 fields
    expect(v2User.id).toBe(v1User.id);
    expect(v2User.name).toBe(v1User.name);
    expect(v2User.email).toBe(v1User.email);

    // Plus additional V2 fields
    expect(v2User).toHaveProperty("profile");
  });

  test("V3 field renames are consistent", async () => {
    const v2Response = await fetch("/v2/users/123");
    const v3Response = await fetch("/v3/users/123");

    const v2User = await v2Response.json();
    const v3User = await v3Response.json();

    // Renamed fields have same values
    expect(v3User.fullName).toBe(v2User.name);
    expect(v3User.profile.avatarUrl).toBe(v2User.profile.avatar);
  });
});
```

## Client SDK Versioning

```typescript
// SDK V1
class UserAPIClientV1 {
  constructor(private baseUrl: string) {}

  async getUser(id: string): Promise<UserV1> {
    const response = await fetch(`${this.baseUrl}/v1/users/${id}`);
    return response.json();
  }
}

// SDK V2 - Backward compatible
class UserAPIClientV2 extends UserAPIClientV1 {
  async getUserWithProfile(id: string): Promise<UserV2> {
    const response = await fetch(`${this.baseUrl}/v2/users/${id}`);
    return response.json();
  }

  async listUsers(limit: number = 10, offset: number = 0): Promise<UserV2[]> {
    const response = await fetch(
      `${this.baseUrl}/v2/users?limit=${limit}&offset=${offset}`,
    );
    return response.json();
  }
}

// SDK V3 - Breaking changes
class UserAPIClientV3 {
  constructor(private baseUrl: string) {}

  async getUser(id: string): Promise<UserV3> {
    const response = await fetch(`${this.baseUrl}/v3/users/${id}`);
    return response.json();
  }

  // Migration helper
  static fromV2(client: UserAPIClientV2): UserAPIClientV3 {
    return new UserAPIClientV3(client.baseUrl);
  }
}

// Usage
const clientV1 = new UserAPIClientV1("https://api.example.com");
const user = await clientV1.getUser("123"); // Returns UserV1

const clientV2 = new UserAPIClientV2("https://api.example.com");
const userWithProfile = await clientV2.getUserWithProfile("123"); // Returns UserV2

// Migrate to V3
const clientV3 = UserAPIClientV3.fromV2(clientV2);
const modernUser = await clientV3.getUser("123"); // Returns UserV3
```

## Best Practices

### 1. Version Your API from Day One

```typescript
// Bad: No versioning
app.get("/users/:id", handler);

// Good: Versioned from start
app.get("/v1/users/:id", handler);
```

### 2. Support N-1 Versions

```
Current: v3
Support: v3 (stable), v2 (deprecated), v1 (sunset soon)
```

### 3. Document Every Change

```markdown
## Changelog

### v3.0.0 (2024-03-01)

**Breaking Changes:**

- Renamed `name` to `fullName` in User object
- Renamed `avatar` to `avatarUrl` in profile
- Removed deprecated `/users/search` endpoint

**New Features:**

- Added `/users/:id/posts` endpoint
- Added pagination to `/users` endpoint

**Deprecations:**

- `/v2/users` will be retired on 2024-12-31

### v2.0.0 (2023-06-01)

**New Features:**

- Added `profile` object to User
- Added `/users` list endpoint

### v1.0.0 (2023-01-01)

- Initial release
```

### 4. Use Feature Flags for Gradual Rollout

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

## Anti-Patterns

### ❌ Micro-Versioning

```
Problem: Creating new version for every tiny change
/v1.0.0/users
/v1.0.1/users
/v1.0.2/users
...
/v1.5.3/users

Solution: Version only on breaking changes
```

### ❌ No Deprecation Period

```
Problem: Removing old version immediately
2024-01-01: v2 released
2024-01-02: v1 removed ❌

Solution: Provide 6-12 month deprecation period
2024-01-01: v2 released
2024-01-01 to 2024-06-30: v1 deprecated
2024-07-01: v1 removed
```

### ❌ Versioning Individual Fields

```typescript
// Bad: Field-level versioning
{
  "name_v1": "John",
  "name_v2": "John Doe",
  "email_v1": "john@example.com",
  "email_v2": {
    "address": "john@example.com",
    "verified": true
  }
}

// Good: Version the whole resource
// V1: /v1/users/123 → { name, email }
// V2: /v2/users/123 → { name, email: { address, verified } }
```

## Quick Reference

### Version Comparison

| Strategy      | Visibility | Caching | RESTful | Ease of Use |
| ------------- | ---------- | ------- | ------- | ----------- |
| URI Path      | High       | Easy    | No      | High        |
| Accept Header | Low        | Medium  | Yes     | Medium      |
| Query Param   | High       | Easy    | No      | High        |
| Custom Header | Medium     | Medium  | Yes     | Medium      |

### Decision Matrix

**Use URI Path when:**

- API is public-facing
- Simplicity is priority
- Multiple major versions coexist long-term

**Use Accept Header when:**

- Following REST principles strictly
- Need content negotiation
- Internal microservices

**Use Custom Header when:**

- Want simple header parsing
- Need explicit version control
- Middleware-based routing

## Resources

- [REST API Versioning (Microsoft)](https://docs.microsoft.com/en-us/azure/architecture/best-practices/api-design#versioning-a-restful-web-api)
- [API Evolution (Stripe)](https://stripe.com/blog/api-versioning)
- [GraphQL Schema Evolution](https://graphql.org/learn/best-practices/#versioning)
- [Semantic Versioning](https://semver.org/)
- [RFC 8594 - Sunset HTTP Header](https://datatracker.ietf.org/doc/html/rfc8594)

---

_API versioning enables continuous evolution while maintaining stability and trust with clients through clear contracts and graceful deprecation._
