# Reference Material

## Core Principles

1. **Version Everything**: Models, features, code. Reproducibility is key.
2. **Right Pattern**: Batch for throughput, Online for latency, Streaming for events.
3. **Optimize**: Quantization, batching, and caching to reduce cost/latency.
4. **Gradual Rollout**: Never deploy to 100% immediately. Use Canary or A/B.
5. **Monitor**: Latency, errors, saturation, and drift.

## Inference Patterns

| Pattern | Latency | Throughput | Use Case |
|---------|---------|------------|----------|
| **Batch** | High (Hours) | Very High | Churn prediction, Weekly recommendations |
| **Online** | Low (ms) | Variable | Fraud detection, Search ranking |
| **Streaming** | Medium (sec) | High | Anomaly detection, Dynamic pricing |

## Deployment Strategies

- **Recreate**: Kill old, start new. Downtime involved.
- **Rolling Update**: Update N instances at a time. Zero downtime.
- **Blue/Green**: Two full environments. Switch router. Instant rollback.
- **Canary**: Route small % of traffic to new version. Verify metrics before promoting.
- **Shadow**: Route traffic to new version but discard response. Test performance safely.

## Optimization Techniques

- **Quantization**: Reduce model size/precision (float32 -> int8).
- **Pruning**: Remove unused neuron connections.
- **Distillation**: Train smaller student model from large teacher.
- **Batching**: Group requests to utilize GPU parallelism.
- **Caching**: Cache frequent predictions (e.g. popular products).
