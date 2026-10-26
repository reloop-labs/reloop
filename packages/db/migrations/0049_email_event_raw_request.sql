ALTER TABLE "email_event" ADD COLUMN "request_headers" jsonb;--> statement-breakpoint
ALTER TABLE "email_event" ADD COLUMN "client_ip" text;
