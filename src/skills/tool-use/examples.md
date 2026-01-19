# Examples

## Validation Logic

### Schema Validation (Zod)

```typescript
import { z } from "zod";

const ProductSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  price: z.number().positive(),
});

async function getProduct(id: string) {
  const res = await fetch(\`/products/\${id}\`);
  const json = await res.json();
  // Fail fast if schema doesn't match
  return ProductSchema.parse(json); 
}
```

## Execution Patterns

### Retry with Backoff

```typescript
async function withBackoff<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries - 1) throw err;
      const delay = Math.pow(2, i) * 1000 + Math.random() * 200;
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw new Error("Failed after retries");
}
```

## Atomic Operations

### Safe File Write

```bash
# Atomic write pattern
temp=$(mktemp)
echo "content" > "$temp"
# Atomic rename
mv "$temp" target_file
```
