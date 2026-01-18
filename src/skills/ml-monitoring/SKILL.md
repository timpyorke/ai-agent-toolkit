# ML Monitoring

> **Category**: Data & ML  
> **Audience**: ML engineers, data scientists, SREs  
> **Prerequisites**: Understanding of ML models, statistics, observability  
> **Complexity**: Advanced

## Overview

ML monitoring ensures models continue performing well in production by detecting data drift, concept drift, performance degradation, and fairness issues. This skill covers drift detection (statistical tests), model performance monitoring, retraining triggers, bias/fairness monitoring, explainability, observability dashboards, and alerting—enabling reliable ML systems.

## Why ML Monitoring?

**Without monitoring**: Silent model failures, degraded accuracy, biased predictions, no visibility into why predictions changed.

**With monitoring**: Early detection of issues, automated retraining, fairness guarantees, explainable predictions.

**Real-world scenario**:

```
Credit scoring model deployed in January 2024:
  - Training accuracy: 92%
  - Production accuracy (March 2024): 78% ⚠️

Cause: Economic changes shifted data distribution
Solution: Data drift detection → Automated retraining

Without monitoring: Customers get incorrect scores for months
With monitoring: Alert fires, model retrains, accuracy restored
```

## Data Drift Detection

**Data drift**: Input feature distributions change over time.

### Statistical Tests

**Kolmogorov-Smirnov Test (Continuous Features)**

```python
from scipy.stats import ks_2samp
import numpy as np

def detect_drift_ks(reference_data, current_data, feature, threshold=0.05):
    """
    Detect drift using KS test

    Args:
        reference_data: Training data features
        current_data: Recent production data
        feature: Feature name to test
        threshold: p-value threshold (default 0.05)

    Returns:
        bool: True if drift detected
    """
    statistic, p_value = ks_2samp(
        reference_data[feature],
        current_data[feature]
    )

    drift_detected = p_value < threshold

    return {
        'feature': feature,
        'drift_detected': drift_detected,
        'p_value': p_value,
        'ks_statistic': statistic
    }

# Example usage
reference = train_df['income']
current = production_df_last_week['income']

result = detect_drift_ks({'income': reference}, {'income': current}, 'income')

if result['drift_detected']:
    print(f"⚠️ Drift detected in {result['feature']}: p={result['p_value']:.4f}")
    trigger_alert('data_drift', result)
```

**Chi-Square Test (Categorical Features)**

```python
from scipy.stats import chi2_contingency
import pandas as pd

def detect_drift_chi2(reference_data, current_data, feature, threshold=0.05):
    """Detect drift in categorical features"""

    # Create contingency table
    ref_counts = reference_data[feature].value_counts()
    cur_counts = current_data[feature].value_counts()

    # Align categories
    all_categories = set(ref_counts.index) | set(cur_counts.index)

    ref_counts = ref_counts.reindex(all_categories, fill_value=0)
    cur_counts = cur_counts.reindex(all_categories, fill_value=0)

    contingency_table = pd.DataFrame({
        'reference': ref_counts,
        'current': cur_counts
    }).T

    # Chi-square test
    chi2, p_value, dof, expected = chi2_contingency(contingency_table)

    return {
        'feature': feature,
        'drift_detected': p_value < threshold,
        'p_value': p_value,
        'chi2_statistic': chi2
    }

# Example
result = detect_drift_chi2(train_df, production_df, 'product_category')
```

**Population Stability Index (PSI)**

```python
import numpy as np

def calculate_psi(reference, current, bins=10):
    """
    Calculate Population Stability Index

    PSI < 0.1: No significant change
    0.1 <= PSI < 0.2: Moderate change
    PSI >= 0.2: Significant change (retraining needed)
    """

    # Create bins from reference data
    breakpoints = np.quantile(reference, np.linspace(0, 1, bins + 1))
    breakpoints = np.unique(breakpoints)  # Remove duplicates

    # Bin both datasets
    ref_binned = np.digitize(reference, breakpoints[1:-1])
    cur_binned = np.digitize(current, breakpoints[1:-1])

    # Calculate proportions
    ref_props = np.histogram(ref_binned, bins=len(np.unique(ref_binned)))[0] / len(reference)
    cur_props = np.histogram(cur_binned, bins=len(np.unique(cur_binned)))[0] / len(current)

    # Avoid log(0)
    ref_props = np.clip(ref_props, 1e-10, 1)
    cur_props = np.clip(cur_props, 1e-10, 1)

    # PSI formula
    psi = np.sum((cur_props - ref_props) * np.log(cur_props / ref_props))

    return {
        'psi': psi,
        'drift_severity': 'high' if psi >= 0.2 else 'medium' if psi >= 0.1 else 'low'
    }

# Monitor PSI over time
psi_results = []
for week in production_data_by_week:
    psi = calculate_psi(train_df['age'], week['age'])
    psi_results.append({
        'week': week['week_number'],
        'psi': psi['psi'],
        'severity': psi['drift_severity']
    })
```

