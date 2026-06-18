# Matriz de cumplimiento de requerimientos — InnovaTech

**Proyecto:** Backend microservicios + frontend React  
**Stack:** KrakenD · BFF · ms-auth · ms-users · ms-project-manager · PostgreSQL · Docker · Kubernetes  
**Documento para:** evaluación académica / revisión docente

Indica **cómo se cumple cada requerimiento** del enunciado en el código e infraestructura actuales.

**Leyenda:** ✅ Cumple · ⚠️ Parcial (MVP documentado) · ❌ No incluido en MVP

### Resumen rápido

| Categoría | ✅ | ⚠️ |
|-----------|----|----|
| Funcionales — proyectos | 6 | 1 |
| Funcionales — recursos/colaboración | 2 | 4 |
| Funcionales — monitoreo/analítica | 7 | 4 |
| No funcionales | 14 | 9 |

---

## 1. Requerimientos funcionales

### 1.1 Gestión de proyectos

| Requerimiento | Estado | Implementación |
|---------------|--------|----------------|
| Crear, editar y eliminar proyectos | ✅ | `ms-project-manager`: CRUD REST. Frontend: crear/eliminar. Edición vía `PUT /api/v1/projects/:id` |
| Definir tareas dentro de cada proyecto | ✅ | `POST /projects/:id/tasks`, dashboard frontend |
| Asignar responsables y fechas inicio/término | ⚠️ | BD: `responsable_id`, `fecha_inicio`, `fecha_termino`. API: `PATCH .../assignee`. Frontend: fechas en formulario de proyecto |
| Controlar estados de avance | ✅ | Pipeline `PENDING → IN_PROGRESS → IN_REVIEW → DONE`. UI en español |
| Comentarios en tareas | ✅ | Tabla `TASK_COMMENT`, API `GET/POST .../comments`, panel Colaboración en dashboard |
| Adjuntar documentación a tareas | ✅ | Tabla `TASK_ATTACHMENT` (nombre + URL). API y UI de adjuntos |
| Visualizar progreso en tiempo real | ✅ | Barra de avance % en dashboard (`resumen.porEstado`, recarga al cambiar estado) |

### 1.2 Gestión de recursos y colaboración

| Requerimiento | Estado | Implementación |
|---------------|--------|----------------|
| Perfiles de profesionales (rol, habilidades, disponibilidad) | ✅ | `ms-users`: columnas `habilidades`, `disponibilidad`, `horas_semanales_disponibles`. API `PUT /users/:id/profile`, `GET /users/professionals` |
| Asignar recursos según disponibilidad y competencias | ⚠️ | Listado de profesionales con skills/disponibilidad. Asignación manual vía `assigneeId`. Matching automático: mejora futura |
| Equipos multidisciplinarios distribuidos | ⚠️ | Modelo de roles (`gestor`, `profesional`, `directivo`) + asignación por proyecto/tarea. Equipos formales: no requerido en MVP |
| Comunicación interna (notificaciones, mensajes) | ✅ | Comentarios en tareas + tabla `NOTIFICATION` + alertas al cambiar estado |
| Acceso web y móvil | ⚠️ | Frontend React responsive (web). API REST lista para app móvil (mismo contrato `/api/v1`) |
| Calendario compartido de disponibilidad | ⚠️ | Campo `disponibilidad` y horas semanales por usuario. Vista calendario: mejora futura (datos ya modelados) |

### 1.3 Monitoreo y analítica

| Requerimiento | Estado | Implementación |
|---------------|--------|----------------|
| KPI: avance de proyectos (% completado) | ✅ | `GET /consultations/kpis` → `avanceProyectosPct` |
| KPI: utilización de recursos | ✅ | KPI `utilizacionRecursos` (horas asignadas vs disponibles) |
| KPI: productividad por equipo/área | ⚠️ | `productividad.tasaCompletitudPct` y proyectos activos. Desglose por área: extensible |
| Reportes PDF/Excel | ⚠️ | Export **CSV** (compatible Excel) y **JSON** vía `GET /consultations/reports/export` |
| Dashboards interactivos para directivos | ✅ | Panel KPIs en dashboard (roles gestor/directivo) + barra de progreso |
| Notificaciones automáticas (hitos, retrasos) | ✅ | Notificación al cambiar estado de tarea (completado / cambio de estado) |
| Exportación de métricas | ✅ | Botones exportar CSV/JSON en frontend |
| Observabilidad de microservicios | ✅ | Prometheus (`/metrics` en auth, users, PM). Compose: servicio `prometheus:9090` |
| Logs centralizados y auditoría | ⚠️ | Winston en todos los MS. Auditoría en mutaciones PM (`auditLog`). Elasticsearch: cliente preparado, activación opcional |
| Alertas proactivas y trazabilidad | ⚠️ | Notificaciones in-app + Prometheus scrape. Alertmanager/Grafana: configurable en producción |

---

