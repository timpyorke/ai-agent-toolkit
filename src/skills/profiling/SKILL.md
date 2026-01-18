# Profiling

> **Category**: Performance & Reliability  
> **Audience**: Backend developers, performance engineers, SREs  
> **Prerequisites**: Understanding of system performance concepts  
> **Complexity**: Intermediate to Advanced

## Overview

Profiling identifies performance bottlenecks by measuring where your application spends time and resources. This skill covers CPU profiling (flamegraphs, sampling), memory profiling (heap analysis, leak detection), network profiling, database query profiling, browser DevTools profiling, and continuous profiling in production—enabling data-driven optimization decisions.

## Why Profile?

**Without profiling**:

- "The app is slow" → guessing at solutions
- Premature optimization in the wrong places
- No baseline for measuring improvements

**With profiling**:

- "Function X takes 80% of CPU time" → targeted fix
- Objective data guides optimization efforts
- Measure before/after improvements

## CPU Profiling

### Sampling Profiler

Periodically captures call stacks to identify hot code paths.

**Node.js (built-in)**

```bash
# Start with --prof flag
node --prof app.js

# Process the output
node --prof-process isolate-0x*.log > profile.txt

# View flamegraph (install first: npm i -g speedscope)
speedscope isolate-0x*.log
```

**Python (cProfile)**

```python
import cProfile
import pstats

# Profile a function
cProfile.run('my_function()', 'profile.stats')

# Analyze results
p = pstats.Stats('profile.stats')
p.sort_stats('cumulative')
p.print_stats(20)  # Top 20 functions
```

**Go (pprof)**

```go
import (
    "net/http"
    _ "net/http/pprof"
)

func main() {
    // Start pprof server
    go func() {
        http.ListenAndServe("localhost:6060", nil)
    }()

    // Your application code
}
```

```bash
# Capture 30-second CPU profile
go tool pprof http://localhost:6060/debug/pprof/profile?seconds=30

# Interactive commands:
# top - Show top functions
# list <function> - Show source code
# web - Generate graph visualization
```

### Flamegraphs

Visual representation of call stacks, showing time spent in each function.

**Generate flamegraph (Linux perf)**

```bash
# Record CPU samples (60 seconds)
perf record -F 99 -a -g -- sleep 60

# Generate flamegraph
perf script | stackcollapse-perf.pl | flamegraph.pl > flame.svg

# View in browser
open flame.svg
```

**Interpretation**:

- **Width**: Time spent (wider = more time)
- **Height**: Stack depth (deeper = more nested calls)
- **Color**: Just for differentiation (no meaning)

**Example analysis**:

```
[==========================] getUserById (80% of CPU)
  [======================] database.query (70%)
    [==================] network.send (50%)
    [====] parsing (20%)
  [===] validation (10%)
```

**Insights**: Database query dominates → optimize query or add caching

### Continuous Profiling

Profile production systems continuously without significant overhead.

**Pyroscope (open-source)**

```yaml
# docker-compose.yml
services:
  pyroscope:
    image: pyroscope/pyroscope:latest
    ports:
      - "4040:4040"
    volumes:
      - ./pyroscope-data:/var/lib/pyroscope

  app:
    image: myapp:latest
    environment:
      PYROSCOPE_SERVER_ADDRESS: http://pyroscope:4040
```

**Instrument Node.js app**

```javascript
const Pyroscope = require("@pyroscope/nodejs");

Pyroscope.init({
  serverAddress: "http://pyroscope:4040",
  appName: "my-nodejs-app",
});

Pyroscope.start();
```

**Google Cloud Profiler**

```javascript
require("@google-cloud/profiler").start({
  serviceContext: {
    service: "my-service",
    version: "1.0.0",
  },
});
```

## Memory Profiling

### Heap Analysis

**Node.js (Chrome DevTools)**

```bash
# Start with --inspect
node --inspect app.js

# Open chrome://inspect in Chrome
# Click "inspect" → Memory tab → Take heap snapshot
```

