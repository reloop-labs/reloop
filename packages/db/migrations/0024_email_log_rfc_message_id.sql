ALTER TABLE "email_log" ADD COLUMN "rfc_message_id" varchar(500);--> statement-breakpoint
CREATE INDEX "email_log_idx_rfc_message_id" ON "email_log" USING btree ("rfc_message_id");--> statement-breakpoint
CREATE INDEX "email_log_idx_provider_message_id" ON "email_log" USING btree ("provider_message_id");--> statement-breakpoint
UPDATE "email_log" SET "rfc_message_id" = "message_id" WHERE "rfc_message_id" IS NULL AND "message_id" LIKE '%@%';
