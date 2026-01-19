# Examples

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
      resources:
        requests:
          cpu: 100m
          memory: 128Mi
        limits:
          cpu: 500m
          memory: 512Mi
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
```

### ConfigMap and Secret

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: api-config
  namespace: production
data:
  LOG_LEVEL: info
  ENABLE_METRICS: "true"

---
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

### Deployment Template

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: { { include "api.fullname" . } }
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
          resources: { { - toYaml .Values.resources | nindent 10 } }
```

## Kustomize

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
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
bases:
  - ../../base
namespace: production
patchesStrategicMerge:
  - patch-replicas.yaml
images:
  - name: registry.example.com/api
    newTag: v1.0.0
```
