# Examples

## Inference Patterns

### Online Inference (FastAPI + MLflow)
```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import mlflow.pyfunc
import numpy as np

app = FastAPI()
model = None

@app.on_event("startup")
async def load_model():
    global model
    model = mlflow.pyfunc.load_model("models:/fraud-detector/production")

class Request(BaseModel):
    features: list

@app.post("/predict")
async def predict(req: Request):
    try:
        prediction = model.predict([req.features])
        return {"prediction": float(prediction[0])}
    except Exception as e:
        raise HTTPException(500, str(e))
```

### Batch Inference (Spark)
```python
from pyspark.sql.functions import pandas_udf
import mlflow.pyfunc
import pandas as pd

model = mlflow.pyfunc.load_model("models:/recommender/production")

@pandas_udf("double")
def predict_udf(features: pd.Series) -> pd.Series:
    return pd.Series(model.predict(features))

df.withColumn("prediction", predict_udf(df.features))\
  .write.parquet("s3://predictions/")
```

### Streaming Inference (Kafka)
```python
from kafka import KafkaConsumer, KafkaProducer
import json

consumer = KafkaConsumer('events', bootstrap_servers=['kafka:9092'])
producer = KafkaProducer(bootstrap_servers=['kafka:9092'])

for msg in consumer:
    event = json.loads(msg.value)
    prediction = model.predict([event['features']])
    producer.send('predictions', json.dumps({'pred': prediction[0]}).encode('utf-8'))
```

## A/B Testing

### Traffic Splitting
```python
def select_model(user_id):
    # Deterministic split based on user ID
    if hash(user_id) % 100 < 70: 
        return model_v1 # 70%
    return model_v2     # 30%
```

### Multi-Armed Bandit (Thompson Sampling)
```python
import numpy as np

class ThompsonSampling:
    def __init__(self):
        self.successes = {'v1': 1, 'v2': 1}
        self.failures = {'v1': 1, 'v2': 1}

    def select(self):
        samples = {
            v: np.random.beta(self.successes[v], self.failures[v])
            for v in self.successes
        }
        return max(samples, key=samples.get)
```

## Optimization

### Model Quantization (PyTorch)
```python
import torch

model = torch.load("model.pt")
model.qconfig = torch.quantization.get_default_qconfig('fbgemm')
torch.quantization.prepare(model, inplace=True)
# ... calibrate with data ...
torch.quantization.convert(model, inplace=True)
```

### Request Batching
```python
import asyncio
from collections import deque

class Batcher:
    def __init__(self, model, batch_size=32):
        self.queue = deque()
        self.batch_size = batch_size

    async def predict(self, features):
        future = asyncio.Future()
        self.queue.append((features, future))
        if len(self.queue) >= self.batch_size:
            self._process_batch()
        return await future

    def _process_batch(self):
        # Implementation to pop N items, run inference, and resolve futures
        pass
```

### Feature Store (Feast)
```python
from feast import FeatureStore

store = FeatureStore(repo_path=".")
features = store.get_online_features(
    features=["user:age", "user:clicks"],
    entity_rows=[{"user_id": "123"}]
).to_dict()
```
