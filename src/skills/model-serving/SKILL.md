# Model Serving

> **Category**: Data & ML  
> **Audience**: ML engineers, data scientists, backend engineers  
> **Prerequisites**: Understanding of ML models, REST APIs, containerization  
> **Complexity**: Advanced

## Overview

Model serving deploys trained ML models to production where they can make predictions on real data. This skill covers batch inference, online inference (REST/gRPC), streaming inference, model versioning, A/B testing, feature stores, model registries (MLflow), and inference optimization (quantization, batching)—enabling scalable, reliable ML in production.

## Why Model Serving?

**Without proper serving**: Jupyter notebook models that never reach production, slow inference, hard to update, no monitoring.

**With proper serving**: Fast, scalable predictions, version control, gradual rollouts, performance tracking.

**Real-world scenario**:

```
Recommendation system needs:
  - Real-time predictions (< 100ms)
  - Handle 10,000 req/s
  - A/B test new models
  - Rollback if accuracy drops

Solution:
  - Online serving with FastAPI + TorchServe
  - Feature store for low-latency feature lookup
  - MLflow for model versioning
  - Gradual traffic shifting with A/B testing
```

## Inference Patterns

### Batch Inference

**Pattern**: Process large volumes of data offline, store predictions.

```python
# Batch inference with Spark
from pyspark.sql import SparkSession
import mlflow.pyfunc

spark = SparkSession.builder.appName("batch-inference").getOrCreate()

# Load model from registry
model_uri = "models:/product-recommender/production"
model = mlflow.pyfunc.load_model(model_uri)

# Load data
df = spark.read.parquet("s3://data/user-features/")

# Create pandas UDF for distributed inference
from pyspark.sql.functions import pandas_udf, PandasUDFType
import pandas as pd

@pandas_udf("array<string>", PandasUDFType.SCALAR)
def predict_udf(user_id: pd.Series, features: pd.Series) -> pd.Series:
    """Predict recommendations for batch of users"""
    input_df = pd.DataFrame({
        'user_id': user_id,
        'features': features
    })
    predictions = model.predict(input_df)
    return pd.Series(predictions)

# Apply inference to entire dataset
predictions_df = df.withColumn(
    "recommendations",
    predict_udf(df.user_id, df.features)
)

# Write predictions to database
predictions_df.write.mode("overwrite").parquet("s3://predictions/recommendations/")
```

**Use cases**:

- Daily/weekly model runs
- Non-time-sensitive predictions
- Large-scale processing (millions of records)
- Cost-optimized (can use spot instances)

### Online Inference (Synchronous)

**Pattern**: Real-time API serving with low latency.

**FastAPI + MLflow**

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import mlflow.pyfunc
import numpy as np

app = FastAPI()

# Load model at startup
model = None

@app.on_event("startup")
async def load_model():
    global model
    model_uri = "models:/fraud-detector/production"
    model = mlflow.pyfunc.load_model(model_uri)

class PredictionRequest(BaseModel):
    transaction_id: str
    amount: float
    merchant_category: str
    user_location: str

class PredictionResponse(BaseModel):
    transaction_id: str
    is_fraud: bool
    fraud_probability: float
    model_version: str

