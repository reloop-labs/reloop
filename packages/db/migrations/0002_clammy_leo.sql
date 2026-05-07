CREATE TYPE "public"."org_status" AS ENUM('active', 'suspended', 'deleted');--> statement-breakpoint
CREATE TYPE "public"."billing_cycle" AS ENUM('monthly', 'annual');--> statement-breakpoint
CREATE TYPE "public"."email_send_status" AS ENUM('queued', 'sent', 'skipped', 'failed', 'bounced');--> statement-breakpoint
CREATE TYPE "public"."invoice_status" AS ENUM('draft', 'open', 'paid', 'void', 'uncollectible');--> statement-breakpoint
CREATE TYPE "public"."ledger_entry_type" AS ENUM('credit_purchased', 'email_sent', 'rollover_applied', 'manual_adjustment', 'refund', 'plan_change', 'period_reset');--> statement-breakpoint
CREATE TYPE "public"."skip_reason" AS ENUM('over_limit', 'unsubscribed', 'duplicate', 'invalid_address', 'suppressed', 'dry_run');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'past_due', 'cancelled', 'trialing', 'paused');--> statement-breakpoint
CREATE TABLE "billing_invoice" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"subscription_id" text NOT NULL,
	"credits_included" integer NOT NULL,
	"credits_used" integer NOT NULL,
	"overage_credits" integer DEFAULT 0 NOT NULL,
	"base_amount_usd" numeric(10, 2) NOT NULL,
	"overage_amount_usd" numeric(10, 2) DEFAULT '0' NOT NULL,
	"total_usd" numeric(10, 2) NOT NULL,
	"status" "invoice_status" DEFAULT 'draft' NOT NULL,
	"external_invoice_id" varchar(255),
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "credit_ledger" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"subscription_id" text NOT NULL,
	"entry_type" "ledger_entry_type" NOT NULL,
	"delta" integer NOT NULL,
	"balance_after" integer NOT NULL,
	"reason" text,
	"reference_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plan" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"monthly_credits" integer NOT NULL,
	"overage_limit" integer DEFAULT 0 NOT NULL,
	"base_price_usd" numeric(10, 2) NOT NULL,
	"overage_price_per_email" numeric(10, 4) DEFAULT '0' NOT NULL,
	"billing_cycle" "billing_cycle" DEFAULT 'monthly' NOT NULL,
	"rollover_enabled" boolean DEFAULT false NOT NULL,
	"max_rollover_credits" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscription" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"plan_id" text NOT NULL,
	"status" "subscription_status" DEFAULT 'active' NOT NULL,
	"credits_used" integer DEFAULT 0 NOT NULL,
	"credits_remaining" integer DEFAULT 0 NOT NULL,
	"rollover_credits" integer DEFAULT 0 NOT NULL,
	"overage_credits_used" integer DEFAULT 0 NOT NULL,
	"current_period_start" timestamp NOT NULL,
	"current_period_end" timestamp NOT NULL,
	"external_subscription_id" varchar(255),
	"cancelled_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscription_external_subscription_id_unique" UNIQUE("external_subscription_id")
);
--> statement-breakpoint
CREATE TABLE "channel" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"organization_id" text NOT NULL,
	"visibility" "visibility" DEFAULT 'private' NOT NULL,
	"default_subscription" "default_subscription" DEFAULT 'opt_in' NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "channel_subscription" (
	"id" text PRIMARY KEY NOT NULL,
	"contact_id" text NOT NULL,
	"channel_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"status" "enrollment_status" DEFAULT 'enrolled' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "channel_subscription_unique" UNIQUE("contact_id","channel_id")
);
--> statement-breakpoint
ALTER TABLE "topic" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "topic_enrollment" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "topic" CASCADE;--> statement-breakpoint
DROP TABLE "topic_enrollment" CASCADE;--> statement-breakpoint
ALTER TABLE "email_event" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."email_event_type";--> statement-breakpoint
CREATE TYPE "public"."email_event_type" AS ENUM('delivered', 'opened', 'clicked', 'bounced', 'complained', 'unsubscribed', 'deferred');--> statement-breakpoint
ALTER TABLE "email_event" ALTER COLUMN "type" SET DATA TYPE "public"."email_event_type" USING "type"::"public"."email_event_type";--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "status" "org_status" DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "billing_email" text;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "billing_name" text;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "external_customer_id" text;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "email_log" ADD COLUMN "user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "email_log" ADD COLUMN "apikey_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "billing_invoice" ADD CONSTRAINT "billing_invoice_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_invoice" ADD CONSTRAINT "billing_invoice_subscription_id_subscription_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscription"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_ledger" ADD CONSTRAINT "credit_ledger_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_ledger" ADD CONSTRAINT "credit_ledger_subscription_id_subscription_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscription"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_plan_id_plan_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plan"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel" ADD CONSTRAINT "channel_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel" ADD CONSTRAINT "channel_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_subscription" ADD CONSTRAINT "channel_subscription_contact_id_contact_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contact"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_subscription" ADD CONSTRAINT "channel_subscription_channel_id_channel_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."channel"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_subscription" ADD CONSTRAINT "channel_subscription_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "invoices_organization_id_idx" ON "billing_invoice" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "invoices_subscription_id_idx" ON "billing_invoice" USING btree ("subscription_id");--> statement-breakpoint
CREATE INDEX "invoices_status_idx" ON "billing_invoice" USING btree ("status");--> statement-breakpoint
CREATE INDEX "ledger_organization_id_idx" ON "credit_ledger" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "ledger_subscription_id_idx" ON "credit_ledger" USING btree ("subscription_id");--> statement-breakpoint
CREATE INDEX "ledger_org_created_idx" ON "credit_ledger" USING btree ("organization_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "subscription_org_active_idx" ON "subscription" USING btree ("organization_id") WHERE status NOT IN ('cancelled');--> statement-breakpoint
CREATE INDEX "subscription_organization_id_idx" ON "subscription" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "subscription_period_idx" ON "subscription" USING btree ("current_period_start","current_period_end");--> statement-breakpoint
CREATE INDEX "channel_idx_organization_id" ON "channel" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "channel_idx_name" ON "channel" USING btree ("name");--> statement-breakpoint
CREATE INDEX "channel_idx_user_id" ON "channel" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "channel_subscription_idx_contact_id" ON "channel_subscription" USING btree ("contact_id");--> statement-breakpoint
CREATE INDEX "channel_subscription_idx_channel_id" ON "channel_subscription" USING btree ("channel_id");--> statement-breakpoint
CREATE INDEX "channel_subscription_idx_organization_id" ON "channel_subscription" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "channel_subscription_idx_status" ON "channel_subscription" USING btree ("status");--> statement-breakpoint
ALTER TABLE "email_log" ADD CONSTRAINT "email_log_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_log" ADD CONSTRAINT "email_log_apikey_id_apikey_id_fk" FOREIGN KEY ("apikey_id") REFERENCES "public"."apikey"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization" ADD CONSTRAINT "organization_external_customer_id_unique" UNIQUE("external_customer_id");