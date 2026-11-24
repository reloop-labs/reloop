UPDATE "organization_plan"
SET "daily_email_limit" = NULL, "updated_at" = now()
WHERE "plan_id" IN ('individual', 'startup', 'enterprise', 'payg') AND "daily_email_limit" IN (100, 200);
