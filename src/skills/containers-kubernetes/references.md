# Reference Material

## Core Principles

- **Immutability**: Containers should be immutable; rebuild for changes.
- **Microservices**: One process per container (usually).
- **Declarative Configuration**: Define desired state in YAML/JSON.

## Command Reference

### Docker Commands
```bash
docker build -t app:v1 .
docker run -p 8080:8080 app:v1
docker logs container-id
docker exec -it container-id sh
docker push registry.example.com/app:v1
```

### kubectl Commands
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

### Helm Commands
```bash
helm install api ./mychart -n production
helm upgrade api ./mychart -f values-prod.yaml
helm rollback api 1
helm list -n production
helm uninstall api -n production
```

## Resource Management Guide

### Requests vs Limits
- **Requests**: Guaranteed resources for scheduling.
- **Limits**: Maximum resources allowed.

### Recommendations
- Always set requests and limits.
- Keep CPU request close to usage to avoid throttle or waste.
- Set Memory limit equal to Memory request for guaranteed QoS (in some contexts) or higher for burstable.
- Use HPA for autoscaling based on CPU/Memory metrics.

## Best Practices

- Use multi-stage builds to keep images small.
- Run as non-root user for security.
- Health checks (Liveness/Readiness probes) are mandatory for production.
- Use ConfigMaps and Secrets for configuration decoupling.
- Tag images with specific versions (not just `latest`).
