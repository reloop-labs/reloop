CREATE TYPE "public"."plan_id" AS ENUM('free', 'individual', 'startup', 'enterprise');--> statement-breakpoint
CREATE TABLE "organization_plan" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"plan_id" "plan_id" DEFAULT 'free' NOT NULL,
	"monthly_emails" integer DEFAULT 3000 NOT NULL,
	"daily_email_limit" integer,
	"overage_enabled" boolean DEFAULT false NOT NULL,
	"max_agent_inboxes" integer DEFAULT 1 NOT NULL,
	"max_webhooks" integer DEFAULT 1 NOT NULL,
	"max_custom_domains" integer DEFAULT 1 NOT NULL,
	"max_attachment_bytes" integer DEFAULT 1048576 NOT NULL,
	"data_retention_days" integer DEFAULT 45 NOT NULL,
	"dedicated_ip_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE "organization_subscription" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"plan_id" "plan_id" DEFAULT 'free' NOT NULL,
	"status" "subscription_status" DEFAULT 'active' NOT NULL,
	"polar_subscription_id" text,
	"polar_customer_id" text,
	"billing_cycle" "billing_cycle" DEFAULT 'monthly' NOT NULL,
	"current_period_start" timestamp DEFAULT now() NOT NULL,
	"current_period_end" timestamp NOT NULL,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"canceled_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE "billing_period" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"plan_id" "plan_id" NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"included_emails" integer NOT NULL,
	"emails_used" integer DEFAULT 0 NOT NULL,
	"emails_overage" integer DEFAULT 0 NOT NULL,
	"polar_order_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
ALTER TABLE "organization_plan" ADD CONSTRAINT "organization_plan_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_subscription" ADD CONSTRAINT "organization_subscription_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_period" ADD CONSTRAINT "billing_period_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "organization_plan_organization_id_idx" ON "organization_plan" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "organization_subscription_organization_id_idx" ON "organization_subscription" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "organization_subscription_polar_subscription_id_idx" ON "organization_subscription" USING btree ("polar_subscription_id") WHERE "polar_subscription_id" is not null;--> statement-breakpoint
CREATE INDEX "organization_subscription_polar_customer_id_idx" ON "organization_subscription" USING btree ("polar_customer_id");--> statement-breakpoint
CREATE INDEX "billing_period_organization_id_idx" ON "billing_period" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "billing_period_org_start_idx" ON "billing_period" USING btree ("organization_id","period_start");
