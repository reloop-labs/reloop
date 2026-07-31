CREATE TYPE "public"."automation_status" AS ENUM('draft', 'active', 'paused');--> statement-breakpoint
CREATE TYPE "public"."automation_enrollment_status" AS ENUM('active', 'completed', 'cancelled', 'failed');--> statement-breakpoint
CREATE TYPE "public"."automation_step_run_status" AS ENUM('pending', 'running', 'completed', 'skipped', 'failed');--> statement-breakpoint
CREATE TABLE "automation" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"status" "automation_status" DEFAULT 'draft' NOT NULL,
	"trigger_event" varchar(128),
	"graph" jsonb DEFAULT '{"nodes":[],"edges":[]}'::jsonb NOT NULL,
	"active_version_id" text,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE "automation_version" (
	"id" text PRIMARY KEY NOT NULL,
	"automation_id" text NOT NULL,
	"version" integer NOT NULL,
	"trigger_event" varchar(128) NOT NULL,
	"graph" jsonb NOT NULL,
	"created_by_user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE "automation_enrollment" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"automation_id" text NOT NULL,
	"version_id" text NOT NULL,
	"contact_id" text NOT NULL,
	"status" "automation_enrollment_status" DEFAULT 'active' NOT NULL,
	"current_node_id" text,
	"enrolled_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"cancelled_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE "automation_step_run" (
	"id" text PRIMARY KEY NOT NULL,
	"enrollment_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"node_id" text NOT NULL,
	"node_type" varchar(64) NOT NULL,
	"status" "automation_step_run_status" DEFAULT 'pending' NOT NULL,
	"scheduled_for" timestamp DEFAULT now() NOT NULL,
	"started_at" timestamp,
	"finished_at" timestamp,
	"email_log_id" text,
	"error" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
ALTER TABLE "automation" ADD CONSTRAINT "automation_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation" ADD CONSTRAINT "automation_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation_version" ADD CONSTRAINT "automation_version_automation_id_automation_id_fk" FOREIGN KEY ("automation_id") REFERENCES "public"."automation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation_version" ADD CONSTRAINT "automation_version_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation_enrollment" ADD CONSTRAINT "automation_enrollment_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation_enrollment" ADD CONSTRAINT "automation_enrollment_automation_id_automation_id_fk" FOREIGN KEY ("automation_id") REFERENCES "public"."automation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation_enrollment" ADD CONSTRAINT "automation_enrollment_version_id_automation_version_id_fk" FOREIGN KEY ("version_id") REFERENCES "public"."automation_version"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation_enrollment" ADD CONSTRAINT "automation_enrollment_contact_id_contact_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contact"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation_step_run" ADD CONSTRAINT "automation_step_run_enrollment_id_automation_enrollment_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."automation_enrollment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation_step_run" ADD CONSTRAINT "automation_step_run_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation_step_run" ADD CONSTRAINT "automation_step_run_email_log_id_email_log_id_fk" FOREIGN KEY ("email_log_id") REFERENCES "public"."email_log"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "automation_idx_organization_id" ON "automation" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "automation_idx_status" ON "automation" USING btree ("status");--> statement-breakpoint
CREATE INDEX "automation_idx_trigger_event" ON "automation" USING btree ("trigger_event");--> statement-breakpoint
CREATE INDEX "automation_idx_org_status_trigger" ON "automation" USING btree ("organization_id","status","trigger_event");--> statement-breakpoint
CREATE INDEX "automation_version_idx_automation_id" ON "automation_version" USING btree ("automation_id");--> statement-breakpoint
CREATE UNIQUE INDEX "automation_version_unique" ON "automation_version" USING btree ("automation_id","version");--> statement-breakpoint
CREATE INDEX "automation_enrollment_idx_org" ON "automation_enrollment" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "automation_enrollment_idx_automation" ON "automation_enrollment" USING btree ("automation_id");--> statement-breakpoint
CREATE INDEX "automation_enrollment_idx_contact" ON "automation_enrollment" USING btree ("contact_id");--> statement-breakpoint
CREATE INDEX "automation_enrollment_idx_status" ON "automation_enrollment" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "automation_enrollment_unique" ON "automation_enrollment" USING btree ("automation_id","contact_id");--> statement-breakpoint
CREATE INDEX "automation_step_run_idx_enrollment" ON "automation_step_run" USING btree ("enrollment_id");--> statement-breakpoint
CREATE INDEX "automation_step_run_idx_status_scheduled" ON "automation_step_run" USING btree ("status","scheduled_for");--> statement-breakpoint
CREATE INDEX "automation_step_run_idx_org" ON "automation_step_run" USING btree ("organization_id");
