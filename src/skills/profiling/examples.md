# Examples

## CPU Profiling

### Node.js Profiler
```bash
# Capture profile
node --prof app.js

# Process log (v8 > 5.2)
node --prof-process isolate-0x*.log > processed.txt
```

### Python cProfile
```python
import cProfile

def heavy_computation():
    return [i * i for i in range(1000000)]

cProfile.run('heavy_computation()')
```

### Go pprof
```go
import _ "net/http/pprof"

func main() {
    go func() {
        log.Println(http.ListenAndServe("localhost:6060", nil))
    }()
    // ...
}
```

## Memory Profiling

### Heap Snapshot (Node.js)
```javascript
const v8 = require('v8');
const stream = v8.getHeapSnapshot();
// Pipe stream to file to inspect in Chrome DevTools
```

### Memory Leak (Python)
```python
from memory_profiler import profile

@profile
def heavy_memory_func():
    a = [1] * (10 ** 6)
    b = [2] * (2 * 10 ** 7)
    del b
    return a
```

## Database Profiling

### Postgres Explain Analyze
```sql
EXPLAIN ANALYZE
SELECT u.name, COUNT(o.id)
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE o.created_at > NOW() - INTERVAL '1 month'
GROUP BY u.name;
```

### MongoDB Explain
```javascript
db.collection.find({ status: "active" }).explain("executionStats")
```

## Network Profiling (Axios Interceptor)
```javascript
axios.interceptors.request.use(x => {
    x.meta = x.meta || {};
    x.meta.requestStartedAt = new Date().getTime();
    return x;
});

axios.interceptors.response.use(x => {
    console.log(`Execution time for: ${x.config.url} - ${new Date().getTime() - x.config.meta.requestStartedAt} ms`);
    return x;
});
```
