CREATE TYPE "public"."email_send_source" AS ENUM('transactional', 'campaign', 'automation', 'smtp');--> statement-breakpoint
ALTER TABLE "email_log" ADD COLUMN "source" "email_send_source" DEFAULT 'transactional' NOT NULL;--> statement-breakpoint
ALTER TABLE "email_log" ADD COLUMN "tags" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
UPDATE "email_log" AS el
SET "source" = 'campaign'
FROM "campaign_recipient" AS cr
WHERE cr."email_log_id" = el."id";--> statement-breakpoint
UPDATE "email_log" AS el
SET "source" = 'automation'
FROM "automation_step_run" AS sr
WHERE sr."email_log_id" = el."id" AND el."source" = 'transactional';
