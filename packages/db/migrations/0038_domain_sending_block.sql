ALTER TABLE "domain" ADD COLUMN IF NOT EXISTS "sending_blocked_at" timestamp;--> statement-breakpoint
ALTER TABLE "domain" ADD COLUMN IF NOT EXISTS "sending_blocked_message" text;