### Evidently AI (Drift Detection Framework)

```python
from evidently.report import Report
from evidently.metric_preset import DataDriftPreset, DataQualityPreset
from evidently.test_suite import TestSuite
from evidently.tests import TestNumberOfDriftedColumns

# Create drift report
drift_report = Report(metrics=[
    DataDriftPreset(),
    DataQualityPreset()
])

drift_report.run(
    reference_data=train_df,
    current_data=production_df,
    column_mapping=None
)

# Save HTML report
drift_report.save_html("drift_report.html")

# Get JSON results
drift_results = drift_report.as_dict()

# Check drift status
n_drifted = drift_results['metrics'][0]['result']['number_of_drifted_columns']
n_columns = drift_results['metrics'][0]['result']['number_of_columns']

if n_drifted / n_columns > 0.3:  # More than 30% columns drifted
    print(f"⚠️ Significant drift: {n_drifted}/{n_columns} columns")
    trigger_retraining()

# Automated test suite
tests = TestSuite(tests=[
    TestNumberOfDriftedColumns(lte=3)  # Alert if > 3 columns drift
])

tests.run(reference_data=train_df, current_data=production_df)

if not tests.as_dict()['summary']['all_passed']:
    send_alert("Drift test failed")
```

## Model Performance Monitoring

### Prediction Tracking

```python
from dataclasses import dataclass
from datetime import datetime
from typing import Optional
import json

@dataclass
class PredictionLog:
    prediction_id: str
    timestamp: datetime
    model_version: str
    features: dict
    prediction: float
    ground_truth: Optional[float] = None
    latency_ms: Optional[float] = None

    def to_json(self):
        return json.dumps({
            'prediction_id': self.prediction_id,
            'timestamp': self.timestamp.isoformat(),
            'model_version': self.model_version,
            'features': self.features,
            'prediction': self.prediction,
            'ground_truth': self.ground_truth,
            'latency_ms': self.latency_ms
        })

# Log predictions
def make_prediction(model, features, model_version):
    start_time = time.time()

    prediction = model.predict([features])[0]

    latency_ms = (time.time() - start_time) * 1000

    log = PredictionLog(
        prediction_id=str(uuid.uuid4()),
        timestamp=datetime.now(),
        model_version=model_version,
        features=features,
        prediction=float(prediction),
        latency_ms=latency_ms
    )

    # Store in database / data lake
    predictions_db.insert(log.to_json())

    return prediction
```

### Performance Metrics Calculation

```python
import pandas as pd
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

def calculate_performance_metrics(predictions_df, window='7D'):
    """
    Calculate rolling performance metrics

    Args:
        predictions_df: DataFrame with predictions and ground_truth
        window: Rolling window (e.g., '7D' for 7 days)
    """
    # Filter to predictions with ground truth
    labeled_df = predictions_df[predictions_df['ground_truth'].notna()].copy()

    # Sort by timestamp
    labeled_df = labeled_df.sort_values('timestamp')
    labeled_df.set_index('timestamp', inplace=True)

    # Calculate metrics over rolling window
    metrics = []

    for end_date in pd.date_range(labeled_df.index.min(), labeled_df.index.max(), freq='1D'):
        window_df = labeled_df[end_date - pd.Timedelta(window):end_date]

        if len(window_df) < 100:  # Need minimum samples
            continue

        y_true = window_df['ground_truth']
        y_pred = (window_df['prediction'] > 0.5).astype(int)

        metrics.append({
            'date': end_date,
            'accuracy': accuracy_score(y_true, y_pred),
            'precision': precision_score(y_true, y_pred),
            'recall': recall_score(y_true, y_pred),
            'f1': f1_score(y_true, y_pred),
            'sample_count': len(window_df)
        })

    return pd.DataFrame(metrics)

# Alert on degradation
metrics_df = calculate_performance_metrics(predictions_df)

baseline_accuracy = 0.90
current_accuracy = metrics_df.iloc[-1]['accuracy']

if current_accuracy < baseline_accuracy - 0.05:  # 5% drop
    send_alert({
        'type': 'performance_degradation',
        'metric': 'accuracy',
        'baseline': baseline_accuracy,
        'current': current_accuracy,
        'drop': baseline_accuracy - current_accuracy
    })
```

