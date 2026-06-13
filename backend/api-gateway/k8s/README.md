Manifiestos Kubernetes del **API Gateway (KrakenD)**.

| Archivo | Descripción |
|---------|-------------|
| `krakend.json` | Config adaptada a DNS de K8s (`api-gateway`, `auth`, `bff`) |
| `deployment.yaml` | Pod KrakenD con ConfigMap montado |
| `service.yaml` | Service `api-gateway` — puerto 8010 → 8080 |

Despliegue centralizado: ver [../../k8s/README.md](../../k8s/README.md).
