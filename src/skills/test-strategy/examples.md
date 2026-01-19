# Examples

## Testing Pyramid Implementation

### Unit Test (Pure Function)

```typescript
// ✅ Good unit test (Jest/Vitest)
function calculateDiscount(price: number, loyaltyPoints: number): number {
  if (price < 0) throw new Error("Invalid price");
  if (loyaltyPoints >= 1000) return price * 0.9;
  return price;
}

test("applies 10% discount for 1000+ points", () => {
  expect(calculateDiscount(100, 1000)).toBe(90);
});
```

### Integration Test (API/DB)

```typescript
// ✅ Supertest + DB
describe("POST /api/orders", () => {
  test("creates order and updates stock", async () => {
    await db.products.insert({ id: "p1", stock: 10 });

    const res = await request(app)
      .post("/api/orders")
      .send({ productId: "p1", quantity: 2 });

    expect(res.status).toBe(201);
    const product = await db.products.findOne({ id: "p1" });
    expect(product.stock).toBe(8);
  });
});
```

### E2E Test (Playwright)

```typescript
// ✅ Critical user journey
test("user can purchase product", async ({ page }) => {
  await page.goto("/");
  await page.click('text=Buy Now');
  await page.fill('#email', 'user@example.com');
  await page.click('#submit');
  await expect(page.locator('.success')).toBeVisible();
});
```

## Performance Logic

### Benchmark Test

```typescript
test("search completes < 100ms", async () => {
  const start = performance.now();
  await searchService.query("term");
  const duration = performance.now() - start;
  expect(duration).toBeLessThan(100);
});
```