**Heap snapshot analysis**:

1. **Shallow size**: Memory used by object itself
2. **Retained size**: Memory freed if object is deleted
3. **Distance**: Steps from GC root

**Finding memory leaks**:

```javascript
// Take multiple snapshots over time
// Compare snapshots to find growing objects

// Common leak: Event listeners not removed
class LeakyComponent {
  constructor() {
    window.addEventListener("resize", this.handleResize);
    // Missing: removeEventListener in destructor
  }
}
```

**Python (memory_profiler)**

```python
from memory_profiler import profile

@profile
def my_function():
    a = [1] * (10 ** 6)  # Allocate 1M integers
    b = [2] * (2 * 10 ** 7)  # Allocate 20M integers
    del b
    return a

# Run with:
# python -m memory_profiler script.py

# Output:
# Line    Mem usage    Increment
# ==============================
#   4     10.2 MiB     10.2 MiB    a = [1] * (10 ** 6)
#   5    162.5 MiB    152.3 MiB    b = [2] * (2 * 10 ** 7)
#   6     10.2 MiB   -152.3 MiB    del b
```

**Java (VisualVM / JProfiler)**

```bash
# Generate heap dump
jmap -dump:live,format=b,file=heap.bin <pid>

# Or trigger on OutOfMemoryError
java -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/tmp/heapdump.hprof MyApp
```

### Memory Leak Detection

**Valgrind (C/C++)**

```bash
# Run with memcheck
valgrind --leak-check=full --show-leak-kinds=all ./myapp

# Example output:
# ==12345== LEAK SUMMARY:
# ==12345==    definitely lost: 4,096 bytes in 1 blocks
# ==12345==    indirectly lost: 0 bytes in 0 blocks
```

**Node.js memory leak example**

```javascript
// ❌ Memory leak: global array keeps growing
const cache = [];

app.get("/user/:id", (req, res) => {
  const user = db.getUser(req.params.id);
  cache.push(user); // Never cleaned up!
  res.json(user);
});

// ✅ Fixed: Use LRU cache with max size
const LRU = require("lru-cache");
const cache = new LRU({ max: 500 });

app.get("/user/:id", (req, res) => {
  let user = cache.get(req.params.id);
  if (!user) {
    user = db.getUser(req.params.id);
    cache.set(req.params.id, user);
  }
  res.json(user);
});
```

## Network Profiling

### Chrome DevTools Network Tab

**Key metrics**:

- **TTFB (Time To First Byte)**: Server response time
- **Download time**: Transfer time based on size
- **Waterfall**: Request dependencies and parallelism

**Analyzing waterfalls**:

```
0ms    500ms   1000ms  1500ms  2000ms
|------|-------|-------|-------|-------|
[====] index.html (DNS + Connect + TTFB + Download)
  [==] styles.css
  [==] script.js
    [=] api/user
    [=] api/posts
```

**Optimization opportunities**:

- Long TTFB → Slow server/database
- Sequential requests → Add HTTP/2 or parallelize
- Large downloads → Compress or split resources

### tcpdump / Wireshark

**Capture network traffic**

```bash
# Capture HTTP traffic on port 80
sudo tcpdump -i any -s 65535 -w capture.pcap 'port 80'

# Analyze in Wireshark
wireshark capture.pcap
```

**Common issues found**:

- Excessive retransmissions (network quality)
- Large packet sizes (fragmentation)
- High latency between requests (chatty APIs)

### Application-level tracing

**Axios interceptor (track API calls)**

```javascript
axios.interceptors.request.use((config) => {
  config.metadata = { startTime: Date.now() };
  return config;
});

axios.interceptors.response.use((response) => {
  const duration = Date.now() - response.config.metadata.startTime;
  console.log(`${response.config.url}: ${duration}ms`);

  if (duration > 1000) {
    logger.warn("Slow API call", { url: response.config.url, duration });
  }

  return response;
});
```

## Database Query Profiling

### EXPLAIN ANALYZE (PostgreSQL)

