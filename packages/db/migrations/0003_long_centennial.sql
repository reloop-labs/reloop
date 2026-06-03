CREATE TYPE "public"."message_direction" AS ENUM('inbound', 'outbound');--> statement-breakpoint
CREATE TYPE "public"."thread_status" AS ENUM('active', 'archived', 'closed');--> statement-breakpoint
CREATE TABLE "email_thread" (
	"id" text PRIMARY KEY NOT NULL,
	"mailbox_id" text,
	"organization_id" text NOT NULL,
	"subject" text,
	"last_message_preview" text,
	"last_message_at" timestamp DEFAULT now() NOT NULL,
	"status" "thread_status" DEFAULT 'active' NOT NULL,
	"message_count" integer DEFAULT 0 NOT NULL,
	"participants" jsonb DEFAULT '[]'::jsonb,
	"is_read" boolean DEFAULT false NOT NULL,
	"is_starred" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "thread_message" (
	"id" text PRIMARY KEY NOT NULL,
	"thread_id" text NOT NULL,
	"direction" "message_direction" NOT NULL,
	"inbound_email_id" text,
	"email_log_id" text,
	"from_email" varchar(255) NOT NULL,
	"from_name" varchar(255),
	"subject" text,
	"preview" text,
	"message_at" timestamp DEFAULT now() NOT NULL,
	"rfc822_message_id" text,
	"in_reply_to" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "email_thread" ADD CONSTRAINT "email_thread_mailbox_id_mailbox_id_fk" FOREIGN KEY ("mailbox_id") REFERENCES "public"."mailbox"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_thread" ADD CONSTRAINT "email_thread_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "thread_message" ADD CONSTRAINT "thread_message_thread_id_email_thread_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."email_thread"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "thread_message" ADD CONSTRAINT "thread_message_inbound_email_id_inbound_email_id_fk" FOREIGN KEY ("inbound_email_id") REFERENCES "public"."inbound_email"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "thread_message" ADD CONSTRAINT "thread_message_email_log_id_email_log_id_fk" FOREIGN KEY ("email_log_id") REFERENCES "public"."email_log"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "email_thread_idx_mailbox_id" ON "email_thread" USING btree ("mailbox_id");--> statement-breakpoint
CREATE INDEX "email_thread_idx_organization_id" ON "email_thread" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "email_thread_idx_last_message_at" ON "email_thread" USING btree ("last_message_at");--> statement-breakpoint
CREATE INDEX "email_thread_idx_status" ON "email_thread" USING btree ("status");--> statement-breakpoint
CREATE INDEX "email_thread_idx_org_status" ON "email_thread" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "email_thread_idx_mailbox_last_msg" ON "email_thread" USING btree ("mailbox_id","last_message_at");--> statement-breakpoint
CREATE INDEX "thread_message_idx_thread_id" ON "thread_message" USING btree ("thread_id");--> statement-breakpoint
CREATE INDEX "thread_message_idx_inbound_email_id" ON "thread_message" USING btree ("inbound_email_id");--> statement-breakpoint
CREATE INDEX "thread_message_idx_email_log_id" ON "thread_message" USING btree ("email_log_id");--> statement-breakpoint
CREATE INDEX "thread_message_idx_rfc822_message_id" ON "thread_message" USING btree ("rfc822_message_id");--> statement-breakpoint
CREATE INDEX "thread_message_idx_thread_message_at" ON "thread_message" USING btree ("thread_id","message_at");