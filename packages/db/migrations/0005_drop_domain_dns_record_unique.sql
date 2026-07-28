-- DNS record uniqueness is handled in application code (upsert/update in place),
-- not at the DB level — soft-deleted rows must not block repairs/recreates.
ALTER TABLE "domain_dns_record" DROP CONSTRAINT IF EXISTS "domain_dns_record_unique_record";