```sql
EXPLAIN ANALYZE
SELECT u.name, COUNT(p.id) as post_count
FROM users u
LEFT JOIN posts p ON u.id = p.user_id
WHERE u.created_at > '2024-01-01'
GROUP BY u.id, u.name
ORDER BY post_count DESC
LIMIT 10;

-- Output:
-- Limit  (cost=1234.56..1234.78 rows=10 width=68) (actual time=45.123..45.145 rows=10 loops=1)
--   ->  Sort  (cost=1234.56..1256.78 rows=8889 width=68) (actual time=45.121..45.130 rows=10 loops=1)
--         Sort Key: (count(p.id)) DESC
--         ->  HashAggregate  (cost=1001.23..1123.45 rows=8889 width=68) (actual time=42.567..43.891 rows=1234 loops=1)
--               ->  Hash Left Join  (cost=50.12..901.23 rows=20000 width=60) (actual time=2.345..35.678 rows=20000 loops=1)
--                     ->  Seq Scan on users u  (cost=0.00..789.00 rows=10000 width=52) (actual time=0.012..15.678 rows=10000 loops=1)
--                           Filter: (created_at > '2024-01-01'::date)
--                     ->  Hash  (cost=25.00..25.00 rows=1000 width=16) (actual time=1.234..1.234 rows=1000 loops=1)
--                           ->  Seq Scan on posts p  (cost=0.00..25.00 rows=1000 width=16) (actual time=0.005..0.789 rows=1000 loops=1)
-- Planning Time: 0.234 ms
-- Execution Time: 45.234 ms
```

**Key metrics**:

- **cost**: Estimated cost (unitless, relative)
- **rows**: Estimated row count
- **actual time**: Real execution time
- **loops**: Number of times node executed

**Red flags**:

- Sequential scans on large tables
- Actual rows >> estimated rows (statistics out of date)
- High loops count with slow operations

### MySQL Slow Query Log

```sql
-- Enable slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1; -- Log queries > 1 second
SET GLOBAL log_queries_not_using_indexes = 'ON';

-- Analyze slow query log
mysqldumpslow /var/lib/mysql/slow-query.log

-- Output:
-- Count: 142  Time=3.45s (489s)  Lock=0.00s (0s)  Rows=1000.0 (142000)
-- SELECT * FROM users WHERE email LIKE '%@example.com'
```

**Optimization**:

```sql
-- ❌ Bad: Leading wildcard prevents index use
SELECT * FROM users WHERE email LIKE '%@example.com';

-- ✅ Better: Use full-text search or suffix index
CREATE FULLTEXT INDEX idx_email ON users(email);
SELECT * FROM users WHERE MATCH(email) AGAINST('@example.com');
```

### Query Performance Monitoring

**PostgreSQL pg_stat_statements**

```sql
-- Enable extension
CREATE EXTENSION pg_stat_statements;

-- Find slowest queries
SELECT
  query,
  calls,
  total_exec_time / 1000 as total_time_seconds,
  mean_exec_time / 1000 as avg_time_seconds,
  max_exec_time / 1000 as max_time_seconds
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;
```

**MongoDB profiling**

```javascript
// Enable profiling (level 2 = all operations)
db.setProfilingLevel(2);

// Query slow operations
db.system.profile
  .find({
    millis: { $gt: 100 },
  })
  .sort({ ts: -1 })
  .limit(10);

// Example output:
// {
//   op: "query",
//   ns: "mydb.users",
//   command: { find: "users", filter: { email: "test@example.com" } },
//   millis: 523,
//   planSummary: "COLLSCAN",  // ← Collection scan (no index!)
//   execStats: { ... }
// }
```

## Browser DevTools Profiling

### Performance Tab

**Recording a profile**:

1. Open DevTools → Performance tab
2. Click Record (or Cmd+E)
3. Perform actions
4. Stop recording

**Key sections**:

