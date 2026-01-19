# Reference Material

## Core Principles

1. **Token budgets are real**: Know limits; prune proactively.
2. **Prioritize**: Recency, relevance, and impact over completeness.
3. **Lossy Compression**: Summarize facts/decisions; drop verbose reasoning.
4. **External Memory**: Use vector stores or logs for infinite recall.
5. **Observe**: Track fill rates and retrieval latency.

## Context Strategies

### 1. Rolling Window
- **Pros**: Simple, fast.
- **Cons**: Loses distant history immediately.

### 2. Hierarchical Summarization
- **Pros**: Preserves high-level arc.
- **Cons**: Lossy details; extra compute cost.

### 3. Selective Recall (Tagging)
- **Pros**: High signal-to-noise ratio.
- **Cons**: Requires accurate tagging heuristics.

## External Memory Stores

| Store | Use Case | Mechanism |
|-------|----------|-----------|
| **Vector DB** | Semantic Search | Embeddings + Nearest Neighbor |
| **Key-Value** | Precise structured data | Hash Map (User ID -> Prefs) |
| **Append Log** | Audit / Debugging | Time-series stream |

## Best Practices
- **Compress Early**: Don't wait for the context limit error.
- **Metadata**: Tag messages with type, importance, timestamp.
- **Cache**: Store summaries to avoid re-computing.
- **Hybrid**: Combine rolling window (recent) + vector search (history).

## Anti-Patterns
- **No Pruning**: Crashing when context fills up.
- **Over-summarization**: Losing critical code snippets or specific error IDs.
- **Stale Context**: Feeding the model outdated file contents.
- **Slow Retrieval**: Blocking user interaction on DB lookups.
