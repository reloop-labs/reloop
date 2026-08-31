ALTER TABLE "automation_enrollment" ADD COLUMN "context" jsonb DEFAULT '{}'::jsonb NOT NULL;