### Prometheus Metrics

```python
from prometheus_client import Counter, Histogram, Gauge
import time

# Define metrics
prediction_counter = Counter(
    'ml_predictions_total',
    'Total predictions made',
    ['model_version', 'outcome']
)

prediction_latency = Histogram(
    'ml_prediction_latency_seconds',
    'Prediction latency',
    ['model_version'],
    buckets=[.001, .005, .01, .025, .05, .1, .25, .5, 1.0]
)

model_accuracy = Gauge(
    'ml_model_accuracy',
    'Current model accuracy',
    ['model_version']
)

# Instrument prediction endpoint
@app.post("/predict")
async def predict(features: List[float]):
    start_time = time.time()

    # Make prediction
    prediction = model.predict([features])[0]

    # Record metrics
    latency = time.time() - start_time
    prediction_latency.labels(model_version='v2.1.0').observe(latency)

    outcome = 'positive' if prediction > 0.5 else 'negative'
    prediction_counter.labels(model_version='v2.1.0', outcome=outcome).inc()

    return {"prediction": float(prediction)}

# Update accuracy metric (run periodically)
def update_accuracy_metric():
    """Calculate and update accuracy gauge"""
    recent_predictions = get_recent_predictions_with_labels(days=7)

    if len(recent_predictions) > 0:
        accuracy = calculate_accuracy(recent_predictions)
        model_accuracy.labels(model_version='v2.1.0').set(accuracy)

# Prometheus alert rules (prometheus.yml)
"""
groups:
- name: ml_model_alerts
  rules:
  - alert: ModelAccuracyLow
    expr: ml_model_accuracy{model_version="v2.1.0"} < 0.85
    for: 1h
    labels:
      severity: critical
    annotations:
      summary: "Model accuracy dropped below 85%"

  - alert: PredictionLatencyHigh
    expr: histogram_quantile(0.95, ml_prediction_latency_seconds) > 0.5
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "95th percentile latency > 500ms"
"""
```

## Concept Drift

**Concept drift**: Relationship between features and target changes.

### Detecting Concept Drift

```python
def detect_concept_drift(predictions_df, reference_accuracy, threshold=0.05):
    """
    Detect concept drift by monitoring performance

    Concept drift = features stay same, but target relationship changes
    """

    # Recent performance
    recent_predictions = predictions_df[predictions_df['ground_truth'].notna()]
    recent_predictions = recent_predictions.tail(1000)  # Last 1000 labeled samples

    y_true = recent_predictions['ground_truth']
    y_pred = (recent_predictions['prediction'] > 0.5).astype(int)

    current_accuracy = accuracy_score(y_true, y_pred)
    accuracy_drop = reference_accuracy - current_accuracy

    # Check for data drift
    feature_drift = check_feature_drift(recent_predictions)

    # Concept drift: Performance drops WITHOUT significant feature drift
    if accuracy_drop > threshold and not feature_drift:
        return {
            'concept_drift_detected': True,
            'reference_accuracy': reference_accuracy,
            'current_accuracy': current_accuracy,
            'accuracy_drop': accuracy_drop,
            'recommendation': 'Retrain model with recent labeled data'
        }

    return {'concept_drift_detected': False}

# Adaptive windowing for drift detection
from river import drift

detector = drift.ADWIN()

for prediction, ground_truth in streaming_predictions():
    # Check if prediction was correct
    correct = int(prediction == ground_truth)

    # Update detector
    detector.update(correct)

    if detector.drift_detected:
        print("⚠️ Concept drift detected!")
        trigger_model_retraining()
        detector.reset()
```

## Fairness and Bias Monitoring

### Demographic Parity

