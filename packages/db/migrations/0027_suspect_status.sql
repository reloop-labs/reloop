ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "is_suspect" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "suspect_reason" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "suspect_severity" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "suspect_category" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "suspect_updated_at" timestamp;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_isSuspect_idx" ON "user" USING btree ("is_suspect");--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN IF NOT EXISTS "is_suspect" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN IF NOT EXISTS "suspect_reason" text;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN IF NOT EXISTS "suspect_severity" text;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN IF NOT EXISTS "suspect_category" text;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN IF NOT EXISTS "suspect_updated_at" timestamp;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "organization_isSuspect_idx" ON "organization" USING btree ("is_suspect");
