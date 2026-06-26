# Despliegue Kubernetes — Innovatech Backend

Stack: **api-gateway (KrakenD)** → **bff** → **ms-auth** | **ms-project-manager** | **ms-users** | **ms-kpi**

## Estructura

```
backend/
├── kustomization.yaml            # Punto de entrada (Flyway SQL ConfigMaps + stack)
├── scripts/k8s-dev-up.ps1        # Despliegue dev todo-en-K8s (Windows)
├── k8s/                          # Recursos compartidos (namespace, ingress, postgres)
│   ├── namespace.yaml
│   ├── ingress.yaml
│   ├── postgres/                 # PostgreSQL + jobs Flyway
│   ├── secrets.example.yaml      # Plantilla — no commitear secretos reales
│   ├── secrets.local.yaml        # Secretos dev (BD in-cluster)
│   ├── kustomization.yaml
│   └── README.md
├── api-gateway/k8s/
├── bff/k8s/
├── ms-auth/k8s/
├── ms-users/k8s/
├── ms-project-manager/k8s/
└── ms-kpi/k8s/
```

Cada microservicio incluye:
- `deployment.yaml`
- `service.yaml`
- `configmap.yaml` (o ConfigMap generado en api-gateway)
- `kustomization.yaml`

Los jobs **Flyway** viven en `k8s/postgres/` (no en `ms-*/k8s/kustomization.yaml`) para evitar duplicados. Los SQL se empaquetan desde `backend/kustomization.yaml`.

---

## Desarrollo local — todo en Kubernetes (sin Docker Compose para BD)

**Requisitos:** cluster K8s (Rancher Desktop, minikube, kind, …), `kubectl`, imágenes Docker construidas localmente.

### Opción rápida (PowerShell)

Desde `backend/`:

```powershell
.\scripts\k8s-dev-up.ps1
```

El script:
1. Aplica `k8s/secrets.local.yaml` (URLs `users-db:5432` / `pm-db:5432`)
2. Genera claves JWT si faltan (`ms-auth/scripts/generate-keys.js`)
3. Crea/actualiza el secret `innovatech-jwt-keys`
4. Ejecuta `kubectl apply -k .` (stack completo + ConfigMaps Flyway)
5. Espera a que terminen los jobs `ms-users-flyway` y `ms-project-manager-flyway`

### Opción manual

```powershell
cd backend

# 1. Secretos de BD (in-cluster)
kubectl apply -f k8s/secrets.local.yaml

# 2. Claves JWT (una vez)
cd ms-auth && node scripts/generate-keys.js && cd ..
kubectl create secret generic innovatech-jwt-keys -n innovatech `
  --from-file=private.key=ms-auth/keys/private.key `
  --from-file=public.key=ms-auth/keys/public.key `
  --dry-run=client -o yaml | kubectl apply -f -

# 3. Construir imágenes (si aún no existen en el cluster local)
docker build -t innovatech/ms-users:1.0.0 ./ms-users
docker build -t innovatech/ms-auth:1.0.0 ./ms-auth
docker build -t innovatech/ms-project-manager:1.0.0 ./ms-project-manager
docker build -t innovatech/ms-kpi:1.0.0 ./ms-kpi
docker build -t innovatech/bff:1.0.0 ./bff
docker build -t innovatech/api-gateway:1.0.0 ./api-gateway

# 4. Desplegar stack completo (usar backend/, no solo k8s/)
kubectl apply -k .

# 5. Esperar migraciones
kubectl wait --for=condition=complete job/ms-users-flyway -n innovatech --timeout=300s
kubectl wait --for=condition=complete job/ms-project-manager-flyway -n innovatech --timeout=300s
```

Validar manifiestos sin aplicar:

```powershell
kubectl kustomize .
kubectl kustomize k8s/          # solo infra + microservicios (sin ConfigMaps Flyway)
```

> **Nota:** `kubectl kustomize k8s/` funciona para revisar recursos K8s, pero los ConfigMaps de SQL Flyway se generan solo desde `backend/kustomization.yaml`. Para desplegar con migraciones, usa siempre `kubectl apply -k .` desde `backend/`.

Verificar:

```powershell
kubectl get pods,svc,ingress,jobs -n innovatech
```

Si Flyway falla y necesitas reintentar:

```powershell
kubectl delete job ms-users-flyway ms-project-manager-flyway -n innovatech
kubectl apply -k .
```

Acceso API (port-forward):

```powershell
kubectl port-forward -n innovatech svc/api-gateway 8010:8080
```

API: `http://localhost:8010/api/v1/...`

---

## Producción / BD externa

### Requisitos previos

- Cluster Kubernetes (AKS, EKS, GKE, etc.)
- `kubectl` y `kustomize` (incluido en kubectl ≥ 1.14)
- Ingress controller (p. ej. NGINX Ingress) si usas `ingress.yaml`
- Imágenes Docker publicadas en tu registry

### 1. Generar claves JWT (RSA)

```bash
cd ms-auth
node scripts/generate-keys.js
```

### 2. Construir y publicar imágenes Docker

Desde `backend/`:

```bash
docker build -t innovatech/ms-users:1.0.0 ./ms-users
docker build -t innovatech/ms-auth:1.0.0 ./ms-auth
docker build -t innovatech/ms-project-manager:1.0.0 ./ms-project-manager
docker build -t innovatech/bff:1.0.0 ./bff
```

Publica las imágenes en tu registry y actualiza los tags en cada `k8s/deployment.yaml` si usas otro nombre.

### 3. Crear secretos

Copia `k8s/secrets.example.yaml` a `k8s/secrets.yaml`, rellena URLs de BD externa y aplica:

```bash
kubectl apply -f k8s/secrets.yaml
```

**Claves JWT:**

```bash
kubectl create secret generic innovatech-jwt-keys -n innovatech \
  --from-file=private.key=ms-auth/keys/private.key \
  --from-file=public.key=ms-auth/keys/public.key
```

### 4. Desplegar el stack

Desde `backend/`:

```bash
kubectl apply -k .
```

---

## Acceso

- **Ingress** (si está configurado): `http://api.innovatech.local` — añade el host a `/etc/hosts` o tu DNS.
- **Port-forward** (desarrollo): ver sección dev arriba.

## Servicios internos (DNS del cluster)

| Servicio            | Puerto | Uso                          |
|---------------------|--------|------------------------------|
| `ms-auth`           | 3001   | Autenticación, JWKS          |
| `ms-users`          | 3003   | Gestión de usuarios          |
| `ms-project-manager`| 3002   | Proyectos y tareas           |
| `bff`               | 3010   | Orquestación                 |
| `api-gateway`       | 8080   | Entrada HTTP pública         |
| `users-db`          | 5432   | PostgreSQL usuarios          |
| `pm-db`             | 5432   | PostgreSQL project-manager   |

## Notas

- El BFF **no debe exponerse** directamente a Internet; solo vía `api-gateway`.
- `api-gateway/k8s/krakend.json` usa nombres de servicio Kubernetes (`bff`, `ms-auth`, `api-gateway`).
- Ajusta `ingress.yaml` (`host`, `ingressClassName`, TLS) según tu entorno.
- Rancher Desktop incluye un cluster Kubernetes local listo para este flujo dev.
