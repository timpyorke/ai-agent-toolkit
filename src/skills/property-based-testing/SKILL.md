# Property-Based Testing

> **Category**: Testing & Quality  
> **Audience**: All developers, especially those working on algorithms and data structures  
> **Prerequisites**: Understanding of unit testing, basic testing concepts  
> **Complexity**: Intermediate to Advanced

## Overview

Property-based testing generates hundreds or thousands of test inputs automatically, discovering edge cases that example-based tests miss. Instead of writing specific examples (e.g., "sort([3,1,2]) === [1,2,3]"), you define properties that should always hold true (e.g., "sorted output length equals input length"). The framework generates random inputs, finds failures, and automatically "shrinks" them to minimal failing cases.

## Why Property-Based Testing?

### Example-Based Testing Limitations

```typescript
// Example-based test
test("reverse function works", () => {
  expect(reverse([1, 2, 3])).toEqual([3, 2, 1]);
  expect(reverse([])).toEqual([]);
  expect(reverse([1])).toEqual([1]);
});

// What about these edge cases?
// - Very large arrays
// - Arrays with duplicates
// - Arrays with special values (undefined, null, NaN)
// - Nested arrays
```

### Property-Based Approach

```typescript
import { fc } from "fast-check";

test("reverse twice returns original", () => {
  fc.assert(
    fc.property(fc.array(fc.anything()), (arr) => {
      expect(reverse(reverse(arr))).toEqual(arr);
    }),
  );
});

// Automatically tests:
// - Empty arrays
// - Single elements
// - Large arrays
// - Arrays with duplicates, undefined, null, objects, etc.
// - Thousands of random combinations
```

## Core Concepts

### Properties vs Examples

**Example-based**: Specific inputs and outputs

```typescript
test("addition", () => {
  expect(add(2, 3)).toBe(5);
  expect(add(0, 0)).toBe(0);
  expect(add(-1, 1)).toBe(0);
});
```

**Property-based**: Universal truths

```typescript
test("addition properties", () => {
  // Commutative: a + b === b + a
  fc.assert(
    fc.property(fc.integer(), fc.integer(), (a, b) => {
      expect(add(a, b)).toBe(add(b, a));
    }),
  );

  // Identity: a + 0 === a
  fc.assert(
    fc.property(fc.integer(), (a) => {
      expect(add(a, 0)).toBe(a);
    }),
  );

  // Associative: (a + b) + c === a + (b + c)
  fc.assert(
    fc.property(fc.integer(), fc.integer(), fc.integer(), (a, b, c) => {
      expect(add(add(a, b), c)).toBe(add(a, add(b, c)));
    }),
  );
});
```

## Fast-Check (JavaScript/TypeScript)

### Installation

```bash
npm install --save-dev fast-check
```

### Basic Usage

```typescript
import { fc } from "fast-check";

describe("Array operations", () => {
  test("map preserves length", () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer()), // Generator: arrays of integers
        (arr) => {
          const mapped = arr.map((x) => x * 2);
          expect(mapped.length).toBe(arr.length);
        },
      ),
    );
  });

  test("filter reduces or maintains length", () => {
    fc.assert(
      fc.property(fc.array(fc.integer()), (arr) => {
        const filtered = arr.filter((x) => x > 0);
        expect(filtered.length).toBeLessThanOrEqual(arr.length);
      }),
    );
  });

  test("sort produces sorted array", () => {
    fc.assert(
      fc.property(fc.array(fc.integer()), (arr) => {
        const sorted = [...arr].sort((a, b) => a - b);

        // Property: Each element <= next element
        for (let i = 0; i < sorted.length - 1; i++) {
          expect(sorted[i]).toBeLessThanOrEqual(sorted[i + 1]);
        }
      }),
    );
  });
});
```

### Generators (Arbitraries)

**Primitive types**

```typescript
fc.integer(); // Any integer
fc.integer({ min: 0, max: 100 }); // Range
fc.nat(); // Natural numbers (>= 0)
fc.float(); // Floating point
fc.double(); // Double precision
fc.boolean(); // true or false
fc.string(); // Any string
fc.string({ minLength: 5, maxLength: 10 });
fc.char(); // Single character
fc.uuid(); // Valid UUID
```

**Composite types**

```typescript
fc.array(fc.integer()); // Array of integers
fc.array(fc.string(), { minLength: 1, maxLength: 10 });

fc.object(); // Any object
fc.record({
  // Specific shape
  name: fc.string(),
  age: fc.integer({ min: 0, max: 120 }),
  email: fc.emailAddress(),
});

fc.tuple(fc.string(), fc.integer()); // [string, number]

fc.oneof(
  // Union type
  fc.string(),
  fc.integer(),
  fc.constant(null),
);

fc.option(fc.string()); // string | null
```

