ALTER TABLE "email_log" ADD COLUMN "idempotency_key" varchar(500);--> statement-breakpoint
CREATE UNIQUE INDEX "email_log_uidx_org_idempotency_key" ON "email_log" USING btree ("organization_id","idempotency_key") WHERE "idempotency_key" IS NOT NULL;
