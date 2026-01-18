---
name: code-comments
description: Intent-revealing comments that explain the why, capture constraints/invariants, and document APIs without duplicating code
---

# Code Comments

> **Category**: Documentation & DX  
> **Audience**: All developers  
> **Prerequisites**: Basic programming experience  
> **Complexity**: Beginner to Intermediate

## Overview

Code comments explain _why_ code exists, not _what_ it does. This skill covers when to write comments (intent, not implementation), intent-revealing comments for non-obvious decisions, TODO/FIXME/HACK conventions for tracking work, avoiding redundant comments that duplicate code, and documentation comments (JSDoc, docstrings) for public APIs—helping future developers (including yourself) understand the codebase.

## Why Code Comments?

**Without comments**: "Why did they do this?" → Confusion, fear to change, cargo cult programming.

**With comments**: Clear intent, confident changes, maintainable code.

**Real-world scenario**:

```javascript
// ❌ No explanation
if (user.age >= 18 && user.age <= 65) {
  // ...complex logic...
}

// ✅ Explains why
// Only working-age adults are eligible for this insurance product.
// Regulatory requirement: Policy XYZ-789 (see docs/compliance/insurance-eligibility.md)
if (user.age >= 18 && user.age <= 65) {
  // ...complex logic...
}
```

## When to Comment (Why, Not What)

### Comment the Why, Not the What

**The What (code shows this)**

```python
# ❌ Redundant: repeats what code says
# Increment counter by 1
counter += 1

# ❌ Redundant: obvious from code
# Check if user is active
if user.is_active:
    # Send welcome email
    send_email(user.email, "Welcome!")
```

