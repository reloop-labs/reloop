DO $$ BEGIN
  CREATE TYPE "public"."startup_application_status" AS ENUM('pending', 'approved', 'rejected', 'contacted');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "startup_application" (
  "id" text PRIMARY KEY NOT NULL,
  "email" text NOT NULL,
  "full_name" text NOT NULL,
  "company" text NOT NULL,
  "website" text,
  "role" text,
  "monthly_volume" text,
  "use_case" text NOT NULL,
  "status" "startup_application_status" DEFAULT 'pending' NOT NULL,
  "reviewed_at" timestamp,
  "review_note" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "startup_application_email_idx" ON "startup_application" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "startup_application_status_idx" ON "startup_application" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "startup_application_created_idx" ON "startup_application" USING btree ("created_at");