@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    """Predict fraud for transaction"""
    try:
        # Prepare features
        features = np.array([[
            request.amount,
            hash(request.merchant_category) % 1000,
            hash(request.user_location) % 100
        ]])

        # Inference
        prediction = model.predict(features)
        probability = float(prediction[0])

        return PredictionResponse(
            transaction_id=request.transaction_id,
            is_fraud=probability > 0.5,
            fraud_probability=probability,
            model_version="v2.1.0"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy", "model_loaded": model is not None}
```

**TorchServe**

```python
# handler.py for TorchServe
import torch
import json
from ts.torch_handler.base_handler import BaseHandler

class RecommenderHandler(BaseHandler):
    def initialize(self, context):
        """Load model"""
        self.manifest = context.manifest
        properties = context.system_properties
        model_dir = properties.get("model_dir")

        # Load PyTorch model
        self.model = torch.jit.load(f"{model_dir}/model.pt")
        self.model.eval()

        self.initialized = True

    def preprocess(self, requests):
        """Preprocess input"""
        inputs = []
        for request in requests:
            data = request.get("data") or request.get("body")
            if isinstance(data, (bytes, bytearray)):
                data = data.decode('utf-8')

            input_data = json.loads(data)
            # Convert to tensor
            tensor = torch.tensor(input_data['features'], dtype=torch.float32)
            inputs.append(tensor)

        return torch.stack(inputs)

    def inference(self, inputs):
        """Run inference"""
        with torch.no_grad():
            predictions = self.model(inputs)
        return predictions

    def postprocess(self, predictions):
        """Format output"""
        return [
            {"recommendations": pred.tolist()}
            for pred in predictions
        ]
```

**Deployment**

```bash
# Package model for TorchServe
torch-model-archiver \
  --model-name recommender \
  --version 1.0 \
  --model-file model.py \
  --serialized-file model.pt \
  --handler handler.py \
  --export-path model-store/

# Start TorchServe
torchserve \
  --start \
  --model-store model-store \
  --models recommender=recommender.mar \
  --ncs

# Make prediction
curl -X POST http://localhost:8080/predictions/recommender \
  -H "Content-Type: application/json" \
  -d '{"features": [1.0, 2.0, 3.0]}'
```

**Use cases**:

- User-facing features (< 100ms latency)
- Fraud detection, content recommendation
- Interactive applications
- Variable load patterns

### Streaming Inference

**Pattern**: Process events from stream (Kafka, Kinesis) in real-time.

```python
from kafka import KafkaConsumer, KafkaProducer
import json
import mlflow.pyfunc

# Load model
model = mlflow.pyfunc.load_model("models:/click-prediction/production")

# Kafka consumer
consumer = KafkaConsumer(
    'user-events',
    bootstrap_servers=['kafka:9092'],
    value_deserializer=lambda m: json.loads(m.decode('utf-8')),
    group_id='ml-inference-group'
)

# Kafka producer for predictions
producer = KafkaProducer(
    bootstrap_servers=['kafka:9092'],
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)

# Stream processing
for message in consumer:
    event = message.value

    # Extract features
    features = [
        event['user_age'],
        event['session_duration'],
        event['page_views']
    ]

    # Predict
    prediction = model.predict([features])[0]

    # Produce prediction
    result = {
        'user_id': event['user_id'],
        'predicted_click_probability': float(prediction),
        'timestamp': event['timestamp']
    }

    producer.send('predictions', result)
    producer.flush()
```

**Use cases**:

- Real-time analytics
- Anomaly detection on event streams
- Continuous predictions
- Low-latency requirements with high throughput

## Model Versioning

### MLflow Model Registry

```python
import mlflow
import mlflow.sklearn
from sklearn.ensemble import RandomForestClassifier

# Train model
model = RandomForestClassifier(n_estimators=100)
model.fit(X_train, y_train)

# Log model with MLflow
with mlflow.start_run() as run:
    # Log parameters
    mlflow.log_param("n_estimators", 100)
    mlflow.log_param("max_depth", 10)

    # Log metrics
    accuracy = model.score(X_test, y_test)
    mlflow.log_metric("accuracy", accuracy)

    # Log model
    mlflow.sklearn.log_model(
        model,
        "model",
        registered_model_name="fraud-detector"
    )

# Transition to staging
client = mlflow.tracking.MlflowClient()
model_version = 5

client.transition_model_version_stage(
    name="fraud-detector",
    version=model_version,
    stage="Staging"
)

# Promote to production after validation
client.transition_model_version_stage(
    name="fraud-detector",
    version=model_version,
    stage="Production",
    archive_existing_versions=True  # Archive old production version
)

# Load specific version
model_uri = f"models:/fraud-detector/{model_version}"
model = mlflow.pyfunc.load_model(model_uri)

# Load latest production model
model_uri = "models:/fraud-detector/production"
model = mlflow.pyfunc.load_model(model_uri)
```

### Semantic Versioning for Models

```python
from dataclasses import dataclass
from typing import Optional

@dataclass
class ModelVersion:
    major: int  # Breaking changes (API incompatibility)
    minor: int  # New features (backward compatible)
    patch: int  # Bug fixes
    metadata: Optional[dict] = None

    def __str__(self):
        return f"v{self.major}.{self.minor}.{self.patch}"

    @classmethod
    def from_string(cls, version_str: str):
        """Parse version string like 'v2.1.3'"""
        parts = version_str.lstrip('v').split('.')
        return cls(
            major=int(parts[0]),
            minor=int(parts[1]),
            patch=int(parts[2])
        )

# Version tracking
model_versions = {
    "v1.0.0": {
        "deployed": "2024-01-01",
        "accuracy": 0.85,
        "features": ["amount", "merchant", "location"]
    },
    "v2.0.0": {  # Breaking: added new required feature
        "deployed": "2024-02-01",
        "accuracy": 0.89,
        "features": ["amount", "merchant", "location", "device_id"]
    },
    "v2.1.0": {  # Feature: improved preprocessing
        "deployed": "2024-03-01",
        "accuracy": 0.91,
        "features": ["amount", "merchant", "location", "device_id"]
    }
}
```

## A/B Testing

### Traffic Splitting

```python
from fastapi import FastAPI, Header
import mlflow.pyfunc
import random

app = FastAPI()

# Load both models
model_v1 = mlflow.pyfunc.load_model("models:/recommender/1")
model_v2 = mlflow.pyfunc.load_model("models:/recommender/2")

# A/B test configuration
AB_TEST_CONFIG = {
    "v1": {"weight": 0.7, "model": model_v1},  # 70% traffic
    "v2": {"weight": 0.3, "model": model_v2}   # 30% traffic
}

def select_model(user_id: str):
    """Consistent assignment based on user_id"""
    # Hash user_id for consistent assignment
    hash_val = hash(user_id) % 100

    if hash_val < 70:  # 70%
        return "v1", model_v1
    else:
        return "v2", model_v2

@app.post("/recommend")
async def recommend(user_id: str, features: list):
    """Serve prediction with A/B testing"""
    # Select model variant
    variant, model = select_model(user_id)

    # Make prediction
    prediction = model.predict([features])

    # Log for analysis
    log_prediction(
        user_id=user_id,
        variant=variant,
        prediction=prediction,
        timestamp=datetime.now()
    )

    return {
        "recommendations": prediction.tolist(),
        "model_variant": variant  # For client-side tracking
    }
```

### Multi-Armed Bandit (Dynamic Traffic Allocation)

```python
import numpy as np
from collections import defaultdict

class ThompsonSampling:
    """Multi-armed bandit for dynamic A/B testing"""

    def __init__(self, variants: list):
        self.variants = variants
        # Beta distribution parameters (successes, failures)
        self.successes = defaultdict(lambda: 1)
        self.failures = defaultdict(lambda: 1)

    def select_variant(self) -> str:
        """Select variant based on Thompson sampling"""
        samples = {}
        for variant in self.variants:
            # Sample from Beta distribution
            alpha = self.successes[variant]
            beta = self.failures[variant]
            samples[variant] = np.random.beta(alpha, beta)

        # Select variant with highest sample
        return max(samples, key=samples.get)

    def update(self, variant: str, reward: float):
        """Update based on observed reward (0 or 1)"""
        if reward > 0:
            self.successes[variant] += 1
        else:
            self.failures[variant] += 1

    def get_stats(self):
        """Get performance stats"""
        stats = {}
        for variant in self.variants:
            total = self.successes[variant] + self.failures[variant]
            stats[variant] = {
                'success_rate': self.successes[variant] / total,
                'trials': total
            }
        return stats

# Usage
bandit = ThompsonSampling(variants=['v1', 'v2', 'v3'])

@app.post("/recommend")
async def recommend(user_id: str, features: list):
    # Select variant dynamically
    variant = bandit.select_variant()
    model = models[variant]

    # Make prediction
    prediction = model.predict([features])

    # Track for reward calculation (done asynchronously)
    track_prediction(user_id, variant, prediction)

    return {"recommendations": prediction.tolist()}

# Feedback loop (separate endpoint)
@app.post("/feedback")
async def feedback(user_id: str, clicked: bool):
    """User clicked recommendation"""
    variant = get_variant_for_user(user_id)
    reward = 1.0 if clicked else 0.0
    bandit.update(variant, reward)
```

## Feature Stores

### Feast (Feature Store)

```python
from feast import FeatureStore, Entity, FeatureView, Field
from feast.types import Float32, Int64, String
from datetime import timedelta

# Define entities
user = Entity(
    name="user",
    join_keys=["user_id"],
    description="User entity"
)

# Define feature view
from feast.data_source import FileSource

user_features = FeatureView(
    name="user_features",
    entities=[user],
    schema=[
        Field(name="age", dtype=Int64),
        Field(name="lifetime_value", dtype=Float32),
        Field(name="preferred_category", dtype=String),
    ],
    source=FileSource(
        path="s3://features/user-features.parquet",
        timestamp_field="event_timestamp"
    ),
    ttl=timedelta(days=1)
)

# Initialize feature store
store = FeatureStore(repo_path=".")

# Apply feature definitions
store.apply([user, user_features])

# Online serving: Get features for prediction
from feast import FeatureService

feature_service = FeatureService(
    name="recommendation_features",
    features=[user_features]
)

# Fetch features
entity_rows = [
    {"user_id": "user_123"},
    {"user_id": "user_456"}
]

features = store.get_online_features(
    features=[
        "user_features:age",
        "user_features:lifetime_value",
        "user_features:preferred_category"
    ],
    entity_rows=entity_rows
).to_dict()

# Use features for prediction
predictions = model.predict(features)
```

**Benefits of Feature Stores**:

- Consistent features across training and serving
- Low-latency feature lookup
- Feature versioning and lineage
- Reusable features across models

## Inference Optimization

### Model Quantization

**PyTorch Quantization**

```python
import torch
import torch.quantization

# Load trained model
model = load_trained_model()
model.eval()

# Post-training static quantization
model.qconfig = torch.quantization.get_default_qconfig('fbgemm')

# Prepare for quantization
model_prepared = torch.quantization.prepare(model)

# Calibrate with representative data
with torch.no_grad():
    for data in calibration_dataloader:
        model_prepared(data)

# Convert to quantized model
model_quantized = torch.quantization.convert(model_prepared)

# Quantized model is 4x smaller and faster
torch.jit.save(torch.jit.script(model_quantized), "model_quantized.pt")

# Inference with quantized model
with torch.no_grad():
    output = model_quantized(input_tensor)
```

**TensorFlow Lite Quantization**

```python
import tensorflow as tf

# Convert to TFLite with quantization
converter = tf.lite.TFLiteConverter.from_saved_model('model/')

# Post-training quantization
converter.optimizations = [tf.lite.Optimize.DEFAULT]

# Full integer quantization (8-bit)
def representative_dataset():
    for data in calibration_data:
        yield [data.astype(np.float32)]

converter.representative_dataset = representative_dataset
converter.target_spec.supported_ops = [tf.lite.OpsSet.TFLITE_BUILTINS_INT8]
converter.inference_input_type = tf.int8
converter.inference_output_type = tf.int8

tflite_model = converter.convert()

# Save quantized model
with open('model_quantized.tflite', 'wb') as f:
    f.write(tflite_model)
```

### Batching

**Dynamic Batching with TorchServe**

```yaml
# config.properties
inference_address=http://0.0.0.0:8080
management_address=http://0.0.0.0:8081

# Batching configuration
batchSize=32
maxBatchDelay=100  # ms
```

**Manual Batching**

```python
import asyncio
from collections import deque
from typing import List
import numpy as np

class BatchInferenceServer:
    def __init__(self, model, batch_size=32, max_wait_ms=100):
        self.model = model
        self.batch_size = batch_size
        self.max_wait_ms = max_wait_ms / 1000  # Convert to seconds
        self.queue = deque()
        self.processing = False

    async def predict(self, input_data):
        """Add request to batch queue"""
        future = asyncio.Future()
        self.queue.append((input_data, future))

        # Start processing if not already running
        if not self.processing:
            asyncio.create_task(self._process_batch())

        return await future

    async def _process_batch(self):
        """Process batch when full or timeout"""
        self.processing = True

        await asyncio.sleep(self.max_wait_ms)

        if len(self.queue) == 0:
            self.processing = False
            return

        # Collect batch
        batch_inputs = []
        batch_futures = []

        while self.queue and len(batch_inputs) < self.batch_size:
            input_data, future = self.queue.popleft()
            batch_inputs.append(input_data)
            batch_futures.append(future)

        # Batch inference
        batch_array = np.array(batch_inputs)
        predictions = self.model.predict(batch_array)

        # Return results
        for future, prediction in zip(batch_futures, predictions):
            future.set_result(prediction)

        self.processing = False

        # Process remaining items
        if self.queue:
            asyncio.create_task(self._process_batch())

# Usage with FastAPI
from fastapi import FastAPI

app = FastAPI()
batch_server = BatchInferenceServer(model, batch_size=32, max_wait_ms=100)

@app.post("/predict")
async def predict(features: List[float]):
    prediction = await batch_server.predict(features)
    return {"prediction": float(prediction)}
```

### Model Caching

```python
from functools import lru_cache
import hashlib
import json

class ModelCache:
    def __init__(self, max_size=10000):
        self.cache = {}
        self.max_size = max_size
        self.hits = 0
        self.misses = 0

    def _hash_input(self, input_data):
        """Generate cache key from input"""
        input_str = json.dumps(input_data, sort_keys=True)
        return hashlib.md5(input_str.encode()).hexdigest()

    def get(self, input_data):
        """Get cached prediction"""
        key = self._hash_input(input_data)
        if key in self.cache:
            self.hits += 1
            return self.cache[key]
        self.misses += 1
        return None

    def set(self, input_data, prediction):
        """Cache prediction"""
        key = self._hash_input(input_data)

        # Evict oldest if full (simple FIFO)
        if len(self.cache) >= self.max_size:
            self.cache.pop(next(iter(self.cache)))

        self.cache[key] = prediction

    def get_stats(self):
        """Cache statistics"""
        total = self.hits + self.misses
        hit_rate = self.hits / total if total > 0 else 0
        return {
            'hits': self.hits,
            'misses': self.misses,
            'hit_rate': hit_rate,
            'size': len(self.cache)
        }

# Usage
cache = ModelCache(max_size=10000)

@app.post("/predict")
async def predict(features: List[float]):
    # Check cache
    cached = cache.get(features)
    if cached is not None:
        return {"prediction": cached, "cached": True}

    # Compute prediction
    prediction = model.predict([features])[0]

    # Cache result
    cache.set(features, float(prediction))

    return {"prediction": float(prediction), "cached": False}
```

## Deployment Patterns

### Kubernetes Deployment

```yaml
# model-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ml-model-server
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ml-model
  template:
    metadata:
      labels:
        app: ml-model
        version: v2.1.0
    spec:
      containers:
        - name: model-server
          image: myregistry/ml-model:v2.1.0
          ports:
            - containerPort: 8080
          env:
            - name: MODEL_URI
              value: "s3://models/fraud-detector/v2.1.0"
            - name: BATCH_SIZE
              value: "32"
          resources:
            requests:
              memory: "2Gi"
              cpu: "1000m"
              nvidia.com/gpu: "1" # GPU if needed
            limits:
              memory: "4Gi"
              cpu: "2000m"
              nvidia.com/gpu: "1"
          livenessProbe:
            httpGet:
              path: /health
              port: 8080
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /ready
              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: ml-model-service
spec:
  selector:
    app: ml-model
  ports:
    - port: 80
      targetPort: 8080
  type: LoadBalancer
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ml-model-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ml-model-server
  minReplicas: 3
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
```

### Canary Deployment

```yaml
# Istio VirtualService for canary
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: ml-model-canary
spec:
  hosts:
    - ml-model-service
  http:
    - match:
        - headers:
            x-user-group:
              exact: beta-testers
      route:
        - destination:
            host: ml-model-service
            subset: v2
          weight: 100
    - route:
        - destination:
            host: ml-model-service
            subset: v1
          weight: 90 # 90% to stable
        - destination:
            host: ml-model-service
            subset: v2
          weight: 10 # 10% to canary
---
apiVersion: networking.istio.io/v1alpha3
kind: DestinationRule
metadata:
  name: ml-model-versions
spec:
  host: ml-model-service
  subsets:
    - name: v1
      labels:
        version: v1.0.0
    - name: v2
      labels:
        version: v2.0.0
```

## Best Practices

### ✅ DO

1. **Version models explicitly**

```python
# ✅ Clear versioning
model = mlflow.pyfunc.load_model("models:/fraud-detector/v2.1.0")
```

2. **Implement health checks**

```python
# ✅ Readiness and liveness
@app.get("/health")
def health():
    return {"status": "healthy", "model_version": "v2.1.0"}
```

3. **Monitor predictions**

```python
# ✅ Log predictions for analysis
log_prediction(input, output, latency, model_version)
```

4. **Use feature stores**

```python
# ✅ Consistent features
features = feature_store.get_online_features(entity_id)
prediction = model.predict(features)
```

### ❌ DON'T

1. **Don't deploy without versioning**

```python
# ❌ No version tracking
model = load_model("model.pkl")
```

2. **Don't skip input validation**

```python
# ❌ No validation
prediction = model.predict(user_input)  # Could crash

# ✅ Validate input
if not validate_input(user_input):
    raise HTTPException(400, "Invalid input")
```

3. **Don't ignore model staleness**

```python
# ❌ Model never updated
# Deploy once, forget

# ✅ Monitor and retrain
if drift_detected() or accuracy_dropped():
    trigger_retraining()
```

## Quick Reference

```python
# MLflow model registry
mlflow.sklearn.log_model(model, "model", registered_model_name="my-model")
client.transition_model_version_stage("my-model", version=5, stage="Production")

# Online serving with FastAPI
@app.post("/predict")
async def predict(features: List[float]):
    prediction = model.predict([features])
    return {"prediction": float(prediction[0])}

# Batch inference with Spark
predictions = spark_df.select(predict_udf(col("features")))

# Feature store (Feast)
features = store.get_online_features(
    features=["user_features:age", "user_features:ltv"],
    entity_rows=[{"user_id": "123"}]
)

# Model quantization (PyTorch)
model_quantized = torch.quantization.quantize_dynamic(
    model, {torch.nn.Linear}, dtype=torch.qint8
)
```

## Additional Resources

- [MLflow Model Registry](https://mlflow.org/docs/latest/model-registry.html)
- [TorchServe Documentation](https://pytorch.org/serve/)
- [TensorFlow Serving](https://www.tensorflow.org/tfx/guide/serving)
- [Feast Feature Store](https://docs.feast.dev/)
- [Seldon Core](https://docs.seldon.io/projects/seldon-core/)
- [KServe (KFServing)](https://kserve.github.io/website/)
- [Ray Serve](https://docs.ray.io/en/latest/serve/index.html)

---

**Related Skills**: [data-pipelines](../data-pipelines/SKILL.md) | [ml-monitoring](../ml-monitoring/SKILL.md) | [observability](../observability/SKILL.md) | [containers-kubernetes](../containers-kubernetes/SKILL.md)