- **Network**: Resource loading timeline
- **Frames**: FPS and frame drops
- **Main thread**: JavaScript execution
- **Raster**: Painting and compositing

**Identifying Long Tasks**:

```javascript
// Long task (blocks main thread)
function slowFunction() {
  const start = Date.now();
  while (Date.now() - start < 100) {} // Block for 100ms
  console.log("Done");
}

// ✅ Better: Break into chunks
async function optimizedFunction() {
  const chunks = 10;
  for (let i = 0; i < chunks; i++) {
    await new Promise((resolve) => setTimeout(resolve, 0)); // Yield to browser
    // Do work for chunk i
  }
}
```

### Lighthouse Audits

```bash
# CLI
npm install -g lighthouse
lighthouse https://example.com --view

# Programmatic
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

(async () => {
  const chrome = await chromeLauncher.launch();
  const result = await lighthouse('https://example.com', {
    port: chrome.port,
    onlyCategories: ['performance']
  });

  console.log('Performance score:', result.lhr.categories.performance.score * 100);

  await chrome.kill();
})();
```

**Key metrics (Core Web Vitals)**:

- **LCP (Largest Contentful Paint)**: < 2.5s (good)
- **FID (First Input Delay)**: < 100ms (good)
- **CLS (Cumulative Layout Shift)**: < 0.1 (good)

### React DevTools Profiler

```javascript
import { Profiler } from "react";

function App() {
  return (
    <Profiler id="App" onRender={onRenderCallback}>
      <YourComponents />
    </Profiler>
  );
}

function onRenderCallback(
  id, // "App"
  phase, // "mount" or "update"
  actualDuration, // Time spent rendering
  baseDuration, // Estimated time without memoization
  startTime,
  commitTime,
) {
  if (actualDuration > 16) {
    // > 16ms (60fps budget)
    console.warn(`Slow render: ${id} took ${actualDuration}ms`);
  }
}
```

## Bottleneck Identification

### Common Bottlenecks

**1. CPU-bound**

```javascript
// Symptom: High CPU usage, slow response times
// Example: Heavy computation
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2); // O(2^n) - very slow!
}

// ✅ Fix: Memoization
const memo = {};
function fibonacciMemo(n) {
  if (n in memo) return memo[n];
  if (n <= 1) return n;
  memo[n] = fibonacciMemo(n - 1) + fibonacciMemo(n - 2);
  return memo[n];
}
```

**2. I/O-bound**

```javascript
// Symptom: Low CPU, slow response, waiting on disk/network
// Example: Sequential database queries
async function getUsers() {
  const users = await db.users.find();
  for (const user of users) {
    user.posts = await db.posts.find({ userId: user.id }); // N+1 query!
  }
  return users;
}

// ✅ Fix: Batch queries
async function getUsersOptimized() {
  const users = await db.users.find();
  const userIds = users.map((u) => u.id);
  const allPosts = await db.posts.find({ userId: { $in: userIds } });

  const postsByUser = allPosts.reduce((acc, post) => {
    acc[post.userId] = acc[post.userId] || [];
    acc[post.userId].push(post);
    return acc;
  }, {});

  users.forEach((user) => {
    user.posts = postsByUser[user.id] || [];
  });

  return users;
}
```

**3. Memory-bound**

```javascript
// Symptom: High memory usage, GC pauses, OOM errors
// Example: Loading entire dataset into memory
async function processAllUsers() {
  const allUsers = await db.users.find(); // Load 10M users!
  return allUsers.map((u) => transform(u));
}

// ✅ Fix: Stream/paginate
async function* processUsersStreaming() {
  const pageSize = 1000;
  let offset = 0;

  while (true) {
    const users = await db.users.find().skip(offset).limit(pageSize);
    if (users.length === 0) break;

    for (const user of users) {
      yield transform(user);
    }

    offset += pageSize;
  }
}
```

**4. Lock contention**

