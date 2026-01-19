# Examples

## Intent-Revealing Comments

### Document Decisions and Constraints

```java
// ✅ Explains design decision
// We use a thread pool size of 10 instead of dynamic sizing because:
// 1. AWS Lambda has a max of 10 concurrent connections to RDS
// 2. Higher values caused connection pool exhaustion
// 3. Tested 5, 10, 20, 50 - 10 was optimal (benchmark: docs/benchmarks/thread-pool.md)
ExecutorService executor = Executors.newFixedThreadPool(10);

// ✅ Explains constraint
// IMPORTANT: This value MUST match the database column size (VARCHAR(255))
// Changing this requires a database migration.
private static final int MAX_USERNAME_LENGTH = 255;

// ✅ Explains performance consideration
// Cache results for 5 minutes because:
// - User preferences change infrequently
// - API call to preference service takes 200-300ms
// - 5 min TTL balances freshness vs performance
@Cacheable(ttl = Duration.ofMinutes(5))
public UserPreferences getUserPreferences(String userId) {
  // ...
}
```

### Document Gotchas and Edge Cases

```python
def calculate_discount(price, user_tier):
    """Calculate discount based on user tier."""

    # GOTCHA: Gold tier discount is 15%, not 20%, per legal agreement.
    # Even though marketing says 20%, contract specifies 15%.
    # See: contracts/gold-tier-2024.pdf
    if user_tier == 'gold':
        return price * 0.15

    # Edge case: Free tier users don't get discounts on sale items
    # to prevent coupon stacking abuse (policy from 2023-Q3)
    if user_tier == 'free' and price.is_on_sale:
        return 0

    return price * DISCOUNT_RATES.get(user_tier, 0)
```

### Document Concurrency Considerations

```go
// ✅ Explains locking strategy
// We lock the entire map instead of individual entries to prevent deadlock.
s.sessionMutex.Lock()
defer s.sessionMutex.Unlock()
```

## Documentation Comments

### JSDoc (JavaScript/TypeScript)

