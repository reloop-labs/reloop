CREATE TYPE "public"."sending_ip_kind" AS ENUM('shared', 'dedicated');--> statement-breakpoint
CREATE TYPE "public"."sending_ip_status" AS ENUM('active', 'disabled', 'retired');--> statement-breakpoint
CREATE TYPE "public"."ip_warmup_status" AS ENUM('pending', 'active', 'paused', 'completed', 'aborted');--> statement-breakpoint
CREATE TYPE "public"."ip_warmup_overflow" AS ENUM('shared', 'defer');--> statement-breakpoint
CREATE TABLE "sending_ip" (
	"id" text PRIMARY KEY NOT NULL,
	"address" varchar(45) NOT NULL,
	"hostname" varchar(255) NOT NULL,
	"kind" "sending_ip_kind" NOT NULL,
	"status" "sending_ip_status" DEFAULT 'active' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE "organization_sending_ip" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"sending_ip_id" text NOT NULL,
	"assigned_by_user_id" text,
	"is_primary" boolean DEFAULT false NOT NULL,
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	"unassigned_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE "ip_warmup" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_sending_ip_id" text NOT NULL,
	"sending_ip_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"status" "ip_warmup_status" DEFAULT 'pending' NOT NULL,
	"overflow" "ip_warmup_overflow" DEFAULT 'shared' NOT NULL,
	"schedule" jsonb NOT NULL,
	"started_at" timestamp,
	"completed_at" timestamp,
	"paused_at" timestamp,
	"sent_today_by_provider" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"daily_window_start" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
ALTER TABLE "organization_sending_ip" ADD CONSTRAINT "organization_sending_ip_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_sending_ip" ADD CONSTRAINT "organization_sending_ip_sending_ip_id_sending_ip_id_fk" FOREIGN KEY ("sending_ip_id") REFERENCES "public"."sending_ip"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_sending_ip" ADD CONSTRAINT "organization_sending_ip_assigned_by_user_id_user_id_fk" FOREIGN KEY ("assigned_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ip_warmup" ADD CONSTRAINT "ip_warmup_organization_sending_ip_id_organization_sending_ip_id_fk" FOREIGN KEY ("organization_sending_ip_id") REFERENCES "public"."organization_sending_ip"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ip_warmup" ADD CONSTRAINT "ip_warmup_sending_ip_id_sending_ip_id_fk" FOREIGN KEY ("sending_ip_id") REFERENCES "public"."sending_ip"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ip_warmup" ADD CONSTRAINT "ip_warmup_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "sending_ip_address_idx" ON "sending_ip" USING btree ("address");--> statement-breakpoint
CREATE INDEX "sending_ip_kind_idx" ON "sending_ip" USING btree ("kind");--> statement-breakpoint
CREATE INDEX "sending_ip_status_idx" ON "sending_ip" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "organization_sending_ip_active_ip_idx" ON "organization_sending_ip" USING btree ("sending_ip_id") WHERE "unassigned_at" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "organization_sending_ip_primary_org_idx" ON "organization_sending_ip" USING btree ("organization_id") WHERE "unassigned_at" is null AND "is_primary" = true;--> statement-breakpoint
CREATE INDEX "organization_sending_ip_org_idx" ON "organization_sending_ip" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "organization_sending_ip_ip_idx" ON "organization_sending_ip" USING btree ("sending_ip_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ip_warmup_assignment_idx" ON "ip_warmup" USING btree ("organization_sending_ip_id");--> statement-breakpoint
CREATE INDEX "ip_warmup_org_idx" ON "ip_warmup" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "ip_warmup_ip_idx" ON "ip_warmup" USING btree ("sending_ip_id");--> statement-breakpoint
CREATE INDEX "ip_warmup_status_idx" ON "ip_warmup" USING btree ("status");
