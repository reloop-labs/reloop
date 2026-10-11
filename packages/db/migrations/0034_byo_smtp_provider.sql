DO $$ BEGIN
	CREATE TYPE "public"."smtp_security" AS ENUM('starttls', 'none');
EXCEPTION WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
	CREATE TYPE "public"."smtp_provider_status" AS ENUM('unverified', 'ok', 'failing');
EXCEPTION WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "smtp_provider" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"name" varchar(100) NOT NULL,
	"host" varchar(255) NOT NULL,
	"port" integer NOT NULL,
	"security" "smtp_security" DEFAULT 'starttls' NOT NULL,
	"username" varchar(255),
	"password_enc" text,
	"status" "smtp_provider_status" DEFAULT 'unverified' NOT NULL,
	"last_tested_at" timestamp,
	"last_error" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "smtp_provider" ADD CONSTRAINT "smtp_provider_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "smtp_provider_org_idx" ON "smtp_provider" USING btree ("organization_id");--> statement-breakpoint
ALTER TABLE "domain" ADD COLUMN IF NOT EXISTS "smtp_provider_id" text;--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "domain" ADD CONSTRAINT "domain_smtp_provider_id_smtp_provider_id_fk" FOREIGN KEY ("smtp_provider_id") REFERENCES "public"."smtp_provider"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
ALTER TABLE "organization_plan" ADD COLUMN IF NOT EXISTS "max_smtp_providers" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
-- Backfill existing paid orgs to their catalog cap (see packages/pricing catalog).
UPDATE "organization_plan" SET "max_smtp_providers" = CASE "plan_id"
	WHEN 'individual' THEN 1
	WHEN 'startup' THEN 3
	WHEN 'enterprise' THEN 5
	ELSE 0
END WHERE "max_smtp_providers" = 0;
