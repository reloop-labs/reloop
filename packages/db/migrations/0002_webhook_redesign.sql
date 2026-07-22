ALTER TABLE "webhook_event" ADD COLUMN "idempotency_key" text;--> statement-breakpoint
ALTER TABLE "webhook_delivery" ADD COLUMN "replay_of_delivery_id" text;--> statement-breakpoint
ALTER TABLE "webhook_delivery" ALTER COLUMN "attempt_number" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "webhook_delivery" ALTER COLUMN "max_attempts" SET DEFAULT 7;--> statement-breakpoint
CREATE UNIQUE INDEX "webhook_event_uidx_idempotency_key" ON "webhook_event" USING btree ("idempotency_key") WHERE "idempotency_key" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "webhook_event_idx_idempotency_key" ON "webhook_event" USING btree ("idempotency_key");--> statement-breakpoint
CREATE INDEX "webhook_delivery_idx_replay_of" ON "webhook_delivery" USING btree ("replay_of_delivery_id");
