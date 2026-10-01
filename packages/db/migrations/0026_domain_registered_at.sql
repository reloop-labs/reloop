-- Restore registrar-age columns dropped by 0021. Production still holds
-- ~119 domains of history here, so this must never DROP — IF NOT EXISTS
-- converges both worlds (prod where they exist, dev where 0021 removed them).
ALTER TABLE "domain" ADD COLUMN IF NOT EXISTS "registered_at" timestamp;--> statement-breakpoint
ALTER TABLE "domain" ADD COLUMN IF NOT EXISTS "registration_age_checked_at" timestamp;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "domain_idx_registered_at" ON "domain" USING btree ("registered_at");
