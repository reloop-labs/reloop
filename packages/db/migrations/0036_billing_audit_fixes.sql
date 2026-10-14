ALTER TYPE "public"."mailbox_status" ADD VALUE IF NOT EXISTS 'suspended';--> statement-breakpoint
ALTER TABLE "organization_subscription" ADD COLUMN IF NOT EXISTS "past_due_since" timestamp;
