ALTER TABLE "domain" ADD COLUMN IF NOT EXISTS "sending_blocked_source" text;--> statement-breakpoint
UPDATE "domain" SET "sending_blocked_source" = 'admin' WHERE "sending_blocked_at" IS NOT NULL AND "sending_blocked_source" IS NULL;
