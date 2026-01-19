# Reference Material

## Core Principles

1.  **Measure First**: Don't guess. Intuition is often wrong about bottlenecks.
2.  **Pareto Principle**: 80% of execution time is spent in 20% of the code.
3.  **Use Production Data**: Profiling with empty DBs is misleading.

## Profiling Types

| Type | What it measures | Tools |
|------|------------------|-------|
| **CPU** | Time spent in functions | perf, flamegraphs, pprof |
| **Memory** | Heap allocations, leaks | Valgrind, Heap Snapshots |
| **I/O** | Disk/Network wait time | iostat, strace, Wireshark |
| **Database** | Query execution time | EXPLAIN, Slow Query Log |

## Flamegraphs Guide

-   **x-axis**: Population (alphabetical, not time-ordered). Wider = more CPU time.
-   **y-axis**: Stack depth.
-   **Colors**: Usually random, or code-type based (kernel vs user).
-   **Goal**: Find the widest "plateaus" (functions taking most time).

## Common Bottlenecks

1.  **N+1 Queries**: 1000 SQL calls instead of 1.
2.  **Serialization**: JSON parse/stringify on large objects.
3.  **Tight Loops**: O(N^2) algorithms on large inputs.
4.  **Lock Contention**: Threads waiting on a mutex/DB lock.
