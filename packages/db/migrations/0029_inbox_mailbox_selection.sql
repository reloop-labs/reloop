CREATE TABLE IF NOT EXISTS "inbox_mailbox_selection" (
	"user_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"mailbox_id" text NOT NULL,
	"folder" varchar(64) DEFAULT 'inbox' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "inbox_mailbox_selection_user_id_organization_id_pk" PRIMARY KEY("user_id","organization_id")
);--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inbox_mailbox_selection" ADD CONSTRAINT "inbox_mailbox_selection_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inbox_mailbox_selection" ADD CONSTRAINT "inbox_mailbox_selection_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inbox_mailbox_selection" ADD CONSTRAINT "inbox_mailbox_selection_mailbox_id_mailbox_id_fk" FOREIGN KEY ("mailbox_id") REFERENCES "public"."mailbox"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "inbox_mailbox_selection_idx_org" ON "inbox_mailbox_selection" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "inbox_mailbox_selection_idx_mailbox" ON "inbox_mailbox_selection" USING btree ("mailbox_id");
