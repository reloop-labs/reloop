DROP TABLE "credit_ledger" CASCADE;--> statement-breakpoint
DROP TABLE "email_send" CASCADE;--> statement-breakpoint
DROP TABLE "organization_credits" CASCADE;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "credits_remaining" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "monthly_credits" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "plan_code" text DEFAULT 'free';--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "subscription_status" text DEFAULT 'trialing';--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "current_period_end" timestamp;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "lago_subscription_id" text;--> statement-breakpoint
ALTER TABLE "mailbox" DROP COLUMN "description";--> statement-breakpoint
DROP TYPE "public"."billing_cycle";--> statement-breakpoint
DROP TYPE "public"."email_send_status";--> statement-breakpoint
DROP TYPE "public"."invoice_status";--> statement-breakpoint
DROP TYPE "public"."ledger_entry_type";--> statement-breakpoint
DROP TYPE "public"."skip_reason";--> statement-breakpoint
DROP TYPE "public"."subscription_status";