# Examples

## Fast-Check (JS/TS)

### Invariants (Sorting)
```typescript
import { fc } from "fast-check";

test("sorting should be idempotent", () => {
  fc.assert(
    fc.property(fc.array(fc.integer()), (arr) => {
      const sortedOnce = [...arr].sort((a, b) => a - b);
      const sortedTwice = [...sortedOnce].sort((a, b) => a - b);
      expect(sortedOnce).toEqual(sortedTwice);
    })
  );
});
```

### Round-Tripping (JSON)
```typescript
test("JSON parse/stringify equivalence", () => {
    fc.assert(
        fc.property(fc.json(), (jsonStr) => {
            const parsed = JSON.parse(jsonStr);
            const str = JSON.stringify(parsed);
            expect(JSON.parse(str)).toEqual(parsed);
        })
    );
});
```

## Hypothesis (Python)

### Encoding Equivalence
```python
from hypothesis import given, strategies as st
import base64

@given(st.binary())
def test_base64_encode_decode(data):
    encoded = base64.b64encode(data)
    decoded = base64.b64decode(encoded)
    assert decoded == data
```

### Custom Strategies (User Object)
```python
from hypothesis import strategies as st

user_strategy = st.builds(
    dict,
    username=st.text(min_size=1),
    age=st.integers(min_value=0, max_value=120),
    is_active=st.booleans()
)

@given(user_strategy)
def test_user_properties(user):
    assert user['age'] >= 0
    assert len(user['username']) > 0
```

## State Machine Testing

### Stack Behavior (Fast-Check)
```typescript
// Define Model
class StackModel {
  data = [];
  push(v) { this.data.push(v); }
  pop() { this.data.pop(); }
  size() { return this.data.length; }
}

// Model-Based Test
const commands = [
    fc.integer().map(v => new PushCommand(v)),
    fc.constant(new PopCommand())
];
// ... See fast-check docs for full setup
```