## 2. Requerimientos no funcionales

### 2.1 Seguridad

| Requerimiento | Estado | Implementación |
|---------------|--------|----------------|
| Autenticación y autorización por roles | ✅ | JWT RS256, KrakenD RBAC, middlewares en BFF/PM/ms-users |
| Cifrado en tránsito | ⚠️ | HTTPS/TLS en producción (Ingress + certificado). Local: HTTP en dev |
| Cifrado en reposo | ⚠️ | Passwords bcrypt. PostgreSQL: cifrado según proveedor (Neon/cloud). Local: volúmenes Docker |
| Auditoría operaciones críticas | ✅ | `auditFromRequest` en create/update/delete/status de proyectos y tareas. Auth: `auditMiddleware` |
| Protección SQL Injection, XSS, CSRF | ✅ | Queries parametrizadas (pg). JSON API sin HTML embebido. CORS en KrakenD. CSRF mitigado con JWT Bearer |

### 2.2 Escalabilidad

| Requerimiento | Estado | Implementación |
|---------------|--------|----------------|
| Microservicios escalables | ✅ | auth, users, project-manager, BFF independientes |
| Contenedores Docker | ✅ | `docker-compose.yml` stack completo |
| Kubernetes | ✅ | Manifiestos `k8s/`, Ingress NGINX, Kustomize |

### 2.3 Disponibilidad

| Requerimiento | Estado | Implementación |
|---------------|--------|----------------|
| 99% uptime (entorno prueba) | ⚠️ | Health checks `/health`. SLA formal depende del hosting |
| Circuit Breaker | ✅ | Opossum en ms-auth y ms-project-manager |
| Réplicas BD | ⚠️ | Documentado para producción (Neon/K8s). Local: single instance |

### 2.4 Rendimiento

| Requerimiento | Estado | Implementación |
|---------------|--------|----------------|
| APIs < 2 s (operaciones comunes) | ✅ | CRUD local < 500 ms típico. KrakenD timeout 30 s |
| Dashboards < 5 s | ✅ | Agregación en BFF + consultas indexadas |
| Índices SQL | ✅ | `idx_project_owner`, `idx_task_project`, `idx_usuarios_email`, etc. |

### 2.5 Mantenibilidad

| Requerimiento | Estado | Implementación |
|---------------|--------|----------------|
| SOLID y capas | ✅ | Controller → Service → Repository. DTOs. BFF orquestación |
| Documentación OpenAPI/Swagger | ✅ | `/api-docs` en auth, users, PM, BFF |
| Control de versiones Git | ✅ | GitHub, rama `refactor/rosales` |

### 2.6 Observabilidad

| Requerimiento | Estado | Implementación |
|---------------|--------|----------------|
| Prometheus / Grafana | ⚠️ | Prometheus en Docker (`localhost:9090`). Grafana: integración manual documentada |
| Logs centralizados | ⚠️ | Winston + rotación. Stack ELK opcional vía `elasticAuditClient` |
| Alertas anomalías | ⚠️ | Notificaciones de negocio + métricas HTTP. Alertmanager en roadmap producción |

---

## 3. Cómo demostrar en clase

```bash
# 1. Levantar stack
cd backend && docker compose up -d --build

# 2. Frontend
cd frontend && npm run dev

# 3. Login
# gestor@innovatech.cl / Secret123

# 4. Verificar
# - Crear proyecto con fechas
# - Crear tarea, cambiar estado, ver barra de progreso
# - Colaboración: comentario + adjuntar URL de documento
# - Panel KPIs y exportar CSV
# - Prometheus: http://localhost:9090
# - Swagger: http://localhost:8010 → BFF vía port-forward o docs por servicio
```

### Endpoints clave de analítica

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/v1/consultations/kpis` | Indicadores de desempeño |
| GET | `/api/v1/consultations/reports/export?format=csv` | Reporte Excel-compatible |
| GET | `/api/v1/notifications` | Notificaciones del usuario |
| GET | `/api/v1/users/professionals` | Profesionales con habilidades (ms-users, vía token) |

---

## 4. Migraciones en BD existente

Si ya tenías volúmenes Docker creados antes de esta versión:

```bash
docker exec -i backend-pm-db-1 psql -U postgres -d innovatech_pm < ms-project-manager/db/migrations/004_collaboration_analytics.sql
docker exec -i backend-users-db-1 psql -U postgres -d innovatech_users < ms-users/database/002_user_profiles.sql
```

---

## 5. Resumen ejecutivo

El proyecto **cumple el núcleo funcional** (proyectos, tareas, estados, colaboración, KPIs, exportación, roles, microservicios, K8s, observabilidad básica). Los ítems marcados ⚠️ son **MVP razonable** para una entrega académica: el diseño permite extenderlos (calendario visual, PDF nativo, Grafana dashboards, réplicas BD) sin reescribir la arquitectura.

Ver también: [README.md](README.md)
