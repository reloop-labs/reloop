CREATE TYPE "public"."sending_block_reason" AS ENUM('bounce_rate', 'complaint_rate', 'duplicate_burst');--> statement-breakpoint
CREATE TYPE "public"."sending_block_window" AS ENUM('24h', '7d');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "org_sending_block" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"domain_id" text,
	"reason" "sending_block_reason" NOT NULL,
	"window" "sending_block_window" DEFAULT '24h' NOT NULL,
	"sent_count" integer DEFAULT 0 NOT NULL,
	"bounced_count" integer DEFAULT 0 NOT NULL,
	"complaint_count" integer DEFAULT 0 NOT NULL,
	"bounce_rate" real DEFAULT 0 NOT NULL,
	"complaint_rate" real DEFAULT 0 NOT NULL,
	"blocked_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"notified_at" timestamp,
	"released_at" timestamp,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "org_sending_block" ADD CONSTRAINT "org_sending_block_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "org_sending_block" ADD CONSTRAINT "org_sending_block_domain_id_domain_id_fk" FOREIGN KEY ("domain_id") REFERENCES "public"."domain"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "org_sending_block_idx_org" ON "org_sending_block" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "org_sending_block_idx_org_expires" ON "org_sending_block" USING btree ("organization_id","expires_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "org_sending_block_idx_domain" ON "org_sending_block" USING btree ("domain_id");
