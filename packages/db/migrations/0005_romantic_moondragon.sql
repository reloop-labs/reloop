CREATE TYPE "public"."dns_record_type_name" AS ENUM('MX', 'SPF', 'DKIM', 'DMARC');--> statement-breakpoint
CREATE TYPE "public"."template_block_type" AS ENUM('heading', 'text', 'button', 'image', 'divider', 'spacer', 'section', 'container', 'columns', 'html');--> statement-breakpoint
CREATE TYPE "public"."template_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('subscribed', 'unsubscribed');--> statement-breakpoint
CREATE TABLE "contact" (
	"id" text PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"first_name" varchar(255),
	"last_name" varchar(255),
	"organization_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
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
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "topic_subscription" (
	"id" text PRIMARY KEY NOT NULL,
	"contact_id" text NOT NULL,
	"topic_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"status" "subscription_status" DEFAULT 'subscribed' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "topic_subscription_unique" UNIQUE("contact_id","topic_id")
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
ALTER TABLE "audience" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "audience_group" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "mailbox" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "mailbox_attachment" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "mailbox_message" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "audience" CASCADE;--> statement-breakpoint
DROP TABLE "audience_group" CASCADE;--> statement-breakpoint
DROP TABLE "mailbox" CASCADE;--> statement-breakpoint
DROP TABLE "mailbox_attachment" CASCADE;--> statement-breakpoint
DROP TABLE "mailbox_message" CASCADE;--> statement-breakpoint
ALTER TABLE "domain_dns_record" ALTER COLUMN "record_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."dns_record_type";--> statement-breakpoint
CREATE TYPE "public"."dns_record_type" AS ENUM('A', 'AAAA', 'CNAME', 'MX', 'TXT');--> statement-breakpoint
ALTER TABLE "domain_dns_record" ALTER COLUMN "record_type" SET DATA TYPE "public"."dns_record_type" USING "record_type"::"public"."dns_record_type";--> statement-breakpoint
DROP INDEX "domain_idx_dns_configured";--> statement-breakpoint
DROP INDEX "domain_dns_record_idx_is_verified";--> statement-breakpoint
DROP INDEX "domain_dns_record_idx_domain_verified";--> statement-breakpoint
DROP INDEX "domain_dns_record_idx_domain_active";--> statement-breakpoint
ALTER TABLE "apikey" ALTER COLUMN "enabled" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "apikey" ALTER COLUMN "rate_limit_enabled" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "apikey" ALTER COLUMN "rate_limit_time_window" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "apikey" ALTER COLUMN "rate_limit_max" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "apikey" ALTER COLUMN "request_count" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "organization" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "domain_dns_record" ALTER COLUMN "ttl" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "domain_dns_record" ALTER COLUMN "ttl" SET DEFAULT 'Auto';--> statement-breakpoint
ALTER TABLE "apikey" ADD COLUMN "organization_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "invitation" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "jwks" ADD COLUMN "expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "domain_dns_record" ADD COLUMN "record_type_name" "dns_record_type_name" NOT NULL;--> statement-breakpoint
ALTER TABLE "domain_dns_record" ADD COLUMN "private_key" text;--> statement-breakpoint
ALTER TABLE "contact" ADD CONSTRAINT "contact_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_log" ADD CONSTRAINT "email_log_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_log" ADD CONSTRAINT "email_log_domain_id_domain_id_fk" FOREIGN KEY ("domain_id") REFERENCES "public"."domain"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template" ADD CONSTRAINT "template_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template" ADD CONSTRAINT "template_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_version" ADD CONSTRAINT "template_version_template_id_template_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."template"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_version" ADD CONSTRAINT "template_version_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topic" ADD CONSTRAINT "topic_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topic_subscription" ADD CONSTRAINT "topic_subscription_contact_id_contact_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contact"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topic_subscription" ADD CONSTRAINT "topic_subscription_topic_id_topic_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topic"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topic_subscription" ADD CONSTRAINT "topic_subscription_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "upload" ADD CONSTRAINT "upload_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "contact_idx_email" ON "contact" USING btree ("email");--> statement-breakpoint
CREATE INDEX "contact_idx_organization_id" ON "contact" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "contact_idx_org_email" ON "contact" USING btree ("organization_id","email");--> statement-breakpoint
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
CREATE INDEX "topic_subscription_idx_contact_id" ON "topic_subscription" USING btree ("contact_id");--> statement-breakpoint
CREATE INDEX "topic_subscription_idx_topic_id" ON "topic_subscription" USING btree ("topic_id");--> statement-breakpoint
CREATE INDEX "topic_subscription_idx_organization_id" ON "topic_subscription" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "topic_subscription_idx_status" ON "topic_subscription" USING btree ("status");--> statement-breakpoint
CREATE INDEX "upload_idx_user_id" ON "upload" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "upload_idx_deleted_at" ON "upload" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "upload_idx_filename" ON "upload" USING btree ("filename");--> statement-breakpoint
ALTER TABLE "apikey" ADD CONSTRAINT "apikey_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "apikey_key_idx" ON "apikey" USING btree ("key");--> statement-breakpoint
CREATE INDEX "apikey_userId_idx" ON "apikey" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "apikey_organizationId_idx" ON "apikey" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "invitation_organizationId_idx" ON "invitation" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "invitation_email_idx" ON "invitation" USING btree ("email");--> statement-breakpoint
CREATE INDEX "member_organizationId_idx" ON "member" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "member_userId_idx" ON "member" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "domain_idx_last_verified_at" ON "domain" USING btree ("last_verified_at");--> statement-breakpoint
ALTER TABLE "domain" DROP COLUMN "dns_configured";--> statement-breakpoint
ALTER TABLE "domain" DROP COLUMN "nameservers";--> statement-breakpoint
ALTER TABLE "domain" DROP COLUMN "spf_record";--> statement-breakpoint
ALTER TABLE "domain" DROP COLUMN "dkim_record";--> statement-breakpoint
ALTER TABLE "domain" DROP COLUMN "dkim_selector";--> statement-breakpoint
ALTER TABLE "domain" DROP COLUMN "dmarc_record";--> statement-breakpoint
ALTER TABLE "domain" DROP COLUMN "dmarc_policy";--> statement-breakpoint
ALTER TABLE "domain_dns_record" DROP COLUMN "weight";--> statement-breakpoint
ALTER TABLE "domain_dns_record" DROP COLUMN "port";--> statement-breakpoint
ALTER TABLE "domain_dns_record" DROP COLUMN "description";--> statement-breakpoint
ALTER TABLE "domain_dns_record" DROP COLUMN "is_verified";--> statement-breakpoint
ALTER TABLE "domain_dns_record" DROP COLUMN "is_active";--> statement-breakpoint
DROP TYPE "public"."audience_status";--> statement-breakpoint
DROP TYPE "public"."email_folder";