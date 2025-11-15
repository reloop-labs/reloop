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
ALTER TABLE "mailbox" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "mailbox_attachment" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "mailbox_message" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "mailbox" CASCADE;--> statement-breakpoint
DROP TABLE "mailbox_attachment" CASCADE;--> statement-breakpoint
DROP TABLE "mailbox_message" CASCADE;--> statement-breakpoint
ALTER TABLE "apikey" ADD COLUMN "organization_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "domain" ADD COLUMN "dkim_private_key" text;--> statement-breakpoint
ALTER TABLE "email_log" ADD CONSTRAINT "email_log_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_log" ADD CONSTRAINT "email_log_domain_id_domain_id_fk" FOREIGN KEY ("domain_id") REFERENCES "public"."domain"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
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
ALTER TABLE "apikey" ADD CONSTRAINT "apikey_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "domain_idx_last_verified_at" ON "domain" USING btree ("last_verified_at");--> statement-breakpoint
DROP TYPE "public"."email_folder";