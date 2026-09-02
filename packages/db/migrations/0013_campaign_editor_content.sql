ALTER TABLE "campaign" ADD COLUMN "content" jsonb DEFAULT '[]'::jsonb NOT NULL;
