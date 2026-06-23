# Flyway — ms-users

Migraciones de base de datos para PostgreSQL del servicio **users**.

## Local (Docker Compose)

Las migraciones se ejecutan automáticamente mediante el servicio `flyway-users` antes de que arranque `users`.

## Manual

```bash
docker run --rm \
  -v "$(pwd)/db/flyway:/flyway/sql" \
  flyway/flyway:10 \
  -url=jdbc:postgresql://localhost:5433/innovatech_users \
  -user=postgres -password=postgres \
  migrate
```

## Archivos

| Versión | Descripción |
|---------|-------------|
| V1 | Esquema base de `usuarios` |
| V2 | Columnas de perfil (skills, disponibilidad) |
| V3 | Usuarios demo (seed) |
