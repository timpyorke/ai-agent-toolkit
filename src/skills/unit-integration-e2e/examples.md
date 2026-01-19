# Examples

## Unit Testing (Jest/Vitest)

### Pure Function

```typescript
function calculateDiscount(price: number, loyaltyPoints: number): number {
  if (price < 0) throw new Error("Invalid price");
  if (loyaltyPoints >= 1000) return price * 0.9;
  return price;
}

test("applies 10% discount for 1000+ points", () => {
  expect(calculateDiscount(100, 1000)).toBe(90);
});
```

### Mocking (Spies)

```typescript
test("calls logger on error", () => {
  const logger = { error: vi.fn() }; // or jest.fn()
  const service = new PaymentService(logger);

  service.processPayment(-100);

  expect(logger.error).toHaveBeenCalledWith(expect.stringContaining("Invalid"));
});
```

## Integration Testing

### API & Database (Supertest)

```typescript
describe("POST /api/users", () => {
  test("creates user using real DB", async () => {
    await db.migrate.latest();
    const res = await request(app)
      .post("/api/users")
      .send({ email: "test@example.com" });

    expect(res.status).toBe(201);
    const user = await db('users').where({ email: "test@example.com" }).first();
    expect(user).toBeDefined();
  });
});
```

## E2E Testing (Playwright)

```typescript
test("critical checkout flow", async ({ page }) => {
  await page.goto("/products/1");
  await page.click("button:has-text('Add to Cart')");
  await page.click(".cart-icon");
  await page.click("button:has-text('Checkout')");
  await expect(page.locator(".success-message")).toBeVisible();
});
```
