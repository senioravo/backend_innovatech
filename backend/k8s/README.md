# Despliegue Kubernetes — Innovatech Backend

Stack: **api-gateway (KrakenD)** → **bff** → **ms-auth** | **ms-project-manager** | **ms-users**

## Estructura

```
backend/
├── k8s/                          # Recursos compartidos (namespace, ingress, kustomization)
│   ├── namespace.yaml
│   ├── ingress.yaml
│   ├── secrets.example.yaml      # Plantilla — no commitear secretos reales
│   ├── kustomization.yaml
│   └── README.md
├── api-gateway/k8s/
├── bff/k8s/
├── ms-auth/k8s/
├── ms-users/k8s/
└── ms-project-manager/k8s/
```

Cada microservicio incluye:
- `deployment.yaml`
- `service.yaml`
- `configmap.yaml` (o ConfigMap generado en api-gateway)
- `kustomization.yaml`

## Requisitos previos
## rancher desktop
- Cluster Kubernetes (minikube, kind, AKS, EKS, GKE, etc.) 
- `kubectl` y `kustomize` (incluido en kubectl ≥ 1.14)
- Ingress controller (p. ej. NGINX Ingress) si usas `ingress.yaml`
- Imágenes Docker construidas y publicadas en tu registry

## 1. Generar claves JWT (RSA)

```bash
cd ms-auth
node scripts/generate-keys.js
```

## 2. Construir imágenes Docker

Desde `backend/`:

```bash
docker build -t innovatech/ms-users:1.0.0 ./ms-users
docker build -t innovatech/ms-auth:1.0.0 ./ms-auth
docker build -t innovatech/ms-project-manager:1.0.0 ./ms-project-manager
docker build -t innovatech/bff:1.0.0 ./bff
```

Publica las imágenes en tu registry y actualiza los tags en cada `k8s/deployment.yaml` si usas otro nombre.

## 3. Crear secretos

**Base de datos y token interno** — copia `k8s/secrets.example.yaml` a `k8s/secrets.yaml`, rellena valores reales y aplica:

```bash
kubectl apply -f k8s/secrets.yaml
```

**Claves JWT:**

```bash
kubectl create secret generic innovatech-jwt-keys -n innovatech \
  --from-file=private.key=ms-auth/keys/private.key \
  --from-file=public.key=ms-auth/keys/public.key
```

## 4. Desplegar el stack

Desde `backend/`:

```bash
kubectl apply -k k8s/
```

Verificar:

```bash
kubectl get pods,svc,ingress -n innovatech
```

## 5. Acceso

- **Ingress** (si está configurado): `http://api.innovatech.local` — añade el host a `/etc/hosts` o tu DNS.
- **Port-forward** (desarrollo):

```bash
kubectl port-forward -n innovatech svc/api-gateway 8010:8080
```

API: `http://localhost:8010/api/v1/...`

## Servicios internos (DNS del cluster)

| Servicio            | Puerto | Uso                          |
|---------------------|--------|------------------------------|
| `ms-auth`           | 3001   | Autenticación, JWKS          |
| `ms-users`          | 3003   | Gestión de usuarios          |
| `ms-project-manager`| 3002   | Proyectos y tareas           |
| `bff`               | 3010   | Orquestación                 |
| `api-gateway`       | 8080   | Entrada HTTP pública         |

## Notas

- El BFF **no debe exponerse** directamente a Internet; solo vía `api-gateway`.
- `api-gateway/k8s/krakend.json` usa nombres de servicio Kubernetes (`bff`, `ms-auth`, `api-gateway`).
- Ajusta `ingress.yaml` (`host`, `ingressClassName`, TLS) según tu entorno.
