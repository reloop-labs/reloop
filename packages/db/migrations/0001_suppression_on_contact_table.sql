-- Drop the old standalone suppression_list table (replaced by columns on contact)
DROP TABLE IF EXISTS "suppression_list";--> statement-breakpoint
-- The suppression_reason enum already exists from a prior migration, so no CREATE TYPE needed
ALTER TABLE "contact" ADD COLUMN IF NOT EXISTS "suppression_reason" "suppression_reason";--> statement-breakpoint
ALTER TABLE "contact" ADD COLUMN IF NOT EXISTS "suppressed_at" timestamp;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "contact_idx_suppression_reason" ON "contact" USING btree ("suppression_reason");