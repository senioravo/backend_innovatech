# Flyway — ms-users

Database migrations for the **users** PostgreSQL database.

## Local (Docker Compose)

Migrations run automatically via the `flyway-users` service before `users` starts.

## Manual

```bash
docker run --rm \
  -v "$(pwd)/db/flyway:/flyway/sql" \
  flyway/flyway:10 \
  -url=jdbc:postgresql://localhost:5433/innovatech_users \
  -user=postgres -password=postgres \
  migrate
```

## Files

| Version | Description |
|---------|-------------|
| V1 | Core `usuarios` schema |
| V2 | Profile columns (skills, availability) |
| V3 | Demo seed users |
