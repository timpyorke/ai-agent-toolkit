---
name: Containers & Kubernetes
description: Docker containerization, Kubernetes orchestration, and deployment patterns for scalable applications
---

# Containers & Kubernetes Skill

Build, deploy, and orchestrate containerized applications with Docker and Kubernetes.

## Docker

### Dockerfile Best Practices

```dockerfile
# Multi-stage build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
# Non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
# Copy only production files
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./
USER nodejs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js
CMD ["node", "dist/main.js"]
```

### Layer Caching

```dockerfile
# ❌ Bad: Changes to code invalidate dependency layer
COPY . .
RUN npm install

# ✅ Good: Dependencies cached separately
COPY package*.json ./
RUN npm ci --only=production
COPY . .
```

### .dockerignore

```
node_modules
npm-debug.log
.git
.env
.vscode
*.md
dist
coverage
.dockerignore
Dockerfile
```

### Build and Push

```bash
# Build with tag
docker build -t myapp:v1.0.0 .

# Tag for registry
docker tag myapp:v1.0.0 registry.example.com/myapp:v1.0.0

# Push to registry
docker push registry.example.com/myapp:v1.0.0

# Multi-platform build
docker buildx build --platform linux/amd64,linux/arm64 \
  -t myapp:v1.0.0 --push .
```

## Kubernetes Resources

### Pod

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: api-pod
  labels:
    app: api
    version: v1
spec:
  containers:
    - name: api
      image: registry.example.com/api:v1.0.0
      ports:
        - containerPort: 8080
          name: http
      env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
      resources:
        requests:
          cpu: 100m
          memory: 128Mi
        limits:
          cpu: 500m
          memory: 512Mi
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
```

### Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
  namespace: production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
        version: v1
    spec:
      containers:
        - name: api
          image: registry.example.com/api:v1.0.0
          ports:
            - containerPort: 8080
          envFrom:
            - configMapRef:
                name: api-config
            - secretRef:
                name: api-secrets
          resources:
            requests:
              cpu: 200m
              memory: 256Mi
            limits:
              cpu: 1000m
              memory: 1Gi
          livenessProbe:
            httpGet:
              path: /health
              port: 8080
            initialDelaySeconds: 30
            periodSeconds: 10
            failureThreshold: 3
          readinessProbe:
            httpGet:
              path: /ready
              port: 8080
            initialDelaySeconds: 10
            periodSeconds: 5
            failureThreshold: 3
          startupProbe:
            httpGet:
              path: /health
              port: 8080
            initialDelaySeconds: 0
            periodSeconds: 5
            failureThreshold: 30
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
```

### Service

```yaml
# ClusterIP (internal)
apiVersion: v1
kind: Service
metadata:
  name: api
  namespace: production
spec:
  type: ClusterIP
  selector:
    app: api
  ports:
    - port: 80
      targetPort: 8080
      name: http

---
# NodePort (external)
apiVersion: v1
kind: Service
metadata:
  name: api-external
spec:
  type: NodePort
  selector:
    app: api
  ports:
    - port: 80
      targetPort: 8080
      nodePort: 30080

---
# LoadBalancer (cloud)
apiVersion: v1
kind: Service
metadata:
  name: api-lb
spec:
  type: LoadBalancer
  selector:
    app: api
  ports:
    - port: 80
      targetPort: 8080
```

### Ingress

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-ingress
  namespace: production
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/rate-limit: "100"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - api.example.com
      secretName: api-tls
  rules:
    - host: api.example.com
      http:
        paths:
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: api
                port:
                  number: 80
          - path: /admin
            pathType: Prefix
            backend:
              service:
                name: admin
                port:
                  number: 80
```

## ConfigMaps and Secrets

### ConfigMap

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: api-config
  namespace: production
data:
  LOG_LEVEL: info
  ENABLE_METRICS: "true"
  config.json: |
    {
      "timeout": 30,
      "retries": 3
    }
```

### Secret

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: api-secrets
  namespace: production
type: Opaque
stringData:
  DATABASE_URL: postgres://user:pass@host:5432/db
  API_KEY: secret-key-here
```

### Using ConfigMaps and Secrets

```yaml
spec:
  containers:
    - name: api
      # As environment variables
      env:
        - name: LOG_LEVEL
          valueFrom:
            configMapKeyRef:
              name: api-config
              key: LOG_LEVEL
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: api-secrets
              key: DATABASE_URL
      # As volume mounts
      volumeMounts:
        - name: config
          mountPath: /etc/config
        - name: secrets
          mountPath: /etc/secrets
          readOnly: true
  volumes:
    - name: config
      configMap:
        name: api-config
    - name: secrets
      secret:
        secretName: api-secrets
```

## Resource Management

### Requests and Limits

```yaml
resources:
  requests:
    # Guaranteed resources for scheduling
    cpu: 250m # 0.25 CPU cores
    memory: 512Mi # 512 MiB RAM
  limits:
    # Maximum resources allowed
    cpu: 1000m # 1 CPU core
    memory: 1Gi # 1 GiB RAM
