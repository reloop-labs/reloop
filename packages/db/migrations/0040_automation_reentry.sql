DO $$ BEGIN
 CREATE TYPE "public"."automation_reentry" AS ENUM('once', 'restart', 'parallel');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
ALTER TABLE "automation" ADD COLUMN IF NOT EXISTS "reentry" "automation_reentry" DEFAULT 'once' NOT NULL;--> statement-breakpoint
ALTER TABLE "automation_enrollment" ADD COLUMN IF NOT EXISTS "replaced_by_enrollment_id" text;--> statement-breakpoint
ALTER TABLE "automation_enrollment" DROP CONSTRAINT IF EXISTS "automation_enrollment_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "automation_enrollment_unique";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "automation_enrollment_idx_automation_contact" ON "automation_enrollment" USING btree ("automation_id","contact_id");
