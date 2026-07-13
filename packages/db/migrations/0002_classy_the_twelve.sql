CREATE TYPE "public"."mailbox_status" AS ENUM('active', 'disabled');--> statement-breakpoint
CREATE TABLE "inbound_attachment" (
	"id" text PRIMARY KEY NOT NULL,
	"inbound_email_id" text NOT NULL,
	"filename" text NOT NULL,
	"content_type" varchar(255) NOT NULL,
	"size" integer NOT NULL,
	"storage_path" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inbound_email" (
	"id" text PRIMARY KEY NOT NULL,
	"mailbox_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"from_email" varchar(255) NOT NULL,
	"to_emails" text[] NOT NULL,
	"subject" text,
	"text_body" text,
	"html_body" text,
	"raw_message" text,
	"is_read" boolean DEFAULT false NOT NULL,
	"is_starred" boolean DEFAULT false NOT NULL,
	"message_id" text,
	"thread_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mailbox" (
	"id" text PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" text NOT NULL,
	"quota" text DEFAULT '5 GB' NOT NULL,
	"status" "mailbox_status" DEFAULT 'active' NOT NULL,
	"organization_id" text NOT NULL,
	"domain_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "mailbox_unique_email" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "inbound_attachment" ADD CONSTRAINT "inbound_attachment_inbound_email_id_inbound_email_id_fk" FOREIGN KEY ("inbound_email_id") REFERENCES "public"."inbound_email"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inbound_email" ADD CONSTRAINT "inbound_email_mailbox_id_mailbox_id_fk" FOREIGN KEY ("mailbox_id") REFERENCES "public"."mailbox"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inbound_email" ADD CONSTRAINT "inbound_email_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mailbox" ADD CONSTRAINT "mailbox_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mailbox" ADD CONSTRAINT "mailbox_domain_id_domain_id_fk" FOREIGN KEY ("domain_id") REFERENCES "public"."domain"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "inbound_attachment_idx_inbound_email_id" ON "inbound_attachment" USING btree ("inbound_email_id");--> statement-breakpoint
CREATE INDEX "inbound_email_idx_mailbox_id" ON "inbound_email" USING btree ("mailbox_id");--> statement-breakpoint
CREATE INDEX "inbound_email_idx_organization_id" ON "inbound_email" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "inbound_email_idx_from_email" ON "inbound_email" USING btree ("from_email");--> statement-breakpoint
CREATE INDEX "inbound_email_idx_created_at" ON "inbound_email" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "inbound_email_idx_thread_id" ON "inbound_email" USING btree ("thread_id");--> statement-breakpoint
CREATE INDEX "mailbox_idx_email" ON "mailbox" USING btree ("email");--> statement-breakpoint
CREATE INDEX "mailbox_idx_organization_id" ON "mailbox" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "mailbox_idx_domain_id" ON "mailbox" USING btree ("domain_id");