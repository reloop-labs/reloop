ALTER TYPE "public"."thread_status" ADD VALUE 'trash';--> statement-breakpoint
CREATE TABLE "email_label" (
	"id" text PRIMARY KEY NOT NULL,
	"mailbox_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"name" varchar(100) NOT NULL,
	"color" varchar(32) DEFAULT 'default' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "thread_label" (
	"thread_id" text NOT NULL,
	"label_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "thread_label_thread_id_label_id_pk" PRIMARY KEY("thread_id","label_id")
);
--> statement-breakpoint
CREATE TABLE "thread_note" (
	"id" text PRIMARY KEY NOT NULL,
	"thread_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"content" text NOT NULL,
	"color" varchar(32) DEFAULT 'default' NOT NULL,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "email_thread" ADD COLUMN "is_important" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "email_thread" ADD COLUMN "snoozed_until" timestamp;--> statement-breakpoint
ALTER TABLE "email_thread" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "email_label" ADD CONSTRAINT "email_label_mailbox_id_mailbox_id_fk" FOREIGN KEY ("mailbox_id") REFERENCES "public"."mailbox"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_label" ADD CONSTRAINT "email_label_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "thread_label" ADD CONSTRAINT "thread_label_thread_id_email_thread_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."email_thread"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "thread_label" ADD CONSTRAINT "thread_label_label_id_email_label_id_fk" FOREIGN KEY ("label_id") REFERENCES "public"."email_label"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "thread_note" ADD CONSTRAINT "thread_note_thread_id_email_thread_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."email_thread"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "thread_note" ADD CONSTRAINT "thread_note_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "email_label_idx_mailbox_id" ON "email_label" USING btree ("mailbox_id");--> statement-breakpoint
CREATE INDEX "email_label_idx_organization_id" ON "email_label" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "thread_label_idx_thread_id" ON "thread_label" USING btree ("thread_id");--> statement-breakpoint
CREATE INDEX "thread_label_idx_label_id" ON "thread_label" USING btree ("label_id");--> statement-breakpoint
CREATE INDEX "thread_note_idx_thread_id" ON "thread_note" USING btree ("thread_id");--> statement-breakpoint
CREATE INDEX "thread_note_idx_organization_id" ON "thread_note" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "email_thread_idx_snoozed_until" ON "email_thread" USING btree ("snoozed_until");--> statement-breakpoint
CREATE INDEX "email_thread_idx_is_important" ON "email_thread" USING btree ("is_important");