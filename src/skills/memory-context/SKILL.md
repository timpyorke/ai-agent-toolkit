---
name: memory-context
description: Manage bounded context windows with strategic recall, summarization, caching, and retrieval to maintain continuity across long sessions.
---

# 🧠 Memory & Context Management

## Overview

Memory and context management lets AI agents handle long conversations or sessions by strategically storing, retrieving, summarizing, and pruning information within token budgets. This skill defines external memory stores, summarization strategies, retrieval patterns, and cache invalidation to preserve coherence and relevance.

## Core Principles

1. Token budgets are real: always know limits; prune proactively.
2. Prioritize by recency, relevance, and impact; discard low-value details.
3. Summarize lossy-compressibly: key facts, decisions, and open questions only.
4. External memory: use vector stores, KV caches, or logs for retrieval.
5. Observe and adapt: track fill rates, retrieval latency, and cache hit rates.

## Context Window Strategies

### Rolling Window

- Keep most recent N messages; discard older.
- Simple and fast; loses distant history.

### Hierarchical Summarization

- Summarize old chunks into high-level summaries; retain recent verbatim.
- Preserves narrative arc; trade-off: lossy compression.

### Selective Recall

- Tag messages by importance (decision, key fact, tool result).
- Prune low-importance; fetch high-importance on demand.

## External Memory Stores

### Vector Embeddings

- Encode text into embeddings; retrieve nearest neighbors by semantic similarity.
- Best for: "find relevant past context for current query."

### Key-Value Caches

- Store facts, references, or intermediate results by key.
- Best for: fast lookups of structured state (user prefs, session data).

### Append-Only Logs

- Write all events; query by time or correlation ID.
- Best for: audit trails, debugging, long-term lineage.

## Summarization Techniques

### Extractive

- Pick key sentences verbatim; no rewriting.
- Fast; preserves exact language; may miss connections.

### Abstractive

- Rewrite context into concise summaries.
- Denser; risk of hallucinations or misrepresentation.

### Layered

- Immediate layer: verbatim recent turns.
- Intermediate layer: one-sentence summaries per chunk.
- Long-term layer: high-level arc ("We fixed auth bug, deployed v2, now tackling cache").

## Retrieval Patterns

- Query: "Find past messages mentioning 'authentication error'."
- Relevance: Use embeddings or keywords; rank by score.
- Time windows: "Last 30 minutes" or "Since last deploy."
- Correlation: "All messages with `correlationId=xyz`."

## Cache Invalidation

- Evict stale: user preferences changed, code refactored.
- TTL: expire after N minutes; refresh on access.
- Manual flush: user resets conversation; start fresh.

## Best Practices

- Compress early; don't wait until token limit hit.
- Tag messages with metadata: type, importance, timestamp, correlation ID.
- Store decisions and outcomes prominently; discard verbose intermediate reasoning.
- Retrieve on demand: don't load entire history if a targeted query suffices.
- Monitor fill rates and adjust pruning heuristics dynamically.

## Anti-Patterns

- No pruning strategy; hit context limit and crash.
- Over-summarization: losing critical details; under-summarization: wasting tokens.
- No tagging; can't distinguish important vs. trivial messages.
- Stale caches never invalidated; serving outdated data.
- Retrieval too slow; blocking workflow on memory lookups.

## Scenarios

### Long Code Review Session

1. Initial: load PR diff and comments (verbatim).
2. After 50 messages: summarize "Issue: auth bug fixed; 3 comments pending."
3. Retrieve only unresolved comments for next query.
4. End: archive full log; keep summary + final verdict.

### Multi-Day Project Work

1. Daily summaries: "Day 1: scaffolded API. Day 2: added caching."
2. Vector store: index code files and docs; retrieve on query.
3. Session restore: show summary + last 10 messages.
4. Flush: user starts new feature; clear old context except high-level goals.

### Debugging Investigation

1. Append-only log: all tool calls, errors, hypotheses.
2. Summarize per hour: "Tested 3 fixes; network timeout issue persists."
3. Retrieve: "Show all HTTP errors from last 2 hours."
4. Compress: final root cause + mitigation; discard verbose traces.

## Tools & Techniques

- Embeddings: OpenAI/Cohere/Sentence-BERT for semantic similarity
- Vector DBs: Pinecone, Weaviate, pgvector, FAISS
- KV stores: Redis, Memcached for fast caching
- Logs: Elasticsearch, CloudWatch, JSON append-only files
- Summarizers: GPT-4, Claude, fine-tuned T5 models

## Quick Reference

```python
# Summarize last N messages
def summarize(messages: list[str], model) -> str:
    prompt = f"Summarize key facts from:\n{messages}"
    return model.complete(prompt)

# Prune by importance
def prune(messages: list[dict], max_tokens: int) -> list[dict]:
    important = [m for m in messages if m.get('important')]
    recent = messages[-10:]
    return important + recent  # combined, within budget
```

## Conclusion

Effective memory management balances token budgets with continuity. Summarize strategically, retrieve selectively, cache intelligently, and prune proactively to maintain coherent long-running sessions.

---

**Related Skills**: [tool-use](../tool-use/SKILL.md) | [optimize-prompt](../optimize-prompt/SKILL.md) | [observability](../observability/SKILL.md)
