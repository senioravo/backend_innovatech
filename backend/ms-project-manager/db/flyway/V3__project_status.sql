-- Flyway V3: project lifecycle status
ALTER TABLE "PROJECT" ADD COLUMN IF NOT EXISTS status TEXT;

UPDATE "PROJECT"
SET status = 'active'
WHERE status IS NULL;

ALTER TABLE "PROJECT" ALTER COLUMN status SET DEFAULT 'active';
ALTER TABLE "PROJECT" ALTER COLUMN status SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_project_status') THEN
    ALTER TABLE "PROJECT"
      ADD CONSTRAINT chk_project_status
      CHECK (status IN ('active', 'terminated'));
  END IF;
END $$;
