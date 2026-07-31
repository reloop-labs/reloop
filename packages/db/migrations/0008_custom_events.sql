CREATE TYPE "public"."custom_event_property_type" AS ENUM('string', 'number', 'boolean');--> statement-breakpoint
CREATE TABLE "custom_event" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"key" varchar(128) NOT NULL,
	"description" text,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE "custom_event_property" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"name" varchar(128) NOT NULL,
	"property_type" "custom_event_property_type" DEFAULT 'string' NOT NULL,
	"required" boolean DEFAULT false NOT NULL,
	"default_value" varchar(512),
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
ALTER TABLE "custom_event" ADD CONSTRAINT "custom_event_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_event" ADD CONSTRAINT "custom_event_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_event_property" ADD CONSTRAINT "custom_event_property_event_id_custom_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."custom_event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_event_property" ADD CONSTRAINT "custom_event_property_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "custom_event_idx_organization_id" ON "custom_event" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "custom_event_idx_key" ON "custom_event" USING btree ("key");--> statement-breakpoint
CREATE INDEX "custom_event_idx_user_id" ON "custom_event" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "custom_event_unique_org_key" ON "custom_event" USING btree ("organization_id","key");--> statement-breakpoint
CREATE INDEX "custom_event_property_idx_event_id" ON "custom_event_property" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "custom_event_property_idx_organization_id" ON "custom_event_property" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "custom_event_property_unique_event_name" ON "custom_event_property" USING btree ("event_id","name");
