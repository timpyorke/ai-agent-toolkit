# Examples

## Validation & Sanitization

### Input Validation (Joi)
```javascript
const Joi = require('joi');

const schema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    age: Joi.number().integer().min(0).max(120)
});

const { error, value } = schema.validate(userInput);
if (error) throw new Error("Invalid Input");
```

### Output Encoding (DOMPurify)
```javascript
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

const clean = DOMPurify.sanitize('<script>alert("XSS")</script><b>Safe</b>');
// Result: <b>Safe</b>
```

## Database Security

### Parameterized Queries (Postgres)
```javascript
// ✅ Safe
const query = 'SELECT * FROM users WHERE id = $1';
const values = [req.params.id];
await client.query(query, values);

// ❌ Unsafe
const query = 'SELECT * FROM users WHERE id = ' + req.params.id;
```

## Authentication

### Password Hashing (Argon2)
```javascript
const argon2 = require('argon2');

async function register(password) {
    const hash = await argon2.hash(password);
    // Store 'hash' in DB
}

async function login(hashFromDb, password) {
    if (await argon2.verify(hashFromDb, password)) {
        // Success
    } else {
        // Failure
    }
}
```
