ALTER TABLE "organization_plan" ALTER COLUMN "monthly_emails" SET DEFAULT 6000;--> statement-breakpoint
ALTER TABLE "organization_credits" ALTER COLUMN "credits_remaining" SET DEFAULT 6000;--> statement-breakpoint
ALTER TABLE "organization_credits" ALTER COLUMN "monthly_credits" SET DEFAULT 6000;--> statement-breakpoint
UPDATE "organization_credits"
SET "monthly_credits" = 6000, "credits_remaining" = "credits_remaining" + 3000, "updated_at" = now()
WHERE "status" = 'active' AND "monthly_credits" = 3000 AND "organization_id" IN (
	SELECT "organization_id" FROM "organization_plan"
	WHERE "plan_id" IN ('free', 'payg') AND "monthly_emails" = 3000
);--> statement-breakpoint
UPDATE "organization_plan"
SET "monthly_emails" = 6000, "updated_at" = now()
WHERE "plan_id" IN ('free', 'payg') AND "monthly_emails" = 3000;--> statement-breakpoint
UPDATE "organization_plan"
SET "daily_email_limit" = 200, "updated_at" = now()
WHERE "plan_id" = 'free' AND "daily_email_limit" = 100;--> statement-breakpoint
ALTER TABLE "organization_plan" ALTER COLUMN "max_agent_inboxes" SET DEFAULT 3;--> statement-breakpoint
ALTER TABLE "organization_plan" ALTER COLUMN "max_webhooks" SET DEFAULT 3;--> statement-breakpoint
UPDATE "organization_plan"
SET "max_agent_inboxes" = 3, "updated_at" = now()
WHERE "plan_id" = 'free' AND "max_agent_inboxes" < 3;--> statement-breakpoint
UPDATE "organization_plan"
SET "max_webhooks" = 3, "updated_at" = now()
WHERE "plan_id" = 'free' AND "max_webhooks" < 3;
