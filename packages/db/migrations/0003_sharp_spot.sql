ALTER TYPE "public"."org_status" RENAME TO "organization_status";--> statement-breakpoint
CREATE TABLE "email_send" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"subscription_id" text NOT NULL,
	"email_log_id" text,
	"recipient_email" varchar(255) NOT NULL,
	"counted_in_credits" boolean DEFAULT true NOT NULL,
	"credits_consumed" integer DEFAULT 1 NOT NULL,
	"status" "email_send_status" DEFAULT 'queued' NOT NULL,
	"error_message" text,
	"sent_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "email_event" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."email_event_type";--> statement-breakpoint
CREATE TYPE "public"."email_event_type" AS ENUM('sent', 'delivered', 'opened', 'clicked', 'bounced', 'complaint', 'unsubscribed', 'deferred');--> statement-breakpoint
ALTER TABLE "email_event" ALTER COLUMN "type" SET DATA TYPE "public"."email_event_type" USING "type"::"public"."email_event_type";--> statement-breakpoint
ALTER TABLE "email_log" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "email_log" ALTER COLUMN "apikey_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "plan" ADD COLUMN "rate_per_second" integer DEFAULT 50 NOT NULL;--> statement-breakpoint
ALTER TABLE "plan" ADD COLUMN "rate_per_minute" integer DEFAULT 2000 NOT NULL;--> statement-breakpoint
ALTER TABLE "plan" ADD COLUMN "rate_per_hour" integer DEFAULT 50000 NOT NULL;--> statement-breakpoint
ALTER TABLE "plan" ADD COLUMN "max_attachment_size_mb" integer DEFAULT 10 NOT NULL;--> statement-breakpoint
ALTER TABLE "email_send" ADD CONSTRAINT "email_send_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_send" ADD CONSTRAINT "email_send_subscription_id_subscription_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscription"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_send" ADD CONSTRAINT "email_send_email_log_id_email_log_id_fk" FOREIGN KEY ("email_log_id") REFERENCES "public"."email_log"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "email_send_organization_id_idx" ON "email_send" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "email_send_subscription_id_idx" ON "email_send" USING btree ("subscription_id");--> statement-breakpoint
CREATE INDEX "email_send_status_idx" ON "email_send" USING btree ("status");--> statement-breakpoint
CREATE INDEX "apikey_key_idx" ON "apikey" USING btree ("key");--> statement-breakpoint
CREATE INDEX "apikey_organizationId_idx" ON "apikey" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "apikey_userId_idx" ON "apikey" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "organization" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "domain" DROP COLUMN "tracking_domain";