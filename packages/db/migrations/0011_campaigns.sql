CREATE TYPE "public"."campaign_status" AS ENUM('draft', 'scheduled', 'sending', 'sent', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."campaign_audience_type" AS ENUM('all', 'group', 'channel', 'csv');--> statement-breakpoint
CREATE TYPE "public"."campaign_recipient_status" AS ENUM('pending', 'sending', 'sent', 'skipped', 'failed');--> statement-breakpoint
CREATE TYPE "public"."campaign_skip_reason" AS ENUM('unsubscribed', 'blocked', 'suppressed', 'duplicate', 'cancelled');--> statement-breakpoint
CREATE TABLE "campaign" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"subject" varchar(255) NOT NULL,
	"preview_text" text,
	"from_name" varchar(255) NOT NULL,
	"from_email" varchar(255) NOT NULL,
	"reply_to" varchar(255),
	"status" "campaign_status" DEFAULT 'draft' NOT NULL,
	"audience_type" "campaign_audience_type" NOT NULL,
	"audience_target_id" text,
	"audience_target_name" varchar(255),
	"csv_emails" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"template_id" text,
	"content_html" text DEFAULT '' NOT NULL,
	"scheduled_at" timestamp,
	"started_at" timestamp,
	"sent_at" timestamp,
	"cancelled_at" timestamp,
	"recipient_count" integer DEFAULT 0 NOT NULL,
	"sent_count" integer DEFAULT 0 NOT NULL,
	"delivered_count" integer DEFAULT 0 NOT NULL,
	"opened_count" integer DEFAULT 0 NOT NULL,
	"clicked_count" integer DEFAULT 0 NOT NULL,
	"failed_count" integer DEFAULT 0 NOT NULL,
	"skipped_count" integer DEFAULT 0 NOT NULL,
	"last_error" text,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE "campaign_recipient" (
	"id" text PRIMARY KEY NOT NULL,
	"campaign_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"contact_id" text,
	"email" varchar(255) NOT NULL,
	"status" "campaign_recipient_status" DEFAULT 'pending' NOT NULL,
	"skip_reason" "campaign_skip_reason",
	"email_log_id" text,
	"error" text,
	"delivered_at" timestamp,
	"opened_at" timestamp,
	"clicked_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
ALTER TABLE "campaign" ADD CONSTRAINT "campaign_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign" ADD CONSTRAINT "campaign_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign" ADD CONSTRAINT "campaign_template_id_template_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."template"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_recipient" ADD CONSTRAINT "campaign_recipient_campaign_id_campaign_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaign"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_recipient" ADD CONSTRAINT "campaign_recipient_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_recipient" ADD CONSTRAINT "campaign_recipient_contact_id_contact_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contact"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_recipient" ADD CONSTRAINT "campaign_recipient_email_log_id_email_log_id_fk" FOREIGN KEY ("email_log_id") REFERENCES "public"."email_log"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "campaign_idx_organization_id" ON "campaign" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "campaign_idx_org_status" ON "campaign" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "campaign_idx_status_scheduled" ON "campaign" USING btree ("status","scheduled_at");--> statement-breakpoint
CREATE INDEX "campaign_idx_template_id" ON "campaign" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "campaign_recipient_idx_campaign" ON "campaign_recipient" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "campaign_recipient_idx_campaign_status" ON "campaign_recipient" USING btree ("campaign_id","status");--> statement-breakpoint
CREATE INDEX "campaign_recipient_idx_email_log" ON "campaign_recipient" USING btree ("email_log_id");--> statement-breakpoint
CREATE INDEX "campaign_recipient_idx_org" ON "campaign_recipient" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "campaign_recipient_unique_campaign_email" ON "campaign_recipient" USING btree ("campaign_id","email");