**Domain-specific**

```typescript
fc.emailAddress();
fc.webUrl();
fc.ipV4();
fc.ipV6();
fc.date();
fc.json();
fc.base64String();
```

**Custom generators**

```typescript
// Generate valid user objects
const userArbitrary = fc.record({
  id: fc.uuid(),
  username: fc.string({ minLength: 3, maxLength: 20 }),
  email: fc.emailAddress(),
  age: fc.integer({ min: 13, max: 120 }),
  role: fc.constantFrom("user", "admin", "moderator"),
  createdAt: fc.date({ min: new Date("2020-01-01") }),
});

test("user validation", () => {
  fc.assert(
    fc.property(userArbitrary, (user) => {
      const result = validateUser(user);
      expect(result.valid).toBe(true);
    }),
  );
});
```

### Common Properties to Test

**1. Inverse operations**

```typescript
test("encode/decode are inverses", () => {
  fc.assert(
    fc.property(fc.string(), (str) => {
      expect(decode(encode(str))).toBe(str);
    }),
  );
});
```

**2. Idempotence** (applying twice = applying once)

```typescript
test("deduplication is idempotent", () => {
  fc.assert(
    fc.property(fc.array(fc.integer()), (arr) => {
      const once = deduplicate(arr);
      const twice = deduplicate(once);
      expect(once).toEqual(twice);
    }),
  );
});
```

**3. Invariants** (things that never change)

```typescript
test("sorting preserves all elements", () => {
  fc.assert(
    fc.property(fc.array(fc.integer()), (arr) => {
      const sorted = sort(arr);
      expect(sorted.length).toBe(arr.length);
      expect(new Set(sorted)).toEqual(new Set(arr));
    }),
  );
});
```

