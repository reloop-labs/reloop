ALTER TABLE "email_thread" ADD COLUMN "is_pinned" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "email_thread" ADD COLUMN "pinned_at" timestamp;--> statement-breakpoint
CREATE INDEX "email_thread_idx_mailbox_is_pinned" ON "email_thread" USING btree ("mailbox_id","is_pinned");