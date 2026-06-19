-- Flyway V4: collaboration and notifications
CREATE TABLE IF NOT EXISTS "TASK_COMMENT" (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id     UUID NOT NULL REFERENCES "TASK" (id) ON DELETE CASCADE,
    user_id     TEXT NOT NULL,
    content     TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "TASK_ATTACHMENT" (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id         UUID NOT NULL REFERENCES "TASK" (id) ON DELETE CASCADE,
    user_id         TEXT NOT NULL,
    document_name   TEXT NOT NULL,
    document_url    TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "NOTIFICATION" (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     TEXT NOT NULL,
    type        VARCHAR(50) NOT NULL DEFAULT 'info',
    title       TEXT NOT NULL,
    message     TEXT NOT NULL,
    read        BOOLEAN NOT NULL DEFAULT false,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_task_comment_task ON "TASK_COMMENT" (task_id);
CREATE INDEX IF NOT EXISTS idx_task_attachment_task ON "TASK_ATTACHMENT" (task_id);
CREATE INDEX IF NOT EXISTS idx_notification_user ON "NOTIFICATION" (user_id, read);
