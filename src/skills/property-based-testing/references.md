# Reference Material

## Core Principles

1.  **Properties vs Examples**: "For all X, P(x) is true" vs "For x=1, P(1) is true".
2.  **Generators**: Tools to produce random data (integers, strings, trees).
3.  **Shrinking**: Finding the minimal valid input that reproduces a failure.

## Types of Properties

| Type | Description | Example |
|------|-------------|---------|
| **Round Trip** | `decode(encode(x)) == x` | Serialization, Compression |
| **Invariant** | `sort(x).length == x.length` | Sorting, Filtering (<=) |
| **Idempotence** | `f(f(x)) == f(x)` | Uppercase, Unique, Sort |
| **Commutativity** | `add(a, b) == add(b, a)` | Addition, Set Union |
| **Oracle** | `my_opt(x) == slow_ref(x)` | Performance refactoring |

## Libraries

-   **JavaScript/TypeScript**: [fast-check](https://github.com/dubzzz/fast-check)
-   **Python**: [Hypothesis](https://hypothesis.readthedocs.io/)
-   **Java**: [Jqwik](https://jqwik.net/)
-   **Haskell**: QuickCheck (the original)

## Best Practices

-   Start with simple invariants (size check, no exceptions).
-   Use property testing for parsers, serializers, and algorithm-heavy code.
-   Don't replace unit tests; use them together.
-   Fix the root cause, not just the shrunk case.
