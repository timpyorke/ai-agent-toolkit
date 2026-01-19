# Examples

## Data Drift Detection

### Statistical Tests (KS & Chi-Squared)
```python
from scipy.stats import ks_2samp, chi2_contingency
import pandas as pd

def detect_drift_ks(reference_data, current_data, feature, threshold=0.05):
    """Detect drift using KS test for continuous features"""
    statistic, p_value = ks_2samp(
        reference_data[feature],
        current_data[feature]
    )
    return {
        'feature': feature,
        'drift_detected': p_value < threshold,
        'p_value': p_value
    }

def detect_drift_chi2(reference_data, current_data, feature, threshold=0.05):
    """Detect drift using Chi-square test for categorical features"""
    ref_counts = reference_data[feature].value_counts()
    cur_counts = current_data[feature].value_counts()
    
    # Align categories
    all_categories = set(ref_counts.index) | set(cur_counts.index)
    ref_counts = ref_counts.reindex(all_categories, fill_value=0)
    cur_counts = cur_counts.reindex(all_categories, fill_value=0)

    contingency_table = pd.DataFrame({'ref': ref_counts, 'cur': cur_counts}).T
    chi2, p_value, _, _ = chi2_contingency(contingency_table)
    
    return {
        'feature': feature,
        'drift_detected': p_value < threshold,
        'p_value': p_value
    }
```

### Population Stability Index (PSI)
```python
import numpy as np

def calculate_psi(reference, current, bins=10):
    breakpoints = np.quantile(reference, np.linspace(0, 1, bins + 1))
    breakpoints = np.unique(breakpoints)
    
    ref_binned = np.digitize(reference, breakpoints[1:-1])
    cur_binned = np.digitize(current, breakpoints[1:-1])
    
    ref_props = np.histogram(ref_binned, bins=len(np.unique(ref_binned)))[0] / len(reference)
    cur_props = np.histogram(cur_binned, bins=len(np.unique(cur_binned)))[0] / len(current)
    
    # Avoid log(0)
    ref_props = np.clip(ref_props, 1e-10, 1)
    cur_props = np.clip(cur_props, 1e-10, 1)
    
    psi = np.sum((cur_props - ref_props) * np.log(cur_props / ref_props))
    return psi
```

### Evidently AI
```python
from evidently.report import Report
from evidently.metric_preset import DataDriftPreset

drift_report = Report(metrics=[DataDriftPreset()])
drift_report.run(reference_data=train_df, current_data=production_df)
drift_report.save_html("drift_report.html")

# JSON check
results = drift_report.as_dict()
if results['metrics'][0]['result']['dataset_drift']:
    print("⚠️ Dataset drift detected")
```

## Performance Monitoring

### Prometheus Metrics
```python
from prometheus_client import histogram_quantile, Counter, Histogram, Gauge

prediction_latency = Histogram(
    'ml_prediction_latency_seconds', 
    'Prediction latency', 
    ['model_version']
)
model_accuracy = Gauge(
    'ml_model_accuracy', 
    'Current model accuracy', 
    ['model_version']
)

def record_metrics(start_time, model_version):
    latency = time.time() - start_time
    prediction_latency.labels(model_version=model_version).observe(latency)
```

## Fairness Monitoring

### Demographic Parity
```python
def calculate_demographic_parity(predictions_df, sensitive_feature):
    """Check if positive rate is similar across groups"""
    results = {}
    for group in predictions_df[sensitive_feature].unique():
        group_df = predictions_df[predictions_df[sensitive_feature] == group]
        results[group] = (group_df['prediction'] > 0.5).mean()
        
    disparity = max(results.values()) - min(results.values())
    return {'disparity': disparity, 'is_fair': disparity < 0.1}
```

## Explainability

### SHAP
```python
import shap

# Explain single prediction
explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X_test)

# Feature importance plot
shap.summary_plot(shap_values[1], X_test)
```

### LIME
```python
from lime import lime_tabular

explainer = lime_tabular.LimeTabularExplainer(
    X_train.values,
    mode='classification',
    feature_names=feature_names
)

exp = explainer.explain_instance(instance, model.predict_proba)
```

## Automated Retraining
```python
class ModelRetrainingOrchestrator:
    def should_retrain(self, model_name):
        drift = get_drift_metrics(model_name)
        perf = get_performance_metrics(model_name)
        
        if drift['psi'] > 0.2 or perf['accuracy'] < 0.85:
            return True
        return False
```
