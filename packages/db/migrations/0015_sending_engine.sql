CREATE TYPE "public"."automation_enrollment_status" AS ENUM('active', 'completed', 'cancelled', 'failed');--> statement-breakpoint
CREATE TYPE "public"."automation_status" AS ENUM('draft', 'active', 'paused');--> statement-breakpoint
CREATE TYPE "public"."automation_step_run_status" AS ENUM('pending', 'running', 'completed', 'skipped', 'failed');--> statement-breakpoint
CREATE TYPE "public"."campaign_audience_type" AS ENUM('all', 'group', 'channel', 'csv');--> statement-breakpoint
CREATE TYPE "public"."campaign_recipient_status" AS ENUM('pending', 'sending', 'sent', 'skipped', 'failed');--> statement-breakpoint
CREATE TYPE "public"."campaign_skip_reason" AS ENUM('unsubscribed', 'blocked', 'suppressed', 'duplicate', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."campaign_status" AS ENUM('draft', 'scheduled', 'sending', 'sent', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."compose_draft_kind" AS ENUM('compose', 'reply', 'reply_all', 'forward');--> statement-breakpoint
CREATE TYPE "public"."custom_event_property_type" AS ENUM('string', 'number', 'boolean');--> statement-breakpoint
CREATE TYPE "public"."sending_ip_health" AS ENUM('ready', 'warming', 'paused', 'blocklisted');--> statement-breakpoint
ALTER TYPE "public"."pending_outbound_status" ADD VALUE 'sending' BEFORE 'cancelled';--> statement-breakpoint
CREATE TABLE "activity_log" (
	"id" text PRIMARY KEY NOT NULL,
	"event" text NOT NULL,
	"level" text NOT NULL,
	"trace_id" text,
	"user_id" text,
	"organization_id" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"request_details" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"request_body" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status_code" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"actor_type" text DEFAULT '' NOT NULL,
	"actor_id" text,
	"resource_type" text DEFAULT '' NOT NULL,
	"resource_id" text,
	"service" text DEFAULT '' NOT NULL,
	"action" text DEFAULT '' NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"environment" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "automation" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"status" "automation_status" DEFAULT 'draft' NOT NULL,
	"trigger_event" varchar(128),
	"graph" jsonb DEFAULT '{"nodes":[],"edges":[]}'::jsonb NOT NULL,
	"active_version_id" text,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "automation_enrollment" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"automation_id" text NOT NULL,
	"version_id" text NOT NULL,
	"contact_id" text NOT NULL,
	"status" "automation_enrollment_status" DEFAULT 'active' NOT NULL,
	"current_node_id" text,
	"context" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"enrolled_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"cancelled_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "automation_enrollment_unique" UNIQUE("automation_id","contact_id")
);
--> statement-breakpoint
CREATE TABLE "automation_step_run" (
	"id" text PRIMARY KEY NOT NULL,
	"enrollment_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"node_id" text NOT NULL,
	"node_type" varchar(64) NOT NULL,
	"status" "automation_step_run_status" DEFAULT 'pending' NOT NULL,
	"scheduled_for" timestamp DEFAULT now() NOT NULL,
	"started_at" timestamp,
	"finished_at" timestamp,
	"email_log_id" text,
	"error" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "automation_version" (
	"id" text PRIMARY KEY NOT NULL,
	"automation_id" text NOT NULL,
	"version" integer NOT NULL,
	"trigger_event" varchar(128) NOT NULL,
	"graph" jsonb NOT NULL,
	"created_by_user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "automation_version_unique" UNIQUE("automation_id","version")
);
--> statement-breakpoint
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
	"content" jsonb DEFAULT '[]'::jsonb NOT NULL,
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
);
--> statement-breakpoint
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
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "campaign_recipient_unique_campaign_email" UNIQUE("campaign_id","email")
);
--> statement-breakpoint
CREATE TABLE "custom_event" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"key" varchar(128) NOT NULL,
	"description" text,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "custom_event_unique_org_key" UNIQUE("organization_id","key")
);
--> statement-breakpoint
CREATE TABLE "custom_event_property" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"name" varchar(128) NOT NULL,
	"property_type" "custom_event_property_type" DEFAULT 'string' NOT NULL,
	"required" boolean DEFAULT false NOT NULL,
	"default_value" varchar(512),
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "custom_event_property_unique_event_name" UNIQUE("event_id","name")
);
--> statement-breakpoint
CREATE TABLE "sending_ip" (
	"id" text PRIMARY KEY NOT NULL,
	"address" text NOT NULL,
	"pool" text DEFAULT 'default' NOT NULL,
	"hostname" text DEFAULT '' NOT NULL,
	"health" "sending_ip_health" DEFAULT 'warming' NOT NULL,
	"warmup_day" integer DEFAULT 1 NOT NULL,
	"first_seen_at" timestamp DEFAULT now() NOT NULL,
	"reputation_score" integer DEFAULT 100 NOT NULL,
	"bounce_rate" real DEFAULT 0 NOT NULL,
	"complaint_rate" real DEFAULT 0 NOT NULL,
	"last_dnsbl_check_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sending_ip_address_unique" UNIQUE("address")
);
--> statement-breakpoint
CREATE TABLE "warmup_counter" (
	"id" text PRIMARY KEY NOT NULL,
	"sending_ip_id" text NOT NULL,
	"provider" text NOT NULL,
	"day" text NOT NULL,
	"sent_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "domain" DROP CONSTRAINT "domain_unique_org_domain";--> statement-breakpoint
ALTER TABLE "domain_dns_record" DROP CONSTRAINT "domain_dns_record_unique_record";--> statement-breakpoint
ALTER TABLE "domain" ALTER COLUMN "tracking_subdomain" SET DEFAULT 'link';--> statement-breakpoint
ALTER TABLE "webhook_delivery" ALTER COLUMN "attempt_number" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "webhook_delivery" ALTER COLUMN "max_attempts" SET DEFAULT 7;--> statement-breakpoint
ALTER TABLE "compose_draft" ADD COLUMN "kind" "compose_draft_kind" DEFAULT 'compose' NOT NULL;--> statement-breakpoint
ALTER TABLE "compose_draft" ADD COLUMN "thread_id" text;--> statement-breakpoint
ALTER TABLE "compose_draft" ADD COLUMN "in_reply_to_message_id" text;--> statement-breakpoint
ALTER TABLE "email_log" ADD COLUMN "raw_message" text;--> statement-breakpoint
ALTER TABLE "email_log" ADD COLUMN "attachments" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "webhook_delivery" ADD COLUMN "replay_of_delivery_id" text;--> statement-breakpoint
ALTER TABLE "webhook_event" ADD COLUMN "idempotency_key" text;--> statement-breakpoint
ALTER TABLE "automation" ADD CONSTRAINT "automation_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation" ADD CONSTRAINT "automation_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation_enrollment" ADD CONSTRAINT "automation_enrollment_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation_enrollment" ADD CONSTRAINT "automation_enrollment_automation_id_automation_id_fk" FOREIGN KEY ("automation_id") REFERENCES "public"."automation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation_enrollment" ADD CONSTRAINT "automation_enrollment_version_id_automation_version_id_fk" FOREIGN KEY ("version_id") REFERENCES "public"."automation_version"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation_enrollment" ADD CONSTRAINT "automation_enrollment_contact_id_contact_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contact"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation_step_run" ADD CONSTRAINT "automation_step_run_enrollment_id_automation_enrollment_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."automation_enrollment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation_step_run" ADD CONSTRAINT "automation_step_run_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation_step_run" ADD CONSTRAINT "automation_step_run_email_log_id_email_log_id_fk" FOREIGN KEY ("email_log_id") REFERENCES "public"."email_log"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation_version" ADD CONSTRAINT "automation_version_automation_id_automation_id_fk" FOREIGN KEY ("automation_id") REFERENCES "public"."automation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation_version" ADD CONSTRAINT "automation_version_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign" ADD CONSTRAINT "campaign_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign" ADD CONSTRAINT "campaign_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign" ADD CONSTRAINT "campaign_template_id_template_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."template"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_recipient" ADD CONSTRAINT "campaign_recipient_campaign_id_campaign_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaign"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_recipient" ADD CONSTRAINT "campaign_recipient_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_recipient" ADD CONSTRAINT "campaign_recipient_contact_id_contact_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contact"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_recipient" ADD CONSTRAINT "campaign_recipient_email_log_id_email_log_id_fk" FOREIGN KEY ("email_log_id") REFERENCES "public"."email_log"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_event" ADD CONSTRAINT "custom_event_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_event" ADD CONSTRAINT "custom_event_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_event_property" ADD CONSTRAINT "custom_event_property_event_id_custom_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."custom_event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_event_property" ADD CONSTRAINT "custom_event_property_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warmup_counter" ADD CONSTRAINT "warmup_counter_sending_ip_id_sending_ip_id_fk" FOREIGN KEY ("sending_ip_id") REFERENCES "public"."sending_ip"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activity_log_idx_org_created" ON "activity_log" USING btree ("organization_id","created_at");--> statement-breakpoint
CREATE INDEX "activity_log_idx_org_service_created" ON "activity_log" USING btree ("organization_id","service","created_at");--> statement-breakpoint
CREATE INDEX "activity_log_idx_org_level" ON "activity_log" USING btree ("organization_id","level");--> statement-breakpoint
CREATE INDEX "activity_log_idx_org_resource" ON "activity_log" USING btree ("organization_id","resource_type","resource_id","created_at");--> statement-breakpoint
CREATE INDEX "automation_idx_organization_id" ON "automation" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "automation_idx_status" ON "automation" USING btree ("status");--> statement-breakpoint
CREATE INDEX "automation_idx_trigger_event" ON "automation" USING btree ("trigger_event");--> statement-breakpoint
CREATE INDEX "automation_idx_org_status_trigger" ON "automation" USING btree ("organization_id","status","trigger_event");--> statement-breakpoint
CREATE INDEX "automation_enrollment_idx_org" ON "automation_enrollment" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "automation_enrollment_idx_automation" ON "automation_enrollment" USING btree ("automation_id");--> statement-breakpoint
CREATE INDEX "automation_enrollment_idx_contact" ON "automation_enrollment" USING btree ("contact_id");--> statement-breakpoint
CREATE INDEX "automation_enrollment_idx_status" ON "automation_enrollment" USING btree ("status");--> statement-breakpoint
CREATE INDEX "automation_step_run_idx_enrollment" ON "automation_step_run" USING btree ("enrollment_id");--> statement-breakpoint
CREATE INDEX "automation_step_run_idx_status_scheduled" ON "automation_step_run" USING btree ("status","scheduled_for");--> statement-breakpoint
CREATE INDEX "automation_step_run_idx_org" ON "automation_step_run" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "automation_version_idx_automation_id" ON "automation_version" USING btree ("automation_id");--> statement-breakpoint
CREATE INDEX "campaign_idx_organization_id" ON "campaign" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "campaign_idx_org_status" ON "campaign" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "campaign_idx_status_scheduled" ON "campaign" USING btree ("status","scheduled_at");--> statement-breakpoint
CREATE INDEX "campaign_idx_template_id" ON "campaign" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "campaign_recipient_idx_campaign" ON "campaign_recipient" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "campaign_recipient_idx_campaign_status" ON "campaign_recipient" USING btree ("campaign_id","status");--> statement-breakpoint
CREATE INDEX "campaign_recipient_idx_email_log" ON "campaign_recipient" USING btree ("email_log_id");--> statement-breakpoint
CREATE INDEX "campaign_recipient_idx_org" ON "campaign_recipient" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "custom_event_idx_organization_id" ON "custom_event" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "custom_event_idx_key" ON "custom_event" USING btree ("key");--> statement-breakpoint
CREATE INDEX "custom_event_idx_user_id" ON "custom_event" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "custom_event_property_idx_event_id" ON "custom_event_property" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "custom_event_property_idx_organization_id" ON "custom_event_property" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "sending_ip_idx_pool" ON "sending_ip" USING btree ("pool");--> statement-breakpoint
CREATE INDEX "sending_ip_idx_health" ON "sending_ip" USING btree ("health");--> statement-breakpoint
CREATE INDEX "warmup_counter_idx_ip_day" ON "warmup_counter" USING btree ("sending_ip_id","day");--> statement-breakpoint
CREATE INDEX "compose_draft_idx_mailbox_thread_kind" ON "compose_draft" USING btree ("mailbox_id","thread_id","kind");--> statement-breakpoint
CREATE INDEX "webhook_delivery_idx_replay_of" ON "webhook_delivery" USING btree ("replay_of_delivery_id");--> statement-breakpoint
CREATE INDEX "webhook_event_idx_idempotency_key" ON "webhook_event" USING btree ("idempotency_key");--> statement-breakpoint
CREATE UNIQUE INDEX "webhook_event_uidx_idempotency_key" ON "webhook_event" USING btree ("idempotency_key") WHERE "webhook_event"."idempotency_key" is not null;