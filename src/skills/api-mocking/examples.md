# Code Examples

## OpenAPI-Driven Mocks

```bash
# Prism: Mock OpenAPI locally
npm install -g @stoplight/prism-cli
prism mock openapi.yaml --port 4010
```

## GraphQL Mocks

```js
import { makeExecutableSchema } from "@graphql-tools/schema";
import { addMocksToSchema } from "@graphql-tools/mock";

const sdl = `
  type User { id: ID!, name: String!, email: String! }
  type Query { users: [User!]! }
`;

const schema = makeExecutableSchema({ typeDefs: sdl });
const mockedSchema = addMocksToSchema({ schema });
```

## Fixtures & Scenarios

### Organize Mock Data

```
mocks/
├── users.json
├── orders.json
└── scenarios/
    ├── happy-path.json
    ├── rate-limit.json
    └── server-error.json
```

## Error & Latency Simulation

```js
app.get("/users", (req, res) => {
  const scenario = req.headers["x-mock-scenario"];
  if (scenario === "rate-limit") {
    return res.status(429).json({ error: { code: "RATE_LIMIT" } });
  }
  setTimeout(
    () => {
      res.json(usersFixture);
    },
    300 + Math.random() * 700,
  ); // 300-1000ms
});
```
