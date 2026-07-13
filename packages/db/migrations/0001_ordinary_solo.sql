CREATE TABLE "webhook_delivery_attempt" (
	"id" text PRIMARY KEY NOT NULL,
	"webhook_delivery_id" text NOT NULL,
	"attempt_number" integer NOT NULL,
	"status" "webhook_delivery_status" NOT NULL,
	"response_status" integer,
	"response_body" text,
	"response_headers" jsonb,
	"duration_ms" integer,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "webhook_delivery_attempt" ADD CONSTRAINT "webhook_delivery_attempt_webhook_delivery_id_webhook_delivery_id_fk" FOREIGN KEY ("webhook_delivery_id") REFERENCES "public"."webhook_delivery"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "webhook_delivery_attempt_idx_delivery_id" ON "webhook_delivery_attempt" USING btree ("webhook_delivery_id");--> statement-breakpoint
CREATE INDEX "webhook_delivery_attempt_idx_created_at" ON "webhook_delivery_attempt" USING btree ("created_at");