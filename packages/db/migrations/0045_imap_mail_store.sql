DO $$ BEGIN CREATE TYPE "public"."mail_account_status" AS ENUM('active', 'disabled'); EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mail_account" (
	"id" text PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"display_name" varchar(255),
	"status" "mail_account_status" DEFAULT 'active' NOT NULL,
	"quota_bytes" bigint DEFAULT 5368709120 NOT NULL,
	"organization_id" text NOT NULL,
	"domain_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "mail_account_unique_email" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mail_app_password" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"label" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"last_used_at" timestamp,
	"revoked_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mail_folder" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"name" varchar(512) NOT NULL,
	"special_use" varchar(32),
	"subscribed" boolean DEFAULT true NOT NULL,
	"uid_validity" bigint NOT NULL,
	"uid_next" bigint DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "mail_folder_unique_name" UNIQUE("account_id","name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mail_message" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"folder_id" text NOT NULL,
	"uid" bigint NOT NULL,
	"flags" text[] DEFAULT '{}'::text[] NOT NULL,
	"internal_date" timestamp with time zone DEFAULT now() NOT NULL,
	"size" bigint NOT NULL,
	"raw" "bytea" NOT NULL,
	"message_id" text,
	"subject" text,
	"from_email" varchar(255),
	"sent_at" timestamp with time zone,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "mail_message_unique_uid" UNIQUE("folder_id","uid")
);
--> statement-breakpoint
ALTER TABLE "mail_account" ADD CONSTRAINT "mail_account_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mail_account" ADD CONSTRAINT "mail_account_domain_id_domain_id_fk" FOREIGN KEY ("domain_id") REFERENCES "public"."domain"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mail_app_password" ADD CONSTRAINT "mail_app_password_account_id_mail_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."mail_account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mail_folder" ADD CONSTRAINT "mail_folder_account_id_mail_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."mail_account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mail_message" ADD CONSTRAINT "mail_message_account_id_mail_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."mail_account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mail_message" ADD CONSTRAINT "mail_message_folder_id_mail_folder_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."mail_folder"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "mail_account_idx_organization_id" ON "mail_account" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "mail_account_idx_domain_id" ON "mail_account" USING btree ("domain_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "mail_app_password_idx_account_id" ON "mail_app_password" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "mail_message_idx_account_id" ON "mail_message" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "mail_message_idx_message_id" ON "mail_message" USING btree ("message_id");