```python
def calculate_demographic_parity(predictions_df, sensitive_feature):
    """
    Demographic parity: P(Ŷ=1 | A=a) should be similar for all groups

    Args:
        predictions_df: Predictions with sensitive attributes
        sensitive_feature: Feature to check (e.g., 'gender', 'race')
    """

    results = {}

    for group in predictions_df[sensitive_feature].unique():
        group_df = predictions_df[predictions_df[sensitive_feature] == group]
        positive_rate = (group_df['prediction'] > 0.5).mean()
        results[group] = positive_rate

    # Calculate disparity
    max_rate = max(results.values())
    min_rate = min(results.values())
    disparity = max_rate - min_rate

    # Fairness threshold (e.g., 0.1 = 10% difference)
    is_fair = disparity < 0.1

    return {
        'metric': 'demographic_parity',
        'rates_by_group': results,
        'disparity': disparity,
        'is_fair': is_fair,
        'recommendation': 'Investigate bias' if not is_fair else 'No action needed'
    }

# Example
fairness_check = calculate_demographic_parity(predictions_df, 'gender')

if not fairness_check['is_fair']:
    print(f"⚠️ Fairness issue: {fairness_check['disparity']:.2%} disparity")
    print(f"Rates: {fairness_check['rates_by_group']}")
```

### Equal Opportunity

```python
def calculate_equal_opportunity(predictions_df, sensitive_feature):
    """
    Equal opportunity: True positive rates should be similar across groups
    TPR = P(Ŷ=1 | Y=1, A=a)
    """

    # Filter to positive ground truth only
    positive_df = predictions_df[predictions_df['ground_truth'] == 1]

    tpr_by_group = {}

    for group in positive_df[sensitive_feature].unique():
        group_df = positive_df[positive_df[sensitive_feature] == group]
        tpr = (group_df['prediction'] > 0.5).mean()  # True positive rate
        tpr_by_group[group] = tpr

    max_tpr = max(tpr_by_group.values())
    min_tpr = min(tpr_by_group.values())
    disparity = max_tpr - min_tpr

    return {
        'metric': 'equal_opportunity',
        'tpr_by_group': tpr_by_group,
        'disparity': disparity,
        'is_fair': disparity < 0.1
    }
```

### Fairlearn Integration

```python
from fairlearn.metrics import (
    demographic_parity_difference,
    equalized_odds_difference,
    MetricFrame
)
from sklearn.metrics import accuracy_score, precision_score

# Calculate fairness metrics
sensitive_features = predictions_df['gender']
y_true = predictions_df['ground_truth']
y_pred = (predictions_df['prediction'] > 0.5).astype(int)

# Demographic parity difference
dp_diff = demographic_parity_difference(
    y_true, y_pred, sensitive_features=sensitive_features
)

# Equalized odds difference
eo_diff = equalized_odds_difference(
    y_true, y_pred, sensitive_features=sensitive_features
)

# Disaggregated metrics
metric_frame = MetricFrame(
    metrics={
        'accuracy': accuracy_score,
        'precision': precision_score
    },
    y_true=y_true,
    y_pred=y_pred,
    sensitive_features=sensitive_features
)

print("Metrics by group:")
print(metric_frame.by_group)

print(f"\nDemographic parity difference: {dp_diff:.3f}")
print(f"Equalized odds difference: {eo_diff:.3f}")

# Alert if unfair
if dp_diff > 0.1 or eo_diff > 0.1:
    send_fairness_alert({
        'demographic_parity_diff': dp_diff,
        'equalized_odds_diff': eo_diff,
        'metrics_by_group': metric_frame.by_group.to_dict()
    })
```

## Explainability

### SHAP (SHapley Additive exPlanations)

```python
import shap
import numpy as np

# Train model
from sklearn.ensemble import RandomForestClassifier
model = RandomForestClassifier()
model.fit(X_train, y_train)

# Create explainer
explainer = shap.TreeExplainer(model)

# Explain predictions
shap_values = explainer.shap_values(X_test)

# Feature importance (global)
shap.summary_plot(shap_values[1], X_test, show=False)

# Individual prediction explanation
def explain_prediction(model, explainer, features, feature_names):
    """Explain single prediction"""
    shap_values = explainer.shap_values(features)

    # Get feature contributions
    contributions = dict(zip(feature_names, shap_values[1][0]))

    # Sort by absolute contribution
    sorted_contrib = sorted(
        contributions.items(),
        key=lambda x: abs(x[1]),
        reverse=True
    )

    return {
        'prediction': model.predict_proba(features)[0][1],
        'base_value': explainer.expected_value[1],
        'feature_contributions': sorted_contrib[:5]  # Top 5
    }

# Example
explanation = explain_prediction(model, explainer, X_test[0:1], feature_names)
print(f"Prediction: {explanation['prediction']:.3f}")
print("Top contributing features:")
for feature, contrib in explanation['feature_contributions']:
    print(f"  {feature}: {contrib:+.3f}")
```

