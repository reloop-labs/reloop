DROP TABLE "session" CASCADE;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "active_organization_id" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "mode" text DEFAULT 'dev';