```javascript
// Symptom: Low CPU/memory, high latency under load
// Example: Single database connection pool bottleneck

// ❌ Bad: Single connection
const pool = mysql.createPool({ connectionLimit: 1 });

// ✅ Better: Larger pool
const pool = mysql.createPool({
  connectionLimit: 10,
  queueLimit: 50,
});

// Monitor pool usage
pool.on("acquire", () => {
  console.log("Connection acquired");
});

pool.on("release", () => {
  console.log("Connection released");
});
```

### Profiling Workflow

```
1. Measure baseline performance
   ↓
2. Profile with appropriate tool
   ↓
3. Identify hotspots (top 20% of time)
   ↓
4. Hypothesize root cause
   ↓
5. Implement fix
   ↓
6. Re-profile and compare
   ↓
7. Repeat until satisfied
```

## Best Practices

### ✅ DO

1. **Profile before optimizing**

```bash
# Measure first
time node app.js  # Baseline: 5.2s

# Optimize, then measure again
time node app.js  # After: 1.8s (65% improvement)
```

2. **Focus on hot paths**

```
80% of time is spent in 20% of code
→ Optimize the 20%, not everything
```

3. **Use production-like data**

```javascript
// ❌ Testing with 10 records
// ✅ Testing with 10,000 records (production scale)
```

4. **Profile in production** (with low overhead tools)

```javascript
// Continuous profiling captures real workload patterns
// that synthetic tests miss
```

### ❌ DON'T

1. **Don't optimize prematurely**

```javascript
// ❌ Micro-optimizing before profiling
for (let i = 0, len = arr.length; i < len; i++) {} // Negligible gain

// ✅ Focus on algorithmic improvements
O(n²) → O(n log n)  // Significant gain
```

2. **Don't profile debug builds**

```bash
# ❌ Profiling development build
npm run dev

# ✅ Profiling production build
npm run build
NODE_ENV=production node dist/app.js
```

3. **Don't ignore sample size**

```bash
# ❌ Single run (noise)
time curl http://localhost:3000

# ✅ Multiple runs (statistical significance)
for i in {1..100}; do time curl http://localhost:3000; done
```

## Tools Comparison

| Tool                | Type       | Language    | Overhead | Production-Safe |
| ------------------- | ---------- | ----------- | -------- | --------------- |
| **perf**            | CPU        | Any (Linux) | Low      | Yes             |
| **pprof (Go)**      | CPU/Memory | Go          | Low      | Yes             |
| **cProfile**        | CPU        | Python      | Medium   | Caution         |
| **Chrome DevTools** | Browser    | JavaScript  | Medium   | Dev only        |
| **Pyroscope**       | Continuous | Any         | Very low | Yes             |
| **Valgrind**        | Memory     | C/C++       | High     | Dev only        |
| **heaptrack**       | Memory     | C/C++       | Medium   | Caution         |
| **VisualVM**        | CPU/Memory | Java        | Low      | Yes             |

## Quick Reference

```bash
# Node.js CPU profile
node --prof app.js
node --prof-process isolate-*.log > profile.txt

# Python CPU profile
python -m cProfile -o profile.stats script.py
python -c "import pstats; p = pstats.Stats('profile.stats'); p.sort_stats('cumulative'); p.print_stats(20)"

# Go CPU profile
go tool pprof http://localhost:6060/debug/pprof/profile?seconds=30

# PostgreSQL explain
EXPLAIN (ANALYZE, BUFFERS) SELECT ...;

# Chrome DevTools
DevTools → Performance → Record → Stop

# Lighthouse
lighthouse https://example.com --view
```

## Additional Resources

- [Brendan Gregg's Performance Tools](https://www.brendangregg.com/linuxperf.html)
- [Node.js Profiling Guide](https://nodejs.org/en/docs/guides/simple-profiling/)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
- [Database Performance Tuning](https://use-the-index-luke.com/)
- [Flamegraphs](https://www.brendangregg.com/flamegraphs.html)

---

**Related Skills**: [load-testing](../load-testing/SKILL.md) | [performance](../performance/SKILL.md) | [observability](../observability/SKILL.md)
