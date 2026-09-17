UPDATE "organization_plan"
SET "daily_email_limit" = 100, "updated_at" = now()
WHERE "plan_id" = 'free' AND "daily_email_limit" = 200;
