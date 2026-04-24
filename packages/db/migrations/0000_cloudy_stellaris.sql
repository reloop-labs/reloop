CREATE TYPE "public"."contact_status" AS ENUM('subscribed', 'unsubscribed', 'blocked');--> statement-breakpoint
CREATE TYPE "public"."property_type" AS ENUM('string', 'number');--> statement-breakpoint
CREATE TYPE "public"."dns_record_type" AS ENUM('A', 'AAAA', 'CNAME', 'MX', 'TXT');--> statement-breakpoint
CREATE TYPE "public"."dns_record_type_name" AS ENUM('MX', 'SPF', 'DKIM', 'DMARC');--> statement-breakpoint
CREATE TYPE "public"."domain_status" AS ENUM('start-verify', 'verifying', 'active', 'suspended', 'failed');--> statement-breakpoint
CREATE TYPE "public"."domain_type" AS ENUM('custom', 'subdomain', 'system');--> statement-breakpoint
CREATE TYPE "public"."tls_mode" AS ENUM('opportunistic', 'enforced');--> statement-breakpoint
CREATE TYPE "public"."email_event_type" AS ENUM('sent', 'delivered', 'opened', 'clicked', 'bounced', 'complaint');--> statement-breakpoint
CREATE TYPE "public"."email_priority" AS ENUM('low', 'normal', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."email_status" AS ENUM('pending', 'sent', 'delivered', 'failed', 'bounced', 'spam', 'archived');--> statement-breakpoint
CREATE TYPE "public"."template_block_type" AS ENUM('heading', 'text', 'button', 'image', 'divider', 'spacer', 'section', 'container', 'columns', 'html');--> statement-breakpoint
CREATE TYPE "public"."template_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."default_subscription" AS ENUM('opt_in', 'opt_out');--> statement-breakpoint
CREATE TYPE "public"."enrollment_status" AS ENUM('enrolled', 'unenrolled');--> statement-breakpoint
CREATE TYPE "public"."visibility" AS ENUM('private', 'public');--> statement-breakpoint
CREATE TYPE "public"."webhook_delivery_status" AS ENUM('pending', 'success', 'failed', 'retrying');--> statement-breakpoint
CREATE TYPE "public"."webhook_status" AS ENUM('active', 'paused', 'disabled', 'failed');--> statement-breakpoint
CREATE TABLE "apikey" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"start" text,
	"prefix" text,
	"key" text NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"refill_interval" integer,
	"refill_amount" integer,
	"last_refill_at" timestamp,
	"enabled" boolean DEFAULT true NOT NULL,
	"rate_limit_enabled" boolean DEFAULT true NOT NULL,
	"rate_limit_time_window" integer DEFAULT 86400000 NOT NULL,
	"rate_limit_max" integer DEFAULT 10 NOT NULL,
	"request_count" integer DEFAULT 0 NOT NULL,
	"remaining" integer,
	"last_request" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"permissions" text,
	"metadata" text
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invitation" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"email" text NOT NULL,
	"role" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"inviter_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jwks" (
	"id" text PRIMARY KEY NOT NULL,
	"public_key" text NOT NULL,
	"private_key" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "member" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"logo" text,
	"created_at" timestamp NOT NULL,
	"metadata" text,
	CONSTRAINT "organization_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"role" text,
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	"ban_expires" timestamp,
	"active_organization_id" text,
	"mode" text DEFAULT 'dev',
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact" (
	"id" text PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"status" "contact_status" DEFAULT 'subscribed' NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"first_name" varchar(255),
	"last_name" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "contact_unique_org_email" UNIQUE("organization_id","email")
);
--> statement-breakpoint
CREATE TABLE "contact_property" (
	"id" text PRIMARY KEY NOT NULL,
	"property_name" varchar(255) NOT NULL,
	"property_type" "property_type" NOT NULL,
	"default_value" varchar(255),
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "contact_property_unique_org_property_name" UNIQUE("organization_id","property_name")
);
--> statement-breakpoint
CREATE TABLE "contact_property_value" (
	"id" text PRIMARY KEY NOT NULL,
	"contact_id" text NOT NULL,
	"property_id" text NOT NULL,
	"value" text NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "cpv_unique_contact_property_value" UNIQUE("contact_id","property_id")
);
--> statement-breakpoint
CREATE TABLE "domain" (
	"id" text PRIMARY KEY NOT NULL,
	"domain" varchar(255) NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"domain_type" "domain_type" DEFAULT 'custom' NOT NULL,
	"status" "domain_status" DEFAULT 'start-verify' NOT NULL,
	"user_verified" boolean DEFAULT false NOT NULL,
	"system_verified" boolean DEFAULT false NOT NULL,
	"custom_return_path" varchar(255) DEFAULT 'inbound.email' NOT NULL,
	"click_tracking" boolean DEFAULT false NOT NULL,
	"open_tracking" boolean DEFAULT false NOT NULL,
	"tls" "tls_mode" DEFAULT 'opportunistic' NOT NULL,
	"tracking_domain" boolean DEFAULT false NOT NULL,
	"sending_email" boolean DEFAULT true NOT NULL,
	"receiving_email" boolean DEFAULT true NOT NULL,
	"verification_failed_reason" text,
	"deleted_at" timestamp,
	"last_verified_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "domain_unique_org_domain" UNIQUE("organization_id","domain")
);
--> statement-breakpoint
CREATE TABLE "domain_dns_record" (
	"id" text PRIMARY KEY NOT NULL,
	"domain_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"record_type" "dns_record_type" NOT NULL,
	"name" text NOT NULL,
	"status" "domain_status" DEFAULT 'start-verify' NOT NULL,
	"value" text NOT NULL,
	"ttl" text DEFAULT 'Auto' NOT NULL,
	"priority" integer,
	"record_type_name" "dns_record_type_name" NOT NULL,
	"domain" text NOT NULL,
	"fqdn" text NOT NULL,
	"private_key" text,
	"verification_error" text,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "domain_dns_record_unique_record" UNIQUE("domain_id","record_type","name","value")
);
--> statement-breakpoint
CREATE TABLE "email_event" (
	"id" text PRIMARY KEY NOT NULL,
	"email_log_id" text NOT NULL,
	"type" "email_event_type" NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_log" (
	"id" text PRIMARY KEY NOT NULL,
	"message_id" varchar(500) NOT NULL,
	"organization_id" text NOT NULL,
	"domain_id" text NOT NULL,
	"from_email" varchar(255) NOT NULL,
	"from_name" varchar(255),
	"to_emails" jsonb NOT NULL,
	"cc_emails" jsonb,
	"bcc_emails" jsonb,
	"reply_to" varchar(255),
	"subject" text NOT NULL,
	"text_body" text,
	"html_body" text,
	"status" "email_status" DEFAULT 'pending' NOT NULL,
	"priority" "email_priority" DEFAULT 'normal' NOT NULL,
	"error_message" text,
	"provider" varchar(100) DEFAULT 'postfix' NOT NULL,
	"provider_message_id" varchar(500),
	"size" bigint DEFAULT 0 NOT NULL,
	"headers" jsonb,
	"sent_at" timestamp,
	"delivered_at" timestamp,
	"failed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "email_log_message_id_unique" UNIQUE("message_id")
);
--> statement-breakpoint
CREATE TABLE "contact_group" (
	"id" text PRIMARY KEY NOT NULL,
	"contact_id" text NOT NULL,
	"group_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "contact_group_unique" UNIQUE("contact_id","group_id")
);
--> statement-breakpoint
CREATE TABLE "group" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "template" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"subject" varchar(500),
	"organization_id" text NOT NULL,
	"created_by_user_id" text NOT NULL,
	"status" "template_status" DEFAULT 'draft' NOT NULL,
	"content" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"variables" jsonb DEFAULT '[]'::jsonb,
	"current_version" integer DEFAULT 1,
	"thumbnail_url" text,
	"is_default" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "template_version" (
	"id" text PRIMARY KEY NOT NULL,
	"template_id" text NOT NULL,
	"version" integer NOT NULL,
	"subject" varchar(500),
	"content" jsonb NOT NULL,
	"variables" jsonb DEFAULT '[]'::jsonb,
	"rendered_html" text,
	"created_by_user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "topic" (
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
CREATE TABLE "topic_enrollment" (
	"id" text PRIMARY KEY NOT NULL,
	"contact_id" text NOT NULL,
	"topic_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"status" "enrollment_status" DEFAULT 'enrolled' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "topic_enrollment_unique" UNIQUE("contact_id","topic_id")
);
--> statement-breakpoint
CREATE TABLE "upload" (
	"id" text PRIMARY KEY NOT NULL,
	"filename" varchar(255) NOT NULL,
	"original_name" varchar(255) NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"size" integer NOT NULL,
	"path" text NOT NULL,
	"user_id" text NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "webhook" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"url" text NOT NULL,
	"secret" text NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"status" "webhook_status" DEFAULT 'active' NOT NULL,
	"custom_headers" jsonb,
	"rate_limit_enabled" boolean DEFAULT true NOT NULL,
	"max_requests_per_minute" integer DEFAULT 60 NOT NULL,
	"max_retries" integer DEFAULT 3 NOT NULL,
	"retry_backoff_multiplier" integer DEFAULT 2 NOT NULL,
	"filtering_options" jsonb,
	"last_triggered_at" timestamp,
	"success_count" integer DEFAULT 0 NOT NULL,
	"failure_count" integer DEFAULT 0 NOT NULL,
	"consecutive_failures" integer DEFAULT 0 NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "webhook_delivery" (
	"id" text PRIMARY KEY NOT NULL,
	"webhook_id" text NOT NULL,
	"webhook_event_id" text,
	"event_type" text NOT NULL,
	"event_data" jsonb NOT NULL,
	"status" "webhook_delivery_status" DEFAULT 'pending' NOT NULL,
	"request_url" text NOT NULL,
	"request_headers" jsonb,
	"request_body" jsonb,
	"response_status" integer,
	"response_body" text,
	"response_headers" jsonb,
	"attempt_number" integer DEFAULT 1 NOT NULL,
	"max_attempts" integer DEFAULT 3 NOT NULL,
	"next_retry_at" timestamp,
	"last_attempt_at" timestamp,
	"error_message" text,
	"error_details" jsonb,
	"completed_at" timestamp,
	"duration_ms" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "webhook_event" (
	"id" text PRIMARY KEY NOT NULL,
	"event" text NOT NULL,
	"payload" jsonb NOT NULL,
	"source" varchar(100) NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "webhook_event_subscription" (
	"id" text PRIMARY KEY NOT NULL,
	"webhook_id" text NOT NULL,
	"event_id" text NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "apikey" ADD CONSTRAINT "apikey_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "apikey" ADD CONSTRAINT "apikey_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_inviter_id_user_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact" ADD CONSTRAINT "contact_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact" ADD CONSTRAINT "contact_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact_property" ADD CONSTRAINT "contact_property_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact_property" ADD CONSTRAINT "contact_property_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact_property_value" ADD CONSTRAINT "contact_property_value_contact_id_contact_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contact"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact_property_value" ADD CONSTRAINT "contact_property_value_property_id_contact_property_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."contact_property"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact_property_value" ADD CONSTRAINT "contact_property_value_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact_property_value" ADD CONSTRAINT "contact_property_value_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "domain" ADD CONSTRAINT "domain_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "domain" ADD CONSTRAINT "domain_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "domain_dns_record" ADD CONSTRAINT "domain_dns_record_domain_id_domain_id_fk" FOREIGN KEY ("domain_id") REFERENCES "public"."domain"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "domain_dns_record" ADD CONSTRAINT "domain_dns_record_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "domain_dns_record" ADD CONSTRAINT "domain_dns_record_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_event" ADD CONSTRAINT "email_event_email_log_id_email_log_id_fk" FOREIGN KEY ("email_log_id") REFERENCES "public"."email_log"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_log" ADD CONSTRAINT "email_log_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_log" ADD CONSTRAINT "email_log_domain_id_domain_id_fk" FOREIGN KEY ("domain_id") REFERENCES "public"."domain"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact_group" ADD CONSTRAINT "contact_group_contact_id_contact_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contact"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact_group" ADD CONSTRAINT "contact_group_group_id_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."group"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact_group" ADD CONSTRAINT "contact_group_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact_group" ADD CONSTRAINT "contact_group_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group" ADD CONSTRAINT "group_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group" ADD CONSTRAINT "group_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template" ADD CONSTRAINT "template_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template" ADD CONSTRAINT "template_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_version" ADD CONSTRAINT "template_version_template_id_template_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."template"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_version" ADD CONSTRAINT "template_version_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topic" ADD CONSTRAINT "topic_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topic" ADD CONSTRAINT "topic_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topic_enrollment" ADD CONSTRAINT "topic_enrollment_contact_id_contact_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contact"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topic_enrollment" ADD CONSTRAINT "topic_enrollment_topic_id_topic_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topic"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topic_enrollment" ADD CONSTRAINT "topic_enrollment_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "upload" ADD CONSTRAINT "upload_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhook" ADD CONSTRAINT "webhook_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhook" ADD CONSTRAINT "webhook_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhook_delivery" ADD CONSTRAINT "webhook_delivery_webhook_id_webhook_id_fk" FOREIGN KEY ("webhook_id") REFERENCES "public"."webhook"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhook_delivery" ADD CONSTRAINT "webhook_delivery_webhook_event_id_webhook_event_id_fk" FOREIGN KEY ("webhook_event_id") REFERENCES "public"."webhook_event"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhook_event" ADD CONSTRAINT "webhook_event_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhook_event" ADD CONSTRAINT "webhook_event_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhook_event_subscription" ADD CONSTRAINT "webhook_event_subscription_webhook_id_webhook_id_fk" FOREIGN KEY ("webhook_id") REFERENCES "public"."webhook"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "invitation_organizationId_idx" ON "invitation" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "invitation_email_idx" ON "invitation" USING btree ("email");--> statement-breakpoint
CREATE INDEX "member_organizationId_idx" ON "member" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "member_userId_idx" ON "member" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "contact_idx_email" ON "contact" USING btree ("email");--> statement-breakpoint
CREATE INDEX "contact_idx_organization_id" ON "contact" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "contact_idx_org_email" ON "contact" USING btree ("organization_id","email");--> statement-breakpoint
CREATE INDEX "contact_idx_status" ON "contact" USING btree ("status");--> statement-breakpoint
CREATE INDEX "contact_idx_user_id" ON "contact" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "contact_property_idx_organization_id" ON "contact_property" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "contact_property_idx_user_id" ON "contact_property" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "contact_property_idx_property_name" ON "contact_property" USING btree ("property_name");--> statement-breakpoint
CREATE INDEX "cpv_idx_contact_id" ON "contact_property_value" USING btree ("contact_id");--> statement-breakpoint
CREATE INDEX "cpv_idx_property_id" ON "contact_property_value" USING btree ("property_id");--> statement-breakpoint
CREATE INDEX "cpv_idx_organization_id" ON "contact_property_value" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "cpv_idx_user_id" ON "contact_property_value" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "domain_idx_domain" ON "domain" USING btree ("domain");--> statement-breakpoint
CREATE INDEX "domain_idx_user_id" ON "domain" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "domain_idx_organization_id" ON "domain" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "domain_idx_status" ON "domain" USING btree ("status");--> statement-breakpoint
CREATE INDEX "domain_idx_user_verified" ON "domain" USING btree ("user_verified");--> statement-breakpoint
CREATE INDEX "domain_idx_system_verified" ON "domain" USING btree ("system_verified");--> statement-breakpoint
CREATE INDEX "domain_idx_created_at" ON "domain" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "domain_idx_deleted_at" ON "domain" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "domain_idx_last_verified_at" ON "domain" USING btree ("last_verified_at");--> statement-breakpoint
CREATE INDEX "domain_idx_org_status" ON "domain" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "domain_idx_org_deleted" ON "domain" USING btree ("organization_id","deleted_at");--> statement-breakpoint
CREATE INDEX "domain_idx_user_status" ON "domain" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "domain_idx_status_verified" ON "domain" USING btree ("status","user_verified");--> statement-breakpoint
CREATE INDEX "domain_dns_record_idx_domain_id" ON "domain_dns_record" USING btree ("domain_id");--> statement-breakpoint
CREATE INDEX "domain_dns_record_idx_record_type" ON "domain_dns_record" USING btree ("record_type");--> statement-breakpoint
CREATE INDEX "domain_dns_record_idx_name" ON "domain_dns_record" USING btree ("name");--> statement-breakpoint
CREATE INDEX "domain_dns_record_idx_deleted_at" ON "domain_dns_record" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "domain_dns_record_idx_domain_type" ON "domain_dns_record" USING btree ("domain_id","record_type");--> statement-breakpoint
CREATE INDEX "email_event_idx_email_log_id" ON "email_event" USING btree ("email_log_id");--> statement-breakpoint
CREATE INDEX "email_event_idx_type" ON "email_event" USING btree ("type");--> statement-breakpoint
CREATE INDEX "email_event_idx_created_at" ON "email_event" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "email_log_idx_message_id" ON "email_log" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX "email_log_idx_organization_id" ON "email_log" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "email_log_idx_domain_id" ON "email_log" USING btree ("domain_id");--> statement-breakpoint
CREATE INDEX "email_log_idx_from_email" ON "email_log" USING btree ("from_email");--> statement-breakpoint
CREATE INDEX "email_log_idx_status" ON "email_log" USING btree ("status");--> statement-breakpoint
CREATE INDEX "email_log_idx_provider" ON "email_log" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "email_log_idx_sent_at" ON "email_log" USING btree ("sent_at");--> statement-breakpoint
CREATE INDEX "email_log_idx_created_at" ON "email_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "email_log_idx_org_status" ON "email_log" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "email_log_idx_domain_status" ON "email_log" USING btree ("domain_id","status");--> statement-breakpoint
CREATE INDEX "contact_group_idx_contact_id" ON "contact_group" USING btree ("contact_id");--> statement-breakpoint
CREATE INDEX "contact_group_idx_group_id" ON "contact_group" USING btree ("group_id");--> statement-breakpoint
CREATE INDEX "contact_group_idx_organization_id" ON "contact_group" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "group_idx_organization_id" ON "group" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "group_idx_name" ON "group" USING btree ("name");--> statement-breakpoint
CREATE INDEX "template_idx_organization_id" ON "template" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "template_idx_created_by" ON "template" USING btree ("created_by_user_id");--> statement-breakpoint
CREATE INDEX "template_idx_status" ON "template" USING btree ("status");--> statement-breakpoint
CREATE INDEX "template_idx_name" ON "template" USING btree ("name");--> statement-breakpoint
CREATE INDEX "template_idx_org_status" ON "template" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "template_idx_deleted_at" ON "template" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "template_version_idx_template_id" ON "template_version" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "template_version_idx_version" ON "template_version" USING btree ("version");--> statement-breakpoint
CREATE INDEX "topic_idx_organization_id" ON "topic" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "topic_idx_name" ON "topic" USING btree ("name");--> statement-breakpoint
CREATE INDEX "topic_idx_user_id" ON "topic" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "topic_enrollment_idx_contact_id" ON "topic_enrollment" USING btree ("contact_id");--> statement-breakpoint
CREATE INDEX "topic_enrollment_idx_topic_id" ON "topic_enrollment" USING btree ("topic_id");--> statement-breakpoint
CREATE INDEX "topic_enrollment_idx_organization_id" ON "topic_enrollment" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "topic_enrollment_idx_status" ON "topic_enrollment" USING btree ("status");--> statement-breakpoint
CREATE INDEX "upload_idx_user_id" ON "upload" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "upload_idx_deleted_at" ON "upload" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "upload_idx_filename" ON "upload" USING btree ("filename");--> statement-breakpoint
CREATE INDEX "webhook_idx_organization_id" ON "webhook" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "webhook_idx_user_id" ON "webhook" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "webhook_idx_status" ON "webhook" USING btree ("status");--> statement-breakpoint
CREATE INDEX "webhook_idx_deleted_at" ON "webhook" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "webhook_idx_org_status" ON "webhook" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "webhook_idx_org_deleted" ON "webhook" USING btree ("organization_id","deleted_at");--> statement-breakpoint
CREATE INDEX "webhook_idx_last_triggered" ON "webhook" USING btree ("last_triggered_at");--> statement-breakpoint
CREATE INDEX "webhook_delivery_idx_webhook_id" ON "webhook_delivery" USING btree ("webhook_id");--> statement-breakpoint
CREATE INDEX "webhook_delivery_idx_status" ON "webhook_delivery" USING btree ("status");--> statement-breakpoint
CREATE INDEX "webhook_delivery_idx_event_type" ON "webhook_delivery" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "webhook_delivery_idx_created_at" ON "webhook_delivery" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "webhook_delivery_idx_next_retry_at" ON "webhook_delivery" USING btree ("next_retry_at");--> statement-breakpoint
CREATE INDEX "webhook_delivery_idx_webhook_status" ON "webhook_delivery" USING btree ("webhook_id","status");--> statement-breakpoint
CREATE INDEX "webhook_delivery_idx_webhook_created" ON "webhook_delivery" USING btree ("webhook_id","created_at");--> statement-breakpoint
CREATE INDEX "webhook_delivery_idx_retry_pending" ON "webhook_delivery" USING btree ("status","next_retry_at");--> statement-breakpoint
CREATE INDEX "webhook_delivery_idx_event_instance" ON "webhook_delivery" USING btree ("webhook_event_id");--> statement-breakpoint
CREATE INDEX "webhook_event_idx_organization_id" ON "webhook_event" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "webhook_event_idx_event" ON "webhook_event" USING btree ("event");--> statement-breakpoint
CREATE INDEX "webhook_event_idx_source" ON "webhook_event" USING btree ("source");--> statement-breakpoint
CREATE INDEX "webhook_event_idx_user_id" ON "webhook_event" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "webhook_event_idx_created_at" ON "webhook_event" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "webhook_event_idx_org_event" ON "webhook_event" USING btree ("organization_id","event");--> statement-breakpoint
CREATE INDEX "webhook_event_subscription_idx_webhook_id" ON "webhook_event_subscription" USING btree ("webhook_id");--> statement-breakpoint
CREATE INDEX "webhook_event_subscription_idx_event_id" ON "webhook_event_subscription" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "webhook_event_subscription_idx_is_enabled" ON "webhook_event_subscription" USING btree ("is_enabled");--> statement-breakpoint
CREATE INDEX "webhook_event_subscription_idx_webhook_enabled" ON "webhook_event_subscription" USING btree ("webhook_id","is_enabled");