```typescript
/**
 * Authenticates a user with email and password
 *
 * @param email - User's email address
 * @param password - User's password (plain text, will be hashed)
 * @returns JWT token for authenticated session
 * @throws {AuthenticationError} If credentials are invalid
 * @throws {RateLimitError} If too many failed attempts
 *
 * @example
 * ```typescript
 * const token = await authenticateUser('user@example.com', 'password123');
 * console.log(token); // "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * ```
 *
 * @see {@link https://docs.app.com/auth | Authentication Guide}
 */
export async function authenticateUser(
  email: string,
  password: string,
): Promise<string> {
  // Implementation...
}
```

### Python Docstrings

```python
def calculate_compound_interest(
    principal: float,
    rate: float,
    time: float,
    compounds_per_year: int = 12
) -> float:
    """
    Calculate compound interest on an investment.

    Uses the formula: A = P(1 + r/n)^(nt)
    where:
    - A = final amount
    - P = principal (initial investment)
    - r = annual interest rate (as decimal)
    - n = number of times interest is compounded per year
    - t = time in years

    Args:
        principal: Initial investment amount in dollars
        rate: Annual interest rate as a decimal (e.g., 0.05 for 5%)
        time: Investment duration in years
        compounds_per_year: How many times per year interest is compounded.
            Defaults to 12 (monthly). Common values: 1 (yearly), 4 (quarterly),
            12 (monthly), 365 (daily).

    Returns:
        Final amount after compound interest is applied

    Raises:
        ValueError: If principal, rate, or time is negative
        ValueError: If compounds_per_year is less than 1

    Examples:
        >>> calculate_compound_interest(1000, 0.05, 10)
        1647.01

        >>> calculate_compound_interest(5000, 0.03, 5, compounds_per_year=365)
        5809.17

    Note:
        This calculation assumes a constant interest rate over the entire period.
        Real-world returns may vary.

    See Also:
        - `calculate_simple_interest`: For simple interest calculation
        - `calculate_effective_rate`: To convert nominal to effective rate

    References:
        https://en.wikipedia.org/wiki/Compound_interest
    """
    if principal < 0 or rate < 0 or time < 0:
        raise ValueError("Principal, rate, and time must be non-negative")
    if compounds_per_year < 1:
        raise ValueError("Compounds per year must be at least 1")

    amount = principal * (1 + rate / compounds_per_year) ** (compounds_per_year * time)
    return round(amount, 2)
```

### Java Javadoc

```java
/**
 * Service for managing user accounts.
 *
 * <p>This service provides methods for creating, updating, and deleting
 * user accounts. All operations are transactional and will rollback on error.
 *
 * <p><b>Thread Safety:</b> This class is thread-safe. Multiple threads can
 * safely call methods concurrently.
 *
 * <p><b>Example Usage:</b>
 * <pre>{@code
 * UserService userService = new UserService(database);
 * User user = userService.createUser("john@example.com", "John Doe");
 * }</pre>
 *
 * @author Jane Smith
 * @version 2.0
 * @since 1.0
 * @see User
 * @see UserRepository
 */
public class UserService {

    /**
     * Creates a new user account.
     *
     * <p>The user will be created with a default "active" status and
     * a welcome email will be sent asynchronously.
     *
     * @param email the user's email address, must be unique and valid format
     * @param name the user's display name, must be 3-50 characters
     * @return the newly created user with generated ID
     * @throws DuplicateEmailException if email already exists
     * @throws ValidationException if email or name format is invalid
     * @throws DatabaseException if database operation fails
     */
    public User createUser(String email, String name)
            throws DuplicateEmailException, ValidationException, DatabaseException {
        // Implementation...
    }
}
```

### Go Comments

```go
// Package userservice provides user account management functionality.
//
// This package handles user creation, authentication, and profile management.
// All operations are concurrent-safe and can be called from multiple goroutines.
//
// Example:
//
//	service := userservice.New(db)
//	user, err := service.CreateUser(ctx, "user@example.com", "password123")
//	if err != nil {
//	    log.Fatal(err)
//	}
package userservice

// User represents a registered user in the system.
type User struct {
    // ID is the unique identifier for the user.
    // Generated automatically when user is created.
    ID string

    // Email is the user's email address.
    // Must be unique across all users.
    Email string

    // CreatedAt is the timestamp when the user was created.
    // Set automatically, cannot be modified.
    CreatedAt time.Time
}
```

## TODO/FIXME/HACK Conventions

### Standard Markers

```typescript
// HACK: Temporary workaround for third-party API returning wrong format
// Remove after: API provider deploys fix (ETA 2024-03-30)
// Proper solution: Update API contract once fixed
// Tracking: https://provider.com/changelog#march-2024
function parseResponse(response) {
  // Workaround: API returns {"data": "[1,2,3]"} instead of {"data": [1,2,3]}
  if (typeof response.data === "string") {
    response.data = JSON.parse(response.data);
  }
  return response;
}

// NOTE: This approach was chosen over alternatives for specific reasons
// Considered: Redis cache, but adds complexity and another failure point
// Chose: In-memory cache because dataset is small (< 1000 items)
const inMemoryCache = new Map();

// OPTIMIZE: This O(n²) algorithm is slow for large datasets
// Current: Works fine for < 100 items (typical case)
// Future: If dataset grows, use hash map for O(n) solution
// Benchmark: 100 items = 5ms, 1000 items = 500ms
function findDuplicates(items) {
  // Nested loop...
}

// SECURITY: Input validation required before using in SQL query
// Risk: SQL injection if unvalidated
// Mitigation: Using parameterized queries
// Audit: Security review completed 2024-02-15
function getUserByEmail(email) {
  // Parameterized query prevents SQL injection
  return db.query("SELECT * FROM users WHERE email = ?", [email]);
}
```

### Detailed TODO Format

```typescript
/**
 * Standard format for action comments:
 *
 * [MARKER]: Brief description
 * [Optional] Context/reason
 * [Optional] Assigned: @username
 * [Optional] Deadline: YYYY-MM-DD
 * [Optional] Related: Issue/PR/Doc link
 */

// TODO: Add input validation
// Reason: Users can submit malformed data causing crashes
// Assigned: @bob
// Deadline: 2024-04-15
// Related: https://github.com/org/repo/issues/456

// FIXME: Memory leak in WebSocket connection
// Impact: Server OOM after 24 hours uptime
// Investigation: Suspect listeners not cleaned up on disconnect
// Related: https://github.com/org/repo/issues/789
```

### Tracking TODOs Script

```bash
# Find all TODOs in codebase
grep -r "// TODO" src/

# Generate TODO report
cat > scripts/todo-report.sh << 'EOF'
#!/bin/bash
echo "=== TODO Report ==="
echo ""
grep -rn "// TODO" src/ | while read -r line; do
  file=$(echo "$line" | cut -d: -f1)
  lineno=$(echo "$line" | cut -d: -f2)
  comment=$(echo "$line" | cut -d: -f3-)
  echo "📝 $file:$lineno"
  echo "   $comment"
  echo ""
done
EOF

chmod +x scripts/todo-report.sh
./scripts/todo-report.sh
```
