CREATE TYPE "public"."dns_record_type" AS ENUM('A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SRV', 'CAA', 'SPF', 'DKIM', 'DMARC');--> statement-breakpoint
CREATE TYPE "public"."domain_status" AS ENUM('start-verify', 'verifying', 'active', 'suspended', 'failed');--> statement-breakpoint
CREATE TYPE "public"."domain_type" AS ENUM('custom', 'subdomain', 'system');--> statement-breakpoint
CREATE TYPE "public"."email_folder" AS ENUM('inbox', 'sent', 'drafts', 'trash', 'spam', 'archive', 'custom');--> statement-breakpoint
CREATE TYPE "public"."email_priority" AS ENUM('low', 'normal', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."email_status" AS ENUM('pending', 'sent', 'delivered', 'failed', 'bounced', 'spam', 'archived');--> statement-breakpoint
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
CREATE TABLE "apikey" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"start" text,
	"prefix" text,
	"key" text NOT NULL,
	"user_id" text NOT NULL,
	"refill_interval" integer,
	"refill_amount" integer,
	"last_refill_at" timestamp,
	"enabled" boolean DEFAULT true,
	"rate_limit_enabled" boolean DEFAULT true,
	"rate_limit_time_window" integer DEFAULT 86400000,
	"rate_limit_max" integer DEFAULT 10,
	"request_count" integer DEFAULT 0,
	"remaining" integer,
	"last_request" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"permissions" text,
	"metadata" text
);
--> statement-breakpoint
CREATE TABLE "invitation" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"email" text NOT NULL,
	"role" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"inviter_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jwks" (
	"id" text PRIMARY KEY NOT NULL,
	"public_key" text NOT NULL,
	"private_key" text NOT NULL,
	"created_at" timestamp NOT NULL
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
	"slug" text,
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
CREATE TABLE "domain" (
	"id" text PRIMARY KEY NOT NULL,
	"domain" varchar(255) NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"domain_type" "domain_type" DEFAULT 'custom' NOT NULL,
	"status" "domain_status" DEFAULT 'start-verify' NOT NULL,
	"user_verified" boolean DEFAULT false NOT NULL,
	"system_verified" boolean DEFAULT false NOT NULL,
	"dns_configured" boolean DEFAULT false NOT NULL,
	"nameservers" jsonb,
	"spf_record" text,
	"dkim_record" text,
	"dkim_selector" varchar(255) DEFAULT 'reloop' NOT NULL,
	"dmarc_record" text,
	"dmarc_policy" varchar(50) DEFAULT 'none' NOT NULL,
	"tracking_domain" boolean DEFAULT false NOT NULL,
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
	"value" text NOT NULL,
	"ttl" integer DEFAULT 3600 NOT NULL,
	"priority" integer,
	"weight" integer,
	"port" integer,
	"description" text,
	"is_verified" boolean DEFAULT false NOT NULL,
	"verification_error" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "domain_dns_record_unique_record" UNIQUE("domain_id","record_type","name","value")
);
--> statement-breakpoint
CREATE TABLE "mailbox" (
	"username" varchar(255) PRIMARY KEY NOT NULL,
	"password" varchar(255) NOT NULL,
	"password_encode" varchar(255) NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"is_admin" boolean NOT NULL,
	"mail_dir" varchar(255) NOT NULL,
	"quota" bigint NOT NULL,
	"local_part" varchar(255) NOT NULL,
	"domain_id" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mailbox_attachment" (
	"id" text PRIMARY KEY NOT NULL,
	"message_id" text NOT NULL,
	"filename" varchar(500) NOT NULL,
	"mime_type" varchar(255) NOT NULL,
	"size" bigint NOT NULL,
	"content_id" varchar(255),
	"storage_path" text NOT NULL,
	"storage_url" text,
	"is_inline" boolean DEFAULT false NOT NULL,
	"checksum" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mailbox_message" (
	"id" text PRIMARY KEY NOT NULL,
	"message_id" varchar(500) NOT NULL,
	"in_reply_to" varchar(500),
	"references" text,
	"mailbox_username" varchar(255) NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"from_email" varchar(255) NOT NULL,
	"from_name" varchar(255),
	"to_emails" jsonb NOT NULL,
	"cc_emails" jsonb,
	"bcc_emails" jsonb,
	"reply_to" varchar(255),
	"subject" text NOT NULL,
	"text_body" text,
	"html_body" text,
	"snippet" varchar(500),
	"status" "email_status" DEFAULT 'pending' NOT NULL,
	"priority" "email_priority" DEFAULT 'normal' NOT NULL,
	"folder" "email_folder" DEFAULT 'inbox' NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"is_starred" boolean DEFAULT false NOT NULL,
	"has_attachments" boolean DEFAULT false NOT NULL,
	"is_draft" boolean DEFAULT false NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"is_spam" boolean DEFAULT false NOT NULL,
	"size" bigint NOT NULL,
	"attachment_count" integer DEFAULT 0 NOT NULL,
	"headers" jsonb,
	"labels" jsonb,
	"thread_id" text,
	"sent_at" timestamp,
	"received_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "mailbox_message_message_id_unique" UNIQUE("message_id")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "apikey" ADD CONSTRAINT "apikey_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_inviter_id_user_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "domain" ADD CONSTRAINT "domain_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "domain" ADD CONSTRAINT "domain_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "domain_dns_record" ADD CONSTRAINT "domain_dns_record_domain_id_domain_id_fk" FOREIGN KEY ("domain_id") REFERENCES "public"."domain"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "domain_dns_record" ADD CONSTRAINT "domain_dns_record_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "domain_dns_record" ADD CONSTRAINT "domain_dns_record_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mailbox" ADD CONSTRAINT "mailbox_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mailbox" ADD CONSTRAINT "mailbox_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mailbox" ADD CONSTRAINT "mailbox_domain_id_domain_id_fk" FOREIGN KEY ("domain_id") REFERENCES "public"."domain"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mailbox_attachment" ADD CONSTRAINT "mailbox_attachment_message_id_mailbox_message_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."mailbox_message"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mailbox_message" ADD CONSTRAINT "mailbox_message_mailbox_username_mailbox_username_fk" FOREIGN KEY ("mailbox_username") REFERENCES "public"."mailbox"("username") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mailbox_message" ADD CONSTRAINT "mailbox_message_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mailbox_message" ADD CONSTRAINT "mailbox_message_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "domain_idx_domain" ON "domain" USING btree ("domain");--> statement-breakpoint
CREATE INDEX "domain_idx_user_id" ON "domain" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "domain_idx_organization_id" ON "domain" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "domain_idx_status" ON "domain" USING btree ("status");--> statement-breakpoint
CREATE INDEX "domain_idx_user_verified" ON "domain" USING btree ("user_verified");--> statement-breakpoint
CREATE INDEX "domain_idx_system_verified" ON "domain" USING btree ("system_verified");--> statement-breakpoint
CREATE INDEX "domain_idx_dns_configured" ON "domain" USING btree ("dns_configured");--> statement-breakpoint
CREATE INDEX "domain_idx_created_at" ON "domain" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "domain_idx_deleted_at" ON "domain" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "domain_idx_org_status" ON "domain" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "domain_idx_org_deleted" ON "domain" USING btree ("organization_id","deleted_at");--> statement-breakpoint
CREATE INDEX "domain_idx_user_status" ON "domain" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "domain_idx_status_verified" ON "domain" USING btree ("status","user_verified");--> statement-breakpoint
CREATE INDEX "domain_dns_record_idx_domain_id" ON "domain_dns_record" USING btree ("domain_id");--> statement-breakpoint
CREATE INDEX "domain_dns_record_idx_record_type" ON "domain_dns_record" USING btree ("record_type");--> statement-breakpoint
CREATE INDEX "domain_dns_record_idx_name" ON "domain_dns_record" USING btree ("name");--> statement-breakpoint
CREATE INDEX "domain_dns_record_idx_is_verified" ON "domain_dns_record" USING btree ("is_verified");--> statement-breakpoint
CREATE INDEX "domain_dns_record_idx_deleted_at" ON "domain_dns_record" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "domain_dns_record_idx_domain_type" ON "domain_dns_record" USING btree ("domain_id","record_type");--> statement-breakpoint
CREATE INDEX "domain_dns_record_idx_domain_verified" ON "domain_dns_record" USING btree ("domain_id","is_verified");--> statement-breakpoint
CREATE INDEX "domain_dns_record_idx_domain_active" ON "domain_dns_record" USING btree ("domain_id","is_active");--> statement-breakpoint
CREATE INDEX "mailbox_idx_mailbox_domain_id" ON "mailbox" USING btree ("domain_id");--> statement-breakpoint
CREATE INDEX "mailbox_idx_mailbox_created_at" ON "mailbox" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "mailbox_idx_mailbox_organization_id" ON "mailbox" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "mailbox_idx_mailbox_user_id" ON "mailbox" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "mailbox_attachment_idx_message_id" ON "mailbox_attachment" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX "mailbox_attachment_idx_filename" ON "mailbox_attachment" USING btree ("filename");--> statement-breakpoint
CREATE INDEX "mailbox_attachment_idx_mime_type" ON "mailbox_attachment" USING btree ("mime_type");--> statement-breakpoint
CREATE INDEX "mailbox_message_idx_mailbox_username" ON "mailbox_message" USING btree ("mailbox_username");--> statement-breakpoint
CREATE INDEX "mailbox_message_idx_message_id" ON "mailbox_message" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX "mailbox_message_idx_from_email" ON "mailbox_message" USING btree ("from_email");--> statement-breakpoint
CREATE INDEX "mailbox_message_idx_organization_id" ON "mailbox_message" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "mailbox_message_idx_user_id" ON "mailbox_message" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "mailbox_message_idx_status" ON "mailbox_message" USING btree ("status");--> statement-breakpoint
CREATE INDEX "mailbox_message_idx_folder" ON "mailbox_message" USING btree ("folder");--> statement-breakpoint
CREATE INDEX "mailbox_message_idx_is_read" ON "mailbox_message" USING btree ("is_read");--> statement-breakpoint
CREATE INDEX "mailbox_message_idx_is_starred" ON "mailbox_message" USING btree ("is_starred");--> statement-breakpoint
CREATE INDEX "mailbox_message_idx_is_deleted" ON "mailbox_message" USING btree ("is_deleted");--> statement-breakpoint
CREATE INDEX "mailbox_message_idx_sent_at" ON "mailbox_message" USING btree ("sent_at");--> statement-breakpoint
CREATE INDEX "mailbox_message_idx_received_at" ON "mailbox_message" USING btree ("received_at");--> statement-breakpoint
CREATE INDEX "mailbox_message_idx_deleted_at" ON "mailbox_message" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "mailbox_message_idx_thread_id" ON "mailbox_message" USING btree ("thread_id");--> statement-breakpoint
CREATE INDEX "mailbox_message_idx_in_reply_to" ON "mailbox_message" USING btree ("in_reply_to");--> statement-breakpoint
CREATE INDEX "mailbox_message_idx_mailbox_folder" ON "mailbox_message" USING btree ("mailbox_username","folder");--> statement-breakpoint
CREATE INDEX "mailbox_message_idx_mailbox_status" ON "mailbox_message" USING btree ("mailbox_username","status");--> statement-breakpoint
CREATE INDEX "mailbox_message_idx_mailbox_received" ON "mailbox_message" USING btree ("mailbox_username","received_at");--> statement-breakpoint
CREATE INDEX "mailbox_message_idx_from_received" ON "mailbox_message" USING btree ("from_email","received_at");--> statement-breakpoint
CREATE INDEX "mailbox_message_idx_folder_read" ON "mailbox_message" USING btree ("folder","is_read");