# Flyway — ms-project-manager

Migraciones de base de datos para PostgreSQL del servicio **project manager**.

## Local (Docker Compose)

Las migraciones se ejecutan automáticamente mediante el servicio `flyway-pm` antes de que arranque `project-manager`.

## Manual

```bash
docker run --rm \
  -v "$(pwd)/db/flyway:/flyway/sql" \
  flyway/flyway:10 \
  -url=jdbc:postgresql://localhost:5434/innovatech_pm \
  -user=postgres -password=postgres \
  migrate
```

## Archivos

| Versión | Descripción |
|---------|-------------|
| V1 | Tablas PROJECT y TASK |
| V2 | Flujo de estados de tareas |
| V3 | Ciclo de vida del proyecto |
| V4 | Comentarios, adjuntos, notificaciones |
