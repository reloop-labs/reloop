ALTER TYPE "public"."plan_id" ADD VALUE IF NOT EXISTS 'payg';--> statement-breakpoint
ALTER TYPE "public"."ledger_entry_type" ADD VALUE IF NOT EXISTS 'credit_expired';--> statement-breakpoint
ALTER TABLE "organization_credits" ADD COLUMN IF NOT EXISTS "prepaid_credits" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "organization_credits" ADD COLUMN IF NOT EXISTS "prepaid_expires_at" timestamp;
