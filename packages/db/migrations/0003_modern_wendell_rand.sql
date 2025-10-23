CREATE TYPE "public"."audience_status" AS ENUM('subscribed', 'unsubscribed');--> statement-breakpoint
CREATE TYPE "public"."webhook_delivery_status" AS ENUM('pending', 'success', 'failed', 'retrying');--> statement-breakpoint
CREATE TYPE "public"."webhook_status" AS ENUM('active', 'paused', 'disabled', 'failed');--> statement-breakpoint
CREATE TABLE "audience" (
	"id" text PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"first_name" varchar(255),
	"last_name" varchar(255),
	"phone" varchar(50),
	"metadata" jsonb,
	"organization_id" text NOT NULL,
	"status" "audience_status" DEFAULT 'subscribed' NOT NULL,
	"added_at" timestamp DEFAULT now() NOT NULL,
	"unsubscribed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"audience_group_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audience_group" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "webhook" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"url" text NOT NULL,
	"secret" text,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"status" "webhook_status" DEFAULT 'active' NOT NULL,
	"custom_headers" jsonb,
	"rate_limit_enabled" boolean DEFAULT true NOT NULL,
	"max_requests_per_minute" integer DEFAULT 60 NOT NULL,
	"max_retries" integer DEFAULT 3 NOT NULL,
	"retry_backoff_multiplier" integer DEFAULT 2 NOT NULL,
	"filtering_options" jsonb,
	"last_triggered_at" timestamp,
	"success_count" integer DEFAULT 0 NOT NULL,
	"failure_count" integer DEFAULT 0 NOT NULL,
	"consecutive_failures" integer DEFAULT 0 NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "webhook_delivery" (
	"id" text PRIMARY KEY NOT NULL,
	"webhook_id" text NOT NULL,
	"event_id" text NOT NULL,
	"event_data" jsonb NOT NULL,
	"status" "webhook_delivery_status" DEFAULT 'pending' NOT NULL,
	"request_url" text NOT NULL,
	"request_headers" jsonb,
	"request_body" jsonb,
	"response_status" integer,
	"response_body" text,
	"response_headers" jsonb,
	"attempt_number" integer DEFAULT 1 NOT NULL,
	"max_attempts" integer DEFAULT 3 NOT NULL,
	"next_retry_at" timestamp,
	"last_attempt_at" timestamp,
	"error_message" text,
	"error_details" jsonb,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "webhook_event" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"category" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "webhook_event_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "webhook_event_subscription" (
	"id" text PRIMARY KEY NOT NULL,
	"webhook_id" text NOT NULL,
	"event_id" text NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audience" ADD CONSTRAINT "audience_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audience" ADD CONSTRAINT "audience_audience_group_id_audience_group_id_fk" FOREIGN KEY ("audience_group_id") REFERENCES "public"."audience_group"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audience_group" ADD CONSTRAINT "audience_group_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audience_group" ADD CONSTRAINT "audience_group_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhook" ADD CONSTRAINT "webhook_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhook" ADD CONSTRAINT "webhook_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhook_delivery" ADD CONSTRAINT "webhook_delivery_webhook_id_webhook_id_fk" FOREIGN KEY ("webhook_id") REFERENCES "public"."webhook"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhook_delivery" ADD CONSTRAINT "webhook_delivery_event_id_webhook_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."webhook_event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhook_event_subscription" ADD CONSTRAINT "webhook_event_subscription_webhook_id_webhook_id_fk" FOREIGN KEY ("webhook_id") REFERENCES "public"."webhook"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhook_event_subscription" ADD CONSTRAINT "webhook_event_subscription_event_id_webhook_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."webhook_event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audience_idx_email" ON "audience" USING btree ("email");--> statement-breakpoint
CREATE INDEX "audience_idx_organization_id" ON "audience" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "audience_idx_org_email" ON "audience" USING btree ("organization_id","email");--> statement-breakpoint
CREATE INDEX "audience_idx_status" ON "audience" USING btree ("status");--> statement-breakpoint
CREATE INDEX "audience_idx_org_status" ON "audience" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "audience_idx_group_id" ON "audience" USING btree ("audience_group_id");--> statement-breakpoint
CREATE INDEX "audience_group_idx_organization_id" ON "audience_group" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "audience_group_idx_user_id" ON "audience_group" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audience_group_idx_deleted_at" ON "audience_group" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "audience_group_idx_org_deleted" ON "audience_group" USING btree ("organization_id","deleted_at");--> statement-breakpoint
CREATE INDEX "webhook_idx_organization_id" ON "webhook" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "webhook_idx_user_id" ON "webhook" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "webhook_idx_status" ON "webhook" USING btree ("status");--> statement-breakpoint
CREATE INDEX "webhook_idx_deleted_at" ON "webhook" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "webhook_idx_org_status" ON "webhook" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "webhook_idx_org_deleted" ON "webhook" USING btree ("organization_id","deleted_at");--> statement-breakpoint
CREATE INDEX "webhook_idx_last_triggered" ON "webhook" USING btree ("last_triggered_at");--> statement-breakpoint
CREATE INDEX "webhook_delivery_idx_webhook_id" ON "webhook_delivery" USING btree ("webhook_id");--> statement-breakpoint
CREATE INDEX "webhook_delivery_idx_status" ON "webhook_delivery" USING btree ("status");--> statement-breakpoint
CREATE INDEX "webhook_delivery_idx_event_id" ON "webhook_delivery" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "webhook_delivery_idx_created_at" ON "webhook_delivery" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "webhook_delivery_idx_next_retry_at" ON "webhook_delivery" USING btree ("next_retry_at");--> statement-breakpoint
CREATE INDEX "webhook_delivery_idx_webhook_status" ON "webhook_delivery" USING btree ("webhook_id","status");--> statement-breakpoint
CREATE INDEX "webhook_delivery_idx_webhook_created" ON "webhook_delivery" USING btree ("webhook_id","created_at");--> statement-breakpoint
CREATE INDEX "webhook_delivery_idx_retry_pending" ON "webhook_delivery" USING btree ("status","next_retry_at");--> statement-breakpoint
CREATE INDEX "webhook_event_idx_name" ON "webhook_event" USING btree ("name");--> statement-breakpoint
CREATE INDEX "webhook_event_idx_category" ON "webhook_event" USING btree ("category");--> statement-breakpoint
CREATE INDEX "webhook_event_idx_is_active" ON "webhook_event" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "webhook_event_subscription_idx_webhook_id" ON "webhook_event_subscription" USING btree ("webhook_id");--> statement-breakpoint
CREATE INDEX "webhook_event_subscription_idx_event_id" ON "webhook_event_subscription" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "webhook_event_subscription_idx_is_enabled" ON "webhook_event_subscription" USING btree ("is_enabled");--> statement-breakpoint
CREATE INDEX "webhook_event_subscription_idx_webhook_enabled" ON "webhook_event_subscription" USING btree ("webhook_id","is_enabled");