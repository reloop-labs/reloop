ALTER TABLE "email_log" ADD COLUMN "attachments" jsonb DEFAULT '[]'::jsonb NOT NULL;
