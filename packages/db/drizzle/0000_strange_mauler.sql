CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "apikey" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"start" text,
	"prefix" text,
	"key" text NOT NULL,
	"user_id" text NOT NULL,
	"refill_interval" integer,
	"refill_amount" integer,
	"last_refill_at" timestamp,
	"enabled" boolean DEFAULT true,
	"rate_limit_enabled" boolean DEFAULT true,
	"rate_limit_time_window" integer DEFAULT 86400000,
	"rate_limit_max" integer DEFAULT 10,
	"request_count" integer DEFAULT 0,
	"remaining" integer,
	"last_request" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"permissions" text,
	"metadata" text
);
--> statement-breakpoint
CREATE TABLE "invitation" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"email" text NOT NULL,
	"role" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"inviter_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jwks" (
	"id" text PRIMARY KEY NOT NULL,
	"public_key" text NOT NULL,
	"private_key" text NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "member" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text,
	"logo" text,
	"created_at" timestamp NOT NULL,
	"metadata" text,
	CONSTRAINT "organization_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"role" text,
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	"ban_expires" timestamp,
	"active_organization_id" text,
	"mode" text DEFAULT 'dev',
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alias_domain" (
	"alias_domain" varchar(255) PRIMARY KEY NOT NULL,
	"target_domain" varchar(255) NOT NULL,
	"user_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"active" boolean NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dkim_keys" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"alias_domain" varchar(255) NOT NULL,
	"selector" varchar(50) NOT NULL,
	"public_key" text NOT NULL,
	"private_key" text NOT NULL,
	"key_length" integer NOT NULL,
	"algorithm" varchar(20) NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dns_record" (
	"id" bigint PRIMARY KEY NOT NULL,
	"alias_domain" varchar(255) NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"record_type" text NOT NULL,
	"name" text NOT NULL,
	"value" text NOT NULL,
	"ttl" bigint DEFAULT 3600 NOT NULL,
	"priority" integer,
	"description" text,
	"is_verified" boolean NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "domain" (
	"domain" varchar(255) PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"mailboxes" integer NOT NULL,
	"mailbox_quota" bigint NOT NULL,
	"quota" bigint NOT NULL,
	"rate_limit" integer,
	"active" boolean NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mailbox" (
	"username" varchar(255) PRIMARY KEY NOT NULL,
	"password" varchar(255) NOT NULL,
	"password_encode" varchar(255) NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"is_admin" boolean NOT NULL,
	"mail_dir" varchar(255) NOT NULL,
	"quota" bigint NOT NULL,
	"local_part" varchar(255) NOT NULL,
	"domain" varchar(255) NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_alias" (
	"address" varchar(255) PRIMARY KEY NOT NULL,
	"goto" text NOT NULL,
	"domain" varchar(255) NOT NULL,
	"user_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"active" boolean NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "apikey" ADD CONSTRAINT "apikey_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_inviter_id_user_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alias_domain" ADD CONSTRAINT "alias_domain_target_domain_domain_domain_fk" FOREIGN KEY ("target_domain") REFERENCES "public"."domain"("domain") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alias_domain" ADD CONSTRAINT "alias_domain_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alias_domain" ADD CONSTRAINT "alias_domain_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dkim_keys" ADD CONSTRAINT "dkim_keys_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dkim_keys" ADD CONSTRAINT "dkim_keys_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dkim_keys" ADD CONSTRAINT "dkim_keys_alias_domain_alias_domain_alias_domain_fk" FOREIGN KEY ("alias_domain") REFERENCES "public"."alias_domain"("alias_domain") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dns_record" ADD CONSTRAINT "dns_record_alias_domain_alias_domain_alias_domain_fk" FOREIGN KEY ("alias_domain") REFERENCES "public"."alias_domain"("alias_domain") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dns_record" ADD CONSTRAINT "dns_record_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dns_record" ADD CONSTRAINT "dns_record_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "domain" ADD CONSTRAINT "domain_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "domain" ADD CONSTRAINT "domain_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mailbox" ADD CONSTRAINT "mailbox_domain_domain_domain_fk" FOREIGN KEY ("domain") REFERENCES "public"."domain"("domain") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_alias" ADD CONSTRAINT "user_alias_domain_domain_domain_fk" FOREIGN KEY ("domain") REFERENCES "public"."domain"("domain") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_alias" ADD CONSTRAINT "user_alias_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_alias" ADD CONSTRAINT "user_alias_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "dkim_keys_idx_dkim_keys_selector" ON "dkim_keys" USING btree ("selector");--> statement-breakpoint
CREATE INDEX "dkim_keys_idx_dkim_keys_domain" ON "dkim_keys" USING btree ("alias_domain");--> statement-breakpoint
CREATE INDEX "domain_idx_domain_active" ON "domain" USING btree ("active");--> statement-breakpoint
CREATE INDEX "domain_idx_domain_created_at" ON "domain" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "mailbox_idx_mailbox_domain" ON "mailbox" USING btree ("domain");--> statement-breakpoint
CREATE INDEX "mailbox_idx_mailbox_created_at" ON "mailbox" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "user_alias_idx_alias_active" ON "user_alias" USING btree ("active");--> statement-breakpoint
CREATE INDEX "user_alias_idx_alias_domain" ON "user_alias" USING btree ("domain");