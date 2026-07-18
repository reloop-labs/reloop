CREATE TYPE "public"."compose_draft_kind" AS ENUM('compose', 'reply', 'reply_all', 'forward');--> statement-breakpoint
ALTER TABLE "compose_draft" ADD COLUMN "kind" "compose_draft_kind" DEFAULT 'compose' NOT NULL;--> statement-breakpoint
ALTER TABLE "compose_draft" ADD COLUMN "thread_id" text;--> statement-breakpoint
ALTER TABLE "compose_draft" ADD COLUMN "in_reply_to_message_id" text;--> statement-breakpoint
CREATE INDEX "compose_draft_idx_mailbox_thread_kind" ON "compose_draft" USING btree ("mailbox_id","thread_id","kind");
