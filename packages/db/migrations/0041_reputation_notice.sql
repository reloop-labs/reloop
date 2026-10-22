CREATE TABLE IF NOT EXISTS "org_reputation_notice" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"level" smallint NOT NULL,
	"reason" "sending_block_reason" NOT NULL,
	"sent_count" integer DEFAULT 0 NOT NULL,
	"bounced_count" integer DEFAULT 0 NOT NULL,
	"complaint_count" integer DEFAULT 0 NOT NULL,
	"bounce_rate" real DEFAULT 0 NOT NULL,
	"complaint_rate" real DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "org_reputation_notice" ADD CONSTRAINT "org_reputation_notice_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "org_reputation_notice_idx_org_created" ON "org_reputation_notice" USING btree ("organization_id","created_at");
