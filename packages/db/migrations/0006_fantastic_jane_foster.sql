CREATE TYPE "public"."pending_outbound_status" AS ENUM('pending', 'cancelled', 'sent', 'failed');--> statement-breakpoint
CREATE TABLE "compose_draft" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"mailbox_id" text NOT NULL,
	"to" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"cc" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"bcc" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"subject" text DEFAULT '' NOT NULL,
	"html" text DEFAULT '' NOT NULL,
	"text" text DEFAULT '' NOT NULL,
	"attachments" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pending_outbound_email" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"mailbox_id" text NOT NULL,
	"status" "pending_outbound_status" DEFAULT 'pending' NOT NULL,
	"send_at" timestamp NOT NULL,
	"payload" jsonb NOT NULL,
	"error" text,
	"mail_message_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "compose_draft" ADD CONSTRAINT "compose_draft_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compose_draft" ADD CONSTRAINT "compose_draft_mailbox_id_mailbox_id_fk" FOREIGN KEY ("mailbox_id") REFERENCES "public"."mailbox"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pending_outbound_email" ADD CONSTRAINT "pending_outbound_email_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pending_outbound_email" ADD CONSTRAINT "pending_outbound_email_mailbox_id_mailbox_id_fk" FOREIGN KEY ("mailbox_id") REFERENCES "public"."mailbox"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "compose_draft_idx_org" ON "compose_draft" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "compose_draft_idx_mailbox" ON "compose_draft" USING btree ("mailbox_id");--> statement-breakpoint
CREATE INDEX "compose_draft_idx_updated" ON "compose_draft" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "pending_outbound_idx_org" ON "pending_outbound_email" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "pending_outbound_idx_status_send_at" ON "pending_outbound_email" USING btree ("status","send_at");