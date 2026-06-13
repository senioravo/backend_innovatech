Manifiestos Kubernetes de **ms-project-manager**.

| Archivo | Descripción |
|---------|-------------|
| `deployment.yaml` | PM con clave pública JWT y conexión a BD |
| `service.yaml` | Service `project-manager` — puerto 3002 |
| `migration-job.yaml` | Job one-shot para aplicar SQL en `db/migrations/` |

Despliegue centralizado: ver [../../k8s/README.md](../../k8s/README.md).
