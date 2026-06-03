-- Neon / PostgreSQL 15+. Tablas en mayúsculas (identificadores entre comillas).

CREATE TABLE IF NOT EXISTS "PROJECT" (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_user_id   TEXT NOT NULL,
    name            TEXT NOT NULL,
    description     TEXT NOT NULL,
    responsable_id  TEXT NULL,
    fecha_inicio    DATE NULL,
    fecha_termino   DATE NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_project_fechas
        CHECK (
            fecha_inicio IS NULL
            OR fecha_termino IS NULL
            OR fecha_termino >= fecha_inicio
        )
);

CREATE TABLE IF NOT EXISTS "TASK" (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id      UUID NOT NULL REFERENCES "PROJECT" (id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    description     TEXT NOT NULL DEFAULT '',
    completed       BOOLEAN NOT NULL DEFAULT false,
    responsable_id  TEXT NULL,
    fecha_inicio    DATE NULL,
    fecha_termino   DATE NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_task_fechas
        CHECK (
            fecha_inicio IS NULL
            OR fecha_termino IS NULL
            OR fecha_termino >= fecha_inicio
        )
);

CREATE INDEX IF NOT EXISTS idx_project_owner ON "PROJECT" (owner_user_id);
CREATE INDEX IF NOT EXISTS idx_task_project ON "TASK" (project_id);

-- updated_at lo actualiza la aplicación en cada UPDATE (evita diferencias de sintaxis de triggers entre versiones).
