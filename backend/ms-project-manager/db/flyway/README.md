# Flyway — ms-project-manager

Database migrations for the **project manager** PostgreSQL database.

## Local (Docker Compose)

Migrations run automatically via the `flyway-pm` service before `project-manager` starts.

## Manual

```bash
docker run --rm \
  -v "$(pwd)/db/flyway:/flyway/sql" \
  flyway/flyway:10 \
  -url=jdbc:postgresql://localhost:5434/innovatech_pm \
  -user=postgres -password=postgres \
  migrate
```

## Files

| Version | Description |
|---------|-------------|
| V1 | PROJECT and TASK tables |
| V2 | Task status workflow |
| V3 | Project lifecycle status |
| V4 | Comments, attachments, notifications |
