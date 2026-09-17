ALTER TABLE "organization_credits" ADD COLUMN "daily_emails_used" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "organization_credits" ADD COLUMN "daily_window_start" timestamp DEFAULT now() NOT NULL;
