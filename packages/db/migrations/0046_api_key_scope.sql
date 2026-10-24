CREATE TABLE IF NOT EXISTS "api_key_scope" (
	"id" text PRIMARY KEY NOT NULL,
	"api_key_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"domain_id" text NOT NULL,
	"email" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "api_key_scope_unique_entry" UNIQUE NULLS NOT DISTINCT("api_key_id","domain_id","email")
);
--> statement-breakpoint
ALTER TABLE "api_key_scope" ADD CONSTRAINT "api_key_scope_api_key_id_apikey_id_fk" FOREIGN KEY ("api_key_id") REFERENCES "public"."apikey"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_key_scope" ADD CONSTRAINT "api_key_scope_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_key_scope" ADD CONSTRAINT "api_key_scope_domain_id_domain_id_fk" FOREIGN KEY ("domain_id") REFERENCES "public"."domain"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "api_key_scope_idx_api_key_id" ON "api_key_scope" USING btree ("api_key_id");--> statement-breakpoint
-- IMAP logins now use API keys; app passwords were never exposed to users.
DROP TABLE IF EXISTS "mail_app_password";
