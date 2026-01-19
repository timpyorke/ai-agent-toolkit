# Reference Material

## Core Principles

1. **Log Everything**: Features, outputs, specific model versions.
2. **Monitor Drift**: Statistical difference between training (reference) and production (current) data.
3. **Track Performance**: Latency and accuracy metrics.
4. **Enforce Fairness**: Demographic parity and equal opportunity.
5. **Automate**: Retrain when drift or degradation is detected.

## Drift Types

| Type | Description | Detection Method |
|------|-------------|------------------|
| **Data Drift** | Input feature distribution changes. | KS Test, PSI, Chi-Square |
| **Concept Drift** | Relationship between input and target changes. | Accuracy drop, ADWIN |
| **Label Drift** | Distribution of the target label changes. | Chi-Square on output class |

## Statistical Tests

- **Kolmogorov-Smirnov (KS)**: For continuous features. Compares cumulative distributions.
- **Chi-Square**: For categorical features. Compares observed vs expected frequencies.
- **PSI (Population Stability Index)**: Measure of how much a distribution has shifted.
  - PSI < 0.1: No change
  - 0.1 ≤ PSI < 0.2: Moderate
  - PSI ≥ 0.2: Significant

## Fairness Metrics

- **Demographic Parity**: Positive prediction rate should be equal across groups.
- **Equal Opportunity**: True Positive Rate (TPR) should be equal across groups.
- **Equalized Odds**: TPR and False Positive Rate (FPR) should be equal.

## Observability Pillars

1. **Logs**: Structural logs of every prediction.
2. **Metrics**: Aggregated time-series (RPS, Latency, Accuracy).
3. **Traces**: End-to-end request flow.

## Alerting Rules
- **Accuracy Drop**: > 5% degradation.
- **Latency Spike**: p95 > threshold.
- **Drift**: PSI > 0.2 or significant failed columns.
- **Fairness**: Disparity > 0.1.