**The Why (code doesn't show this)**

```python
# ✅ Explains reasoning
# We increment counter before the API call because the external service
counter += 1
api.process(counter)
# ✅ Explains business logic
# Only send welcome email to active users to avoid confusion.
# Inactive users might be in trial period or churned customers.
if user.is_active:
    send_email(user.email, "Welcome!")
```

### When Code Is Self-Explanatory

````typescript
// ❌ Unnecessary comment
/**
 * Validates email
 */
// ✅ No comment needed - code is clear
const user = await getUserById(id);
if (!user) {
### When Comments Add Value

```typescript
// ✅ Explains non-obvious algorithm choice
// Using binary search instead of linear search because dataset can be 10k+ items.
// Benchmark: 100ms → 5ms (95% improvement)
const result = binarySearch(sortedArray, target);

// ✅ Explains workaround for bug
// HACK: Force garbage collection to work around memory leak in PDF library v2.3.
// Remove when upgrading to v2.4+ where leak is fixed.
// Tracking: https://github.com/pdf-lib/pdf/issues/456
if (global.gc) global.gc();

// ✅ Explains surprising code
// Intentionally not awaiting this promise. Fire-and-forget analytics event.
// We don't want analytics to block user experience.
trackEvent("button_clicked"); // Don't await
````

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

## TODO/FIXME/HACK Conventions

### Standard Markers

async function fetchData() {
  return await api.get("/data");
}
function saveUserProfile(userId, data) {
  database.update(userId, data);
}

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

### Formatting Convention

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

### Tracking TODOs

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

# ❌ Redundant: Repeats code

# Create a list

items = []

# ❌ Redundant: Obvious from variable name

# User's email address

user_email = "user@example.com"

# ❌ Redundant: Function name is clear

# Returns the sum of two numbers

def sum(a, b):
return a + b

# ❌ Redundant: Type annotation shows this

def get_user(user_id: int) -> User:
"""Gets a user by ID.""" # Redundant
pass

# ❌ Outdated comment (code changed but comment didn't)

# Returns list of active users

def get_users(): # Actually returns ALL users now, not just active ones
return User.objects.all()

````

### Self-Documenting Code Instead

```typescript
// ❌ Comment to explain unclear code
// Check if user has permission
if (u.r.includes("admin") || u.r.includes("moderator")) {
  // ...
}

// ✅ Self-documenting code, no comment needed
const hasModeratorPermission =
  user.roles.includes("admin") || user.roles.includes("moderator");
if (hasModeratorPermission) {
  // ...
}

// Even better: Extract to function
function hasModeratorPermission(user: User): boolean {
  return user.roles.includes("admin") || user.roles.includes("moderator");
}

if (hasModeratorPermission(user)) {
  // ...
}
````

### Refactor Instead of Comment

```java
// ❌ Complex code needs comment
// Calculate total with discount, tax, and shipping
double total = (p * q) * (1 - d) * (1 + t) + s;

// ✅ Self-documenting code
double subtotal = price * quantity;
double discountedPrice = subtotal * (1 - discountRate);
double priceWithTax = discountedPrice * (1 + taxRate);
double total = priceWithTax + shippingCost;

// ✅ Even better: Extract to function
double total = calculateOrderTotal(price, quantity, discountRate, taxRate, shippingCost);
```

## Documentation Comments (JSDoc, Docstrings)

### JSDoc (JavaScript/TypeScript)

````typescript
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

/**
 * Configuration options for the API client
 */
interface ApiClientOptions {
  /**
   * Base URL for API requests
   * @default "https://api.example.com"
   */
  baseUrl?: string;

  /**
   * Request timeout in milliseconds
   * @default 5000
   */
  timeout?: number;

  /**
   * Number of retry attempts for failed requests
   * @default 3
   */
  retries?: number;
}

/**
 * User entity representing a registered user
 */
class User {
  /**
   * Unique identifier for the user
   */
  id: string;

  /**
   * User's email address (must be unique)
   */
  email: string;

  /**
   * User's display name
   * @minLength 3
   * @maxLength 50
   */
  name: string;

  /**
   * Timestamp when user was created
   * @readonly
   */
  createdAt: Date;
}
````

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


class DatabaseConnection:
    """
    Manages a connection to a PostgreSQL database.

    This class provides a context manager for database connections,
    ensuring connections are properly closed even if errors occur.

    Attributes:
        host: Database host address
        port: Database port number
        database: Database name
        is_connected: Whether the connection is currently open

    Example:
        >>> with DatabaseConnection('localhost', 5432, 'mydb') as db:
        ...     results = db.query('SELECT * FROM users')
        ...     # Connection automatically closed after block
    """

    def __init__(self, host: str, port: int, database: str):
        """
        Initialize database connection parameters.

        Args:
            host: Database server hostname or IP address
            port: Port number (typically 5432 for PostgreSQL)
            database: Name of the database to connect to

        Note:
            Connection is not established until `connect()` is called
            or context manager is entered.
        """
        self.host = host
        self.port = port
        self.database = database
        self.is_connected = False
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

    /**
     * Updates an existing user's information.
     *
     * <p><b>Note:</b> Only non-null fields in the update object will be modified.
     * Other fields will remain unchanged.
     *
     * @param userId the unique identifier of the user to update
     * @param updates object containing fields to update
     * @return the updated user
     * @throws UserNotFoundException if user with given ID doesn't exist
     * @throws ValidationException if update data is invalid
     * @deprecated Use {@link #updateUser(String, UserUpdateRequest)} instead.
     *             This method will be removed in version 3.0.
     */
    @Deprecated
    public User updateUser(String userId, Map<String, Object> updates) {
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

// CreateUser creates a new user account.
//
// The email must be unique and in valid format. Password will be hashed
// using bcrypt before storing.
//
// Returns the created user or an error if:
//   - email is already registered (ErrDuplicateEmail)
//   - email format is invalid (ErrInvalidEmail)
//   - password is too weak (ErrWeakPassword)
//   - database operation fails (wrapped error)
//
// Example:
//
//	user, err := service.CreateUser(ctx, "user@example.com", "SecurePass123!")
//	if err != nil {
//	    if errors.Is(err, ErrDuplicateEmail) {
//	        // Handle duplicate email
//	    }
//	    return err
//	}
//	fmt.Printf("Created user: %s\n", user.ID)
func (s *Service) CreateUser(ctx context.Context, email, password string) (*User, error) {
    // Implementation...
}
```

## Comment Maintenance

### Keeping Comments in Sync

```typescript
// ❌ Comment out of sync with code
// Returns list of active users
function getUsers() {
  // Code was changed to return all users, not just active ones
  return db.users.findAll(); // Now returns ALL users
}

// ✅ Update comment when code changes
// Returns all users (active and inactive)
function getUsers() {
  return db.users.findAll();
}

// ✅ Even better: Make code self-documenting
function getAllUsers() {
  return db.users.findAll();
}

function getActiveUsers() {
  return db.users.findAll({ where: { status: "active" } });
}
```

### Deleting Obsolete Comments

```python
# ❌ Commented-out code (delete it, git remembers)
# def old_calculation(x, y):
#     return x + y  # Old implementation

def new_calculation(x, y):
    return x * y  # New implementation

# ✅ Just delete old code
def calculate(x, y):
    return x * y
```

### Versioned Documentation

```java
/**
 * Calculates user's discount based on loyalty tier.
 *
 * @param user the user to calculate discount for
 * @return discount percentage (0.0 to 1.0)
 *
 * @since 1.0
 * @deprecated since 2.0, use {@link #calculateDynamicDiscount(User)} instead.
 *             This method uses fixed discount rates and will be removed in 3.0.
 */
@Deprecated
public double calculateDiscount(User user) {
    // Legacy implementation...
}

/**
 * Calculates user's discount using dynamic pricing algorithm.
 *
 * Takes into account user's purchase history, current promotions,
 * and seasonal adjustments.
 *
 * @param user the user to calculate discount for
 * @return discount percentage (0.0 to 1.0)
 * @since 2.0
 */
public double calculateDynamicDiscount(User user) {
    // New implementation...
}
```

## Best Practices

### ✅ DO

1. **Explain why, not what**

```javascript
// ✅ Explains reasoning
// Using setTimeout instead of setInterval to prevent overlap
// if previous execution takes longer than interval
setTimeout(function tick() {
  doWork();
  setTimeout(tick, 1000);
}, 1000);
```

2. **Document public APIs**

```typescript
// ✅ Complete API documentation
/**
 * Fetches user profile data
 * @param userId - Unique user identifier
 * @returns User profile or null if not found
 * @throws {ApiError} If API request fails
 */
export async function fetchUserProfile(
  userId: string,
): Promise<UserProfile | null>;
```

3. **Use consistent markers**

```python
# ✅ Standard markers throughout codebase
# TODO: Add retry logic
# FIXME: Race condition here
# HACK: Temporary workaround
# NOTE: Important context
```

4. **Link to external documentation**

```go
// ✅ Provides context and links
// Implementation follows OAuth 2.0 RFC 6749
// See: https://tools.ietf.org/html/rfc6749#section-4.1
func (a *Authenticator) AuthorizeCode(code string) (*Token, error) {
    // ...
}
```

### ❌ DON'T

1. **Don't state the obvious**

```java
// ❌ Redundant comment
// Increment i
i++;

// ✅ No comment needed
i++;
```

2. **Don't leave commented-out code**

```python
# ❌ Dead code
# old_function()
# another_old_function()
new_function()

# ✅ Just delete it (git remembers)
new_function()
```

3. **Don't write novels**

```typescript
// ❌ Too verbose
// This function takes a user object as parameter and then
// it checks if the user is active by looking at the is_active
// property and if it's true then it proceeds to send an email
// to the user's email address which is stored in the email property
if (user.is_active) {
  sendEmail(user.email);
}

// ✅ Concise
// Only active users receive emails
if (user.is_active) {
  sendEmail(user.email);
}
```

## Quick Reference

```bash
# Comment Checklist

## Before Adding Comment
- [ ] Can I make code self-explanatory instead?
- [ ] Does comment explain WHY, not WHAT?
- [ ] Is this for future maintainers (including me)?
- [ ] Is the comment close to relevant code?

## For TODO/FIXME
- [ ] Used standard marker (TODO/FIXME/HACK)?
- [ ] Included context/reason?
- [ ] Assigned owner if applicable?
- [ ] Linked to issue/ticket?
- [ ] Set deadline if time-sensitive?

## For API Documentation
- [ ] Described what function does?
- [ ] Documented all parameters?
- [ ] Documented return value?
- [ ] Listed possible exceptions?
- [ ] Provided usage example?
- [ ] Linked to related functions?

## Comment Maintenance
- [ ] Updated comment when changing code?
- [ ] Deleted obsolete comments?
- [ ] Removed commented-out code?
```

## Additional Resources

- [Clean Code by Robert C. Martin - Chapter on Comments](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)
- [Google Style Guides](https://google.github.io/styleguide/) - Comment conventions for various languages
- [JSDoc Documentation](https://jsdoc.app/)
- [Python PEP 257 - Docstring Conventions](https://peps.python.org/pep-0257/)
- [Javadoc Guide](https://www.oracle.com/technical-resources/articles/java/javadoc-tool.html)
- [Go Documentation Comments](https://go.dev/doc/comment)

---

**Related Skills**: [code-review](../code-review/SKILL.md) | [contributor-guide](../contributor-guide/SKILL.md) | [debugging](../debugging/SKILL.md) | [adrs](../adrs/SKILL.md)
