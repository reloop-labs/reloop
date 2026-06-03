CREATE TYPE "public"."inbound_email_status" AS ENUM('received', 'processing', 'delivered', 'spam', 'rejected', 'failed');--> statement-breakpoint
ALTER TABLE "inbound_attachment" ADD COLUMN "content_disposition" varchar(50) DEFAULT 'attachment';--> statement-breakpoint
ALTER TABLE "inbound_attachment" ADD COLUMN "content_id" text;--> statement-breakpoint
ALTER TABLE "inbound_attachment" ADD COLUMN "checksum" varchar(128);--> statement-breakpoint
ALTER TABLE "inbound_email" ADD COLUMN "from_name" varchar(255);--> statement-breakpoint
ALTER TABLE "inbound_email" ADD COLUMN "cc_emails" jsonb;--> statement-breakpoint
ALTER TABLE "inbound_email" ADD COLUMN "bcc_emails" jsonb;--> statement-breakpoint
ALTER TABLE "inbound_email" ADD COLUMN "reply_to" varchar(255);--> statement-breakpoint
ALTER TABLE "inbound_email" ADD COLUMN "snippet" varchar(300);--> statement-breakpoint
ALTER TABLE "inbound_email" ADD COLUMN "size" bigint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "inbound_email" ADD COLUMN "status" "inbound_email_status" DEFAULT 'received' NOT NULL;--> statement-breakpoint
ALTER TABLE "inbound_email" ADD COLUMN "is_spam" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "inbound_email" ADD COLUMN "spam_score" real;--> statement-breakpoint
ALTER TABLE "inbound_email" ADD COLUMN "in_reply_to" text;--> statement-breakpoint
ALTER TABLE "inbound_email" ADD COLUMN "references" jsonb;--> statement-breakpoint
ALTER TABLE "inbound_email" ADD COLUMN "headers" jsonb;--> statement-breakpoint
ALTER TABLE "inbound_email" ADD COLUMN "date" timestamp;--> statement-breakpoint
ALTER TABLE "mailbox" ADD COLUMN "display_name" varchar(255);--> statement-breakpoint
ALTER TABLE "mailbox" ADD COLUMN "description" text;--> statement-breakpoint
CREATE INDEX "inbound_email_idx_status" ON "inbound_email" USING btree ("status");--> statement-breakpoint
CREATE INDEX "inbound_email_idx_is_spam" ON "inbound_email" USING btree ("is_spam");--> statement-breakpoint
CREATE INDEX "inbound_email_idx_message_id" ON "inbound_email" USING btree ("message_id");