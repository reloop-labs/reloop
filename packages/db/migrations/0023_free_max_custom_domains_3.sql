UPDATE "organization_plan"
SET "max_custom_domains" = 3, "updated_at" = now()
WHERE "plan_id" = 'free' AND "max_custom_domains" = 1;
