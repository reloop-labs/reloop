ALTER TABLE "org_reputation_notice" ADD COLUMN "domain_id" text;--> statement-breakpoint
ALTER TABLE "org_reputation_notice" ADD CONSTRAINT "org_reputation_notice_domain_id_domain_id_fk" FOREIGN KEY ("domain_id") REFERENCES "public"."domain"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "org_reputation_notice_idx_domain_created" ON "org_reputation_notice" USING btree ("domain_id","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "org_sending_block_idx_domain_expires" ON "org_sending_block" USING btree ("domain_id","expires_at");