### LIME (Local Interpretable Model-agnostic Explanations)

```python
from lime import lime_tabular

# Create LIME explainer
explainer = lime_tabular.LimeTabularExplainer(
    X_train.values,
    feature_names=feature_names,
    class_names=['negative', 'positive'],
    mode='classification'
)

# Explain prediction
def explain_with_lime(explainer, model, instance):
    """Explain prediction using LIME"""
    exp = explainer.explain_instance(
        instance,
        model.predict_proba,
        num_features=10
    )

    return {
        'prediction': model.predict_proba([instance])[0],
        'explanation': exp.as_list(),
        'local_accuracy': exp.score
    }

# Log explanations with predictions
prediction_with_explanation = {
    'prediction': model.predict_proba(features)[0][1],
    'explanation': explain_with_lime(explainer, model, features[0])
}
```

## Observability Dashboard

### Grafana Dashboard (JSON)

```json
{
  "dashboard": {
    "title": "ML Model Monitoring",
    "panels": [
      {
        "title": "Prediction Volume",
        "targets": [
          {
            "expr": "rate(ml_predictions_total[5m])"
          }
        ],
        "type": "graph"
      },
      {
        "title": "Model Accuracy (7-day rolling)",
        "targets": [
          {
            "expr": "ml_model_accuracy"
          }
        ],
        "type": "graph",
        "alert": {
          "conditions": [
            {
              "evaluator": {
                "params": [0.85],
                "type": "lt"
              }
            }
          ]
        }
      },
      {
        "title": "Prediction Latency (p95)",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, ml_prediction_latency_seconds)"
          }
        ],
        "type": "graph"
      },
      {
        "title": "Data Drift Score (PSI)",
        "targets": [
          {
            "expr": "ml_data_drift_psi"
          }
        ],
        "type": "graph",
        "thresholds": [
          { "value": 0.1, "color": "yellow" },
          { "value": 0.2, "color": "red" }
        ]
      },
      {
        "title": "Fairness - Demographic Parity",
        "targets": [
          {
            "expr": "ml_fairness_demographic_parity_diff"
          }
        ],
        "type": "gauge",
        "thresholds": [{ "value": 0.1, "color": "red" }]
      }
    ]
  }
}
```

### Alerting Rules

```yaml
# alertmanager-config.yml
groups:
  - name: ml_monitoring
    interval: 5m
    rules:
      # Accuracy degradation
      - alert: ModelAccuracyDegraded
        expr: ml_model_accuracy < 0.85
        for: 1h
        labels:
          severity: critical
          team: ml-engineering
        annotations:
          summary: "Model {{ $labels.model_version }} accuracy below 85%"
          description: "Current accuracy: {{ $value | humanizePercentage }}"
          runbook: "https://wiki.company.com/ml-model-degradation"

      # Data drift
      - alert: DataDriftDetected
        expr: ml_data_drift_psi > 0.2
        for: 15m
        labels:
          severity: warning
          team: ml-engineering
        annotations:
          summary: "Significant data drift detected (PSI > 0.2)"
          description: "PSI value: {{ $value }}"
          action: "Review recent data and consider retraining"

      # Fairness violation
      - alert: FairnessViolation
        expr: ml_fairness_demographic_parity_diff > 0.1
        for: 30m
        labels:
          severity: critical
          team: ml-engineering
        annotations:
          summary: "Fairness threshold violated"
          description: "Demographic parity difference: {{ $value }}"
          action: "Immediate investigation required"

      # Prediction latency
      - alert: HighPredictionLatency
        expr: histogram_quantile(0.95, ml_prediction_latency_seconds) > 1.0
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "95th percentile latency > 1s"
```

## Automated Retraining Pipeline

