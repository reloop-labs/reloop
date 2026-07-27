CREATE TABLE "activity_log" (
	"id" text PRIMARY KEY NOT NULL,
	"event" text NOT NULL,
	"level" text NOT NULL,
	"trace_id" text,
	"user_id" text,
	"organization_id" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"request_details" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"request_body" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status_code" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"actor_type" text DEFAULT '' NOT NULL,
	"actor_id" text,
	"resource_type" text DEFAULT '' NOT NULL,
	"resource_id" text,
	"service" text DEFAULT '' NOT NULL,
	"action" text DEFAULT '' NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"environment" text DEFAULT '' NOT NULL
);--> statement-breakpoint
CREATE INDEX "activity_log_idx_org_created" ON "activity_log" USING btree ("organization_id","created_at");--> statement-breakpoint
CREATE INDEX "activity_log_idx_org_service_created" ON "activity_log" USING btree ("organization_id","service","created_at");--> statement-breakpoint
CREATE INDEX "activity_log_idx_org_level" ON "activity_log" USING btree ("organization_id","level");
