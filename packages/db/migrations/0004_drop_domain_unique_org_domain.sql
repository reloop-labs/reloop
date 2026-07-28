-- Uniqueness for active domains is enforced in application code
-- (create-domain step-1), not at the DB level.
ALTER TABLE "domain" DROP CONSTRAINT IF EXISTS "domain_unique_org_domain";
