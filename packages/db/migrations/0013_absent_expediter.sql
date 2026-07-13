CREATE TYPE "public"."signup_invite_status" AS ENUM('pending', 'used', 'revoked');--> statement-breakpoint
CREATE TABLE "signup_invite" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"email" text NOT NULL,
	"status" "signup_invite_status" DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"invited_by_user_id" text NOT NULL,
	"used_by_user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "signup_invite_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "signup_invite" ADD CONSTRAINT "signup_invite_invited_by_user_id_user_id_fk" FOREIGN KEY ("invited_by_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "signup_invite" ADD CONSTRAINT "signup_invite_used_by_user_id_user_id_fk" FOREIGN KEY ("used_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "signup_invite_email_idx" ON "signup_invite" USING btree ("email");--> statement-breakpoint
CREATE INDEX "signup_invite_invited_by_idx" ON "signup_invite" USING btree ("invited_by_user_id");--> statement-breakpoint
CREATE INDEX "signup_invite_status_idx" ON "signup_invite" USING btree ("status");