```python
from datetime import datetime, timedelta

class ModelRetrainingOrchestrator:
    def __init__(self, model_name, drift_threshold=0.2, accuracy_threshold=0.85):
        self.model_name = model_name
        self.drift_threshold = drift_threshold
        self.accuracy_threshold = accuracy_threshold

    def should_retrain(self) -> dict:
        """Determine if model needs retraining"""
        reasons = []

        # Check data drift
        drift_score = self.check_data_drift()
        if drift_score > self.drift_threshold:
            reasons.append(f"Data drift detected (PSI={drift_score:.3f})")

        # Check accuracy
        current_accuracy = self.check_model_accuracy()
        if current_accuracy < self.accuracy_threshold:
            reasons.append(f"Accuracy dropped ({current_accuracy:.2%})")

        # Check time since last training
        days_since_training = self.days_since_last_training()
        if days_since_training > 30:  # Retrain monthly minimum
            reasons.append(f"Scheduled retraining ({days_since_training} days)")

        return {
            'should_retrain': len(reasons) > 0,
            'reasons': reasons
        }

    def trigger_retraining(self):
        """Trigger automated retraining pipeline"""
        decision = self.should_retrain()

        if not decision['should_retrain']:
            return {'status': 'skipped', 'message': 'No retraining needed'}

        # Create retraining job
        job = {
            'model_name': self.model_name,
            'trigger_reasons': decision['reasons'],
            'timestamp': datetime.now(),
            'training_data_start': datetime.now() - timedelta(days=90),
            'training_data_end': datetime.now()
        }

        # Submit to training pipeline (Airflow, Kubeflow, etc.)
        job_id = submit_training_job(job)

        # Log decision
        log_retraining_trigger(job_id, decision)

        return {
            'status': 'triggered',
            'job_id': job_id,
            'reasons': decision['reasons']
        }

# Run periodically (daily cron)
orchestrator = ModelRetrainingOrchestrator('fraud-detector')
result = orchestrator.trigger_retraining()

if result['status'] == 'triggered':
    print(f"✅ Retraining triggered: {result['reasons']}")
    send_notification('ml-team', f"Model retraining started: {result['job_id']}")
```

## Best Practices

### ✅ DO

1. **Log all predictions**

```python
# ✅ Store predictions for later analysis
log_prediction(features, prediction, model_version, timestamp)
```

2. **Monitor multiple metrics**

```python
# ✅ Track accuracy, fairness, drift, latency
metrics = {
    'accuracy': calculate_accuracy(),
    'drift_score': calculate_psi(),
    'fairness': check_demographic_parity(),
    'latency_p95': get_latency_p95()
}
```

3. **Automate retraining**

```python
# ✅ Retrain on drift/degradation
if drift_detected() or accuracy_dropped():
    trigger_retraining_pipeline()
```

4. **Explain predictions**

```python
# ✅ Provide explanations for critical predictions
if prediction_probability > 0.9:
    explanation = explain_with_shap(model, features)
    log_explanation(prediction_id, explanation)
```

### ❌ DON'T

1. **Don't deploy without monitoring**

```python
# ❌ No visibility
deploy_model()  # And forget about it

# ✅ Monitor continuously
deploy_model_with_monitoring()
```

2. **Don't ignore fairness**

```python
# ❌ No fairness checks
# Model might be biased

# ✅ Monitor fairness metrics
monitor_fairness_metrics(sensitive_attributes)
```

3. **Don't wait for users to report issues**

```python
# ❌ Reactive
# User: "Your model is broken!"

# ✅ Proactive
# Alert: "Accuracy dropped 10%, retraining triggered"
```

## Quick Reference

```python
# Data drift (KS test)
from scipy.stats import ks_2samp
statistic, p_value = ks_2samp(reference, current)

# PSI calculation
psi = sum((current_pct - ref_pct) * log(current_pct / ref_pct))

# Evidently drift report
from evidently.report import Report
from evidently.metric_preset import DataDriftPreset
report = Report(metrics=[DataDriftPreset()])
report.run(reference_data=train_df, current_data=prod_df)

# SHAP explanations
import shap
explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X_test)

# Fairness (Fairlearn)
from fairlearn.metrics import demographic_parity_difference
dp_diff = demographic_parity_difference(y_true, y_pred, sensitive_features=gender)

# Prometheus metrics
from prometheus_client import Gauge
model_accuracy = Gauge('ml_model_accuracy', 'Model accuracy')
model_accuracy.set(0.92)
```

## Additional Resources

- [Evidently AI Documentation](https://docs.evidentlyai.com/)
- [SHAP Documentation](https://shap.readthedocs.io/)
- [Fairlearn Documentation](https://fairlearn.org/)
- [Alibi Detect (Drift Detection)](https://docs.seldon.io/projects/alibi-detect/)
- [Monitoring Machine Learning Models in Production](https://christophergs.com/machine%20learning/2020/03/14/how-to-monitor-machine-learning-models/)
- [Google ML Ops Best Practices](https://cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning)

---

**Related Skills**: [model-serving](../model-serving/SKILL.md) | [data-pipelines](../data-pipelines/SKILL.md) | [observability](../observability/SKILL.md) | [incident-response](../incident-response/SKILL.md)
