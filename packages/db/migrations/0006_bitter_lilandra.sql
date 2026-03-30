CREATE TYPE "public"."tls_mode" AS ENUM('opportunistic', 'enforced');--> statement-breakpoint
ALTER TABLE "domain" ADD COLUMN "custom_return_path" varchar(255) DEFAULT 'send' NOT NULL;--> statement-breakpoint
ALTER TABLE "domain" ADD COLUMN "click_tracking" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "domain" ADD COLUMN "open_tracking" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "domain" ADD COLUMN "tls" "tls_mode" DEFAULT 'opportunistic' NOT NULL;