```

### Horizontal Pod Autoscaler

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-hpa
  namespace: production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api
  minReplicas: 3
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
        - type: Percent
          value: 50
          periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
        - type: Percent
          value: 100
          periodSeconds: 15
        - type: Pods
          value: 4
          periodSeconds: 15
      selectPolicy: Max
```

## Health Checks

### Probe Types

```yaml
livenessProbe:
  # HTTP check
  httpGet:
    path: /health
    port: 8080
    httpHeaders:
      - name: X-Health-Check
        value: liveness
  initialDelaySeconds: 30
  periodSeconds: 10
  timeoutSeconds: 3
  failureThreshold: 3

readinessProbe:
  # TCP check
  tcpSocket:
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 5

startupProbe:
  # Exec command
  exec:
    command:
      - cat
      - /tmp/healthy
  initialDelaySeconds: 0
  periodSeconds: 5
  failureThreshold: 30
```

## Helm

### Chart Structure

```
mychart/
├── Chart.yaml
├── values.yaml
├── templates/
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   └── _helpers.tpl
└── charts/
```

### Chart.yaml

```yaml
apiVersion: v2
name: api
description: API service Helm chart
type: application
version: 1.0.0
appVersion: "1.0.0"
dependencies:
  - name: postgresql
    version: "12.x.x"
    repository: https://charts.bitnami.com/bitnami
```

### values.yaml

```yaml
replicaCount: 3

image:
  repository: registry.example.com/api
  tag: v1.0.0
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 80

ingress:
  enabled: true
  className: nginx
  hosts:
    - host: api.example.com
      paths:
        - path: /
          pathType: Prefix

resources:
  requests:
    cpu: 200m
    memory: 256Mi
  limits:
    cpu: 1000m
    memory: 1Gi

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70
```

### Template with Values

```yaml
# templates/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: { { include "api.fullname" . } }
  labels: { { - include "api.labels" . | nindent 4 } }
spec:
  replicas: { { .Values.replicaCount } }
  selector:
    matchLabels: { { - include "api.selectorLabels" . | nindent 6 } }
  template:
    metadata:
      labels: { { - include "api.selectorLabels" . | nindent 8 } }
    spec:
      containers:
        - name: { { .Chart.Name } }
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag | default .Chart.AppVersion }}"
          imagePullPolicy: { { .Values.image.pullPolicy } }
          ports:
            - containerPort: 8080
          resources: { { - toYaml .Values.resources | nindent 10 } }
```

### Helm Commands

```bash
# Install chart
helm install api ./mychart -n production

# Upgrade with values
helm upgrade api ./mychart -f values-prod.yaml

# Rollback
helm rollback api 1

# List releases
helm list -n production

# Uninstall
helm uninstall api -n production
```

## Kustomize

### Base and Overlays

```
k8s/
├── base/
│   ├── kustomization.yaml
│   ├── deployment.yaml
│   └── service.yaml
└── overlays/
    ├── dev/
    │   ├── kustomization.yaml
    │   └── patch-replicas.yaml
    └── prod/
        ├── kustomization.yaml
        ├── patch-replicas.yaml
        └── patch-resources.yaml
```

### Base kustomization.yaml

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
  - deployment.yaml
  - service.yaml

commonLabels:
  app: api

namespace: production
```

### Overlay kustomization.yaml

```yaml
# overlays/prod/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

bases:
  - ../../base

namespace: production

patchesStrategicMerge:
  - patch-replicas.yaml
  - patch-resources.yaml

images:
  - name: registry.example.com/api
    newTag: v1.0.0
```

### Patches

```yaml
# overlays/prod/patch-replicas.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 5
```

### Apply with Kustomize

```bash
# Build and preview
kubectl kustomize overlays/prod

# Apply
kubectl apply -k overlays/prod

# Diff before apply
kubectl diff -k overlays/prod
```

## Quick Reference

**Docker commands:**

```bash
docker build -t app:v1 .
docker run -p 8080:8080 app:v1
docker logs container-id
docker exec -it container-id sh
```

**kubectl commands:**

```bash
kubectl get pods -n production
kubectl describe pod pod-name
kubectl logs pod-name -f
kubectl exec -it pod-name -- sh
kubectl port-forward pod-name 8080:8080
kubectl apply -f deployment.yaml
kubectl rollout status deployment/api
kubectl rollout undo deployment/api
```

**Debugging:**

```bash
kubectl get events --sort-by=.metadata.creationTimestamp
kubectl top pods
kubectl describe node node-name
```

## Resources

- Docker Docs — https://docs.docker.com/
- Kubernetes Docs — https://kubernetes.io/docs/
- Helm — https://helm.sh/docs/
- Kustomize — https://kustomize.io/