**4. Commutativity** (order doesn't matter)

```typescript
test("set union is commutative", () => {
  fc.assert(
    fc.property(fc.array(fc.integer()), fc.array(fc.integer()), (a, b) => {
      expect(union(a, b).sort()).toEqual(union(b, a).sort());
    }),
  );
});
```

**5. Oracle** (compare with known-good implementation)

```typescript
test("custom sort matches built-in sort", () => {
  fc.assert(
    fc.property(fc.array(fc.integer()), (arr) => {
      const customSorted = customSort([...arr]);
      const builtInSorted = [...arr].sort((a, b) => a - b);
      expect(customSorted).toEqual(builtInSorted);
    }),
  );
});
```

## Hypothesis (Python)

### Installation

```bash
pip install hypothesis
```

### Basic Usage

```python
from hypothesis import given, strategies as st

@given(st.lists(st.integers()))
def test_reverse_twice_is_identity(lst):
    assert reverse(reverse(lst)) == lst

@given(st.integers(), st.integers())
def test_addition_commutative(a, b):
    assert add(a, b) == add(b, a)

@given(st.text())
def test_encode_decode(text):
    assert decode(encode(text)) == text
```

### Strategies (Generators)

```python
import hypothesis.strategies as st

# Primitives
st.integers()
st.integers(min_value=0, max_value=100)
st.floats()
st.booleans()
st.text()
st.characters()
st.binary()

# Collections
st.lists(st.integers())
st.lists(st.text(), min_size=1, max_size=10)
st.sets(st.integers())
st.dictionaries(keys=st.text(), values=st.integers())

# Composite
st.tuples(st.text(), st.integers())

# Custom
user_strategy = st.builds(
    User,
    id=st.uuids(),
    name=st.text(min_size=1, max_size=50),
    email=st.emails(),
    age=st.integers(min_value=0, max_value=120)
)

@given(user_strategy)
def test_user_validation(user):
    assert validate_user(user) is True
```

### Example: Testing a Shopping Cart

```python
from hypothesis import given, strategies as st
from hypothesis.stateful import RuleBasedStateMachine, rule, invariant

class ShoppingCart:
    def __init__(self):
        self.items = []

    def add_item(self, item, quantity):
        self.items.append({'item': item, 'quantity': quantity})

    def remove_item(self, item):
        self.items = [i for i in self.items if i['item'] != item]

    def get_total(self):
        return sum(i['quantity'] for i in self.items)

# Property-based tests
@given(st.lists(st.tuples(st.text(), st.integers(min_value=1))))
def test_cart_total_equals_sum(items):
    cart = ShoppingCart()
    expected_total = 0

    for item, qty in items:
        cart.add_item(item, qty)
        expected_total += qty

    assert cart.get_total() == expected_total

@given(st.text(), st.integers(min_value=1))
def test_remove_item_reduces_total(item_name, quantity):
    cart = ShoppingCart()
    cart.add_item(item_name, quantity)
    initial_total = cart.get_total()

    cart.remove_item(item_name)

    assert cart.get_total() == initial_total - quantity
```

## Shrinking

### What is Shrinking?

When a property test fails, the framework automatically simplifies the failing input to the smallest example that still fails.

```typescript
// Original failing input (found by random generation)
const failingInput = [1, -5, 2, 0, 100, -3, 7, 8, -1, 4];

// After shrinking
const shrunkInput = [0]; // Minimal failing case

// Example: Testing division
test("division by non-zero", () => {
  fc.assert(
    fc.property(fc.integer(), fc.integer(), (a, b) => {
      // BUG: Doesn't check for b === 0
      const result = a / b;
      expect(Number.isFinite(result)).toBe(true);
    }),
  );
});

// Initial failure might be: a=12345, b=0
// Shrunk to: a=0, b=0 (simplest failing case)
```

### Shrinking in Action

**Fast-Check**

```typescript
// Complex failing case discovered
const failingUser = {
  id: "abc123-def456-ghi789",
  name: "John Doe with a very long name that causes issues",
  email: "verylongemail@subdomain.example.com",
  age: 42,
  roles: ["user", "admin", "moderator", "guest"],
};

// Shrunk to minimal failing case
const shrunkUser = {
  id: "",
  name: "",
  email: "",
  age: 0,
  roles: [],
};
```

**Hypothesis** (Python)

```python
from hypothesis import given, strategies as st, example

@given(st.lists(st.integers()))
def test_no_duplicates_after_dedup(lst):
    result = deduplicate(lst)
    assert len(result) == len(set(result))

# If test fails with [1, 2, 3, 2, 4],
# Hypothesis shrinks to [0, 0] or similar minimal case
```

### Controlling Shrinking

**Fast-Check: noShrink()**

```typescript
fc.assert(
  fc.property(
    fc.array(fc.integer()).noShrink(), // Don't shrink on failure
    (arr) => {
      // Test property
    },
  ),
);
```

## Stateful Property Testing

Test sequences of operations (state machines).

### Fast-Check Stateful Example

```typescript
import { fc } from "fast-check";

class Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  size(): number {
    return this.items.length;
  }
}

// Model: Simplified version for comparison
class StackModel<T> {
  items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  size(): number {
    return this.items.length;
  }
}

// Commands
class PushCommand implements fc.Command<StackModel<number>, Stack<number>> {
  constructor(readonly value: number) {}

  check(m: Readonly<StackModel<number>>): boolean {
    return true; // Always valid
  }

  run(m: StackModel<number>, r: Stack<number>): void {
    m.push(this.value);
    r.push(this.value);
    expect(r.size()).toBe(m.size());
  }

  toString(): string {
    return `push(${this.value})`;
  }
}

class PopCommand implements fc.Command<StackModel<number>, Stack<number>> {
  check(m: Readonly<StackModel<number>>): boolean {
    return m.size() > 0; // Only valid if stack not empty
  }

  run(m: StackModel<number>, r: Stack<number>): void {
    const modelResult = m.pop();
    const realResult = r.pop();
    expect(realResult).toBe(modelResult);
    expect(r.size()).toBe(m.size());
  }

  toString(): string {
    return "pop()";
  }
}

// Test
test("Stack behaves correctly", () => {
  const allCommands = [
    fc.integer().map((v) => new PushCommand(v)),
    fc.constant(new PopCommand()),
  ];

  fc.assert(
    fc.property(fc.commands(allCommands, { maxCommands: 100 }), (cmds) => {
      const model = new StackModel<number>();
      const real = new Stack<number>();
      fc.modelRun(() => ({ model, real }), cmds);
    }),
  );
});

// This generates random sequences like:
// push(5) -> push(3) -> pop() -> push(7) -> pop() -> pop()
```

### Hypothesis Stateful Example

```python
from hypothesis.stateful import RuleBasedStateMachine, rule, invariant
from hypothesis import strategies as st

class Stack:
    def __init__(self):
        self.items = []

    def push(self, item):
        self.items.append(item)

    def pop(self):
        return self.items.pop() if self.items else None

    def size(self):
        return len(self.items)

class StackStateMachine(RuleBasedStateMachine):
    def __init__(self):
        super().__init__()
        self.stack = Stack()
        self.model = []

    @rule(value=st.integers())
    def push(self, value):
        self.stack.push(value)
        self.model.append(value)

    @rule()
    def pop(self):
        result = self.stack.pop()
        expected = self.model.pop() if self.model else None
        assert result == expected

    @invariant()
    def size_matches(self):
        assert self.stack.size() == len(self.model)

# Run stateful test
TestStack = StackStateMachine.TestCase
```

## Integration with Regular Tests

### Jest + Fast-Check

```typescript
import { fc } from "fast-check";

describe("User service", () => {
  // Regular example-based test
  test("creates user with valid data", async () => {
    const user = await userService.create({
      email: "test@example.com",
      name: "Test User",
    });

    expect(user.id).toBeDefined();
  });

  // Property-based test
  test("rejects invalid emails", () => {
    fc.assert(
      fc.property(
        fc.string().filter((s) => !s.includes("@")), // Invalid emails
        async (invalidEmail) => {
          await expect(
            userService.create({ email: invalidEmail, name: "Test" }),
          ).rejects.toThrow("Invalid email");
        },
      ),
      { numRuns: 100 }, // Run 100 times
    );
  });
});
```

### PyTest + Hypothesis

```python
import pytest
from hypothesis import given, strategies as st

def test_user_creation_example():
    """Regular example-based test"""
    user = create_user(email='test@example.com', name='Test')
    assert user.id is not None

@given(st.emails(), st.text(min_size=1))
def test_user_creation_property(email, name):
    """Property-based test"""
    user = create_user(email=email, name=name)
    assert user.email == email
    assert user.name == name
    assert user.id is not None
```

## Performance Considerations

**Configure number of runs**

```typescript
fc.assert(
  fc.property(fc.array(fc.integer()), (arr) => {
    // Test property
  }),
  { numRuns: 1000 }, // Default is 100
);
```

**Set timeout**

```typescript
fc.assert(
  fc.property(fc.array(fc.integer()), (arr) => {
    // Expensive operation
  }),
  { timeout: 5000 }, // 5 seconds
);
```

## Best Practices

### ✅ DO

1. **Start with simple properties**

```typescript
// ✅ Good: Simple, clear property
test("array length unchanged by map", () => {
  fc.assert(
    fc.property(fc.array(fc.integer()), (arr) => {
      expect(arr.map((x) => x * 2).length).toBe(arr.length);
    }),
  );
});
```

2. **Use property-based tests for algorithms**

```typescript
// ✅ Good use case: Sorting algorithm
test("custom sort is correct", () => {
  fc.assert(
    fc.property(fc.array(fc.integer()), (arr) => {
      const sorted = customSort([...arr]);
      // Properties: sorted, same elements, same length
      expect(isSorted(sorted)).toBe(true);
      expect(sorted.length).toBe(arr.length);
      expect(new Set(sorted)).toEqual(new Set(arr));
    }),
  );
});
```

3. **Combine with example-based tests**

```typescript
// Example-based for specific cases
test("handles empty array", () => {
  expect(myFunction([])).toEqual([]);
});

// Property-based for general behavior
test("preserves length", () => {
  fc.assert(
    fc.property(fc.array(fc.anything()), (arr) => {
      expect(myFunction(arr).length).toBe(arr.length);
    }),
  );
});
```

### ❌ DON'T

1. **Don't test trivial properties**

```typescript
// ❌ Bad: Too simple
test("function returns something", () => {
  fc.assert(
    fc.property(fc.integer(), (x) => {
      expect(myFunction(x)).toBeDefined();
    }),
  );
});
```

2. **Don't ignore shrinking output**

```typescript
// When test fails:
// Property failed after 1 test
// Shrunk to: [0]
//
// ❌ Don't just fix this specific case
// ✅ Understand why [0] fails and fix root cause
```

## Common Pitfalls

| Pitfall                   | Impact             | Solution                           |
| ------------------------- | ------------------ | ---------------------------------- |
| Testing implementation    | Brittle tests      | Test properties, not steps         |
| Ignoring shrunk failures  | Missing root cause | Analyze minimal failing case       |
| Too many runs             | Slow test suite    | Start with 100, increase if needed |
| Overly complex properties | Hard to debug      | Break into smaller properties      |

## Quick Reference

**Fast-Check**

```typescript
fc.assert(
  fc.property(
    fc.integer(),        // Generator
    (x) => {             // Property function
      expect(...).toBe(...);
    }
  ),
  { numRuns: 100 }       // Options
);
```

**Hypothesis**

```python
@given(st.integers())    # Strategy (generator)
def test_property(x):
    assert ...           # Property assertion
```

## Additional Resources

- [Fast-Check Documentation](https://fast-check.dev/)
- [Hypothesis Documentation](https://hypothesis.readthedocs.io/)
- [Property-Based Testing Patterns](https://fsharpforfunandprofit.com/posts/property-based-testing-2/)
- [John Hughes - Testing the Hard Stuff](https://www.youtube.com/watch?v=zi0rHwfiX1Q)
- [QuickCheck (Original Haskell library)](https://hackage.haskell.org/package/QuickCheck)

---

**Related Skills**: [unit-integration-e2e](../unit-integration-e2e/SKILL.md) | [test-strategy](../test-strategy/SKILL.md) | [debugging](../debugging/SKILL.md)
