CREATE TYPE "public"."support_conversation_status" AS ENUM('open', 'closed');--> statement-breakpoint
CREATE TYPE "public"."support_sender_role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "support_conversation" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"organization_id" text,
	"status" "support_conversation_status" DEFAULT 'open' NOT NULL,
	"last_message_at" timestamp DEFAULT now() NOT NULL,
	"last_message_preview" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "support_message" (
	"id" text PRIMARY KEY NOT NULL,
	"conversation_id" text NOT NULL,
	"sender_user_id" text NOT NULL,
	"sender_role" "support_sender_role" NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "support_conversation" ADD CONSTRAINT "support_conversation_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_conversation" ADD CONSTRAINT "support_conversation_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_message" ADD CONSTRAINT "support_message_conversation_id_support_conversation_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."support_conversation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_message" ADD CONSTRAINT "support_message_sender_user_id_user_id_fk" FOREIGN KEY ("sender_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "support_conversation_open_user_idx" ON "support_conversation" USING btree ("user_id") WHERE "support_conversation"."status" = 'open';--> statement-breakpoint
CREATE INDEX "support_conversation_user_idx" ON "support_conversation" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "support_conversation_status_idx" ON "support_conversation" USING btree ("status");--> statement-breakpoint
CREATE INDEX "support_conversation_last_message_idx" ON "support_conversation" USING btree ("last_message_at");--> statement-breakpoint
CREATE INDEX "support_conversation_org_idx" ON "support_conversation" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "support_message_conversation_idx" ON "support_message" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "support_message_created_idx" ON "support_message" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "support_message_sender_idx" ON "support_message" USING btree ("sender_user_id");
