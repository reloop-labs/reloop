import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq } from "drizzle-orm";
import type { DNSTypes } from "../dns.type";

export async function insertDNSRecord(
    record: DNSTypes.DNSRecordData,
    domain: string,
    organizationId: string,
    userId: string,
): Promise<void> {
    try {
        const domainRecord = await db
            .select({ id: schema.domain.id })
            .from(schema.domain)
            .where(
                and(
                    eq(schema.domain.domain, domain),
                    eq(schema.domain.organizationId, organizationId),
                ),
            )
            .limit(1);

        if (domainRecord.length === 0 || !domainRecord[0]) {
            throw new Error(`Domain ${domain} not found for organization ${organizationId}`);
        }

        await db.insert(schema.domainDnsRecord).values({
            domainId: domainRecord[0].id,
            organizationId,
            userId,
            recordType: record.recordType as "A" | "AAAA" | "CNAME" | "MX" | "TXT" | "NS" | "SRV" | "CAA" | "SPF" | "DKIM" | "DMARC",
            name: record.name,
            value: record.value,
            ttl: record.ttl,
            priority: record.priority,
            description: record.description,
            isVerified: record.isVerified,
            domain,
        });
    } catch (dbError) {
        logger.error({
            domain,
            record,
            error: dbError instanceof Error ? dbError.message : String(dbError),
        }, "Failed to insert DNS record");
        throw new Error(`Failed to insert DNS record: ${dbError instanceof Error ? dbError.message : String(dbError)}`);
    }
}

export async function insertDKIMKeys(
    dkimKeyPair: DNSTypes.DKIMKeyPair,
    domain: string,
    organizationId: string,
    _userId: string,
): Promise<void> {
    try {
        await db
            .update(schema.domain)
            .set({
                dkimSelector: dkimKeyPair.selector,
                updatedAt: new Date(),
            })
            .where(
                and(
                    eq(schema.domain.domain, domain),
                    eq(schema.domain.organizationId, organizationId),
                ),
            );
        logger.info({
            domain,
            selector: dkimKeyPair.selector,
        }, "DKIM selector updated in domain table");
    } catch (dbError) {
        logger.error({
            domain,
            error: dbError instanceof Error ? dbError.message : String(dbError),
        }, "Failed to insert DKIM keys");
        throw new Error(`Failed to insert DKIM keys: ${dbError instanceof Error ? dbError.message : String(dbError)}`);
    }
}

export async function getDNSRecords(
    domain: string,
    organizationId: string,
): Promise<DNSTypes.DNSRecordData[]> {
    logger.info({ domain }, "Getting DNS records for domain");

    try {

        const records = await db
            .select()
            .from(schema.domainDnsRecord)
            .where(and(eq(schema.domainDnsRecord.domain, domain), eq(schema.domainDnsRecord.organizationId, organizationId)));

        return records.map((record) => ({
            recordType: record.recordType,
            name: record.name,
            value: record.value,
            ttl: record.ttl,
            priority: record.priority ?? undefined,
            description: record.description ?? undefined,
            isVerified: record.isVerified,
        }));
    } catch (error) {
        logger.error({
            domain,
            error: error instanceof Error ? error.message : String(error),
        }, "Error getting DNS records");
        throw error;
    }
}

export async function getDKIMKeys(
    domain: string,
    organizationId: string,
): Promise<DNSTypes.DKIMKeysResponse | null> {
    logger.info({ domain }, "Getting DKIM keys for domain");

    try {
        const domainRecord = await db
            .select({ dkimSelector: schema.domain.dkimSelector, })
            .from(schema.domain)
            .where(and(eq(schema.domain.domain, domain), eq(schema.domain.organizationId, organizationId)))
            .limit(1);

        if (domainRecord.length === 0 || !domainRecord[0]) {
            logger.warn({ domain }, "Domain not found when getting DKIM keys");
            return null;
        }
        logger.warn({ domain }, "DKIM keys storage not fully implemented in schema");
        return null;
    } catch (error) {
        logger.error({
            domain,
            error: error instanceof Error ? error.message : String(error),
        }, "Error getting DKIM keys");
        throw error;
    }
}

export async function verifyDNSRecord(
    domain: string,
    recordType: string,
    name: string,
): Promise<boolean> {
    logger.info({ domain, recordType, name }, "Verifying DNS record");

    try {
        const domainRecord = await db
            .select({ id: schema.domain.id })
            .from(schema.domain)
            .where(eq(schema.domain.domain, domain))
            .limit(1);

        if (domainRecord.length === 0 || !domainRecord[0]) {
            logger.warn({ domain }, "Domain not found when verifying DNS record");
            return false;
        }

        await db
            .update(schema.domainDnsRecord)
            .set({ isVerified: true, updatedAt: new Date() })
            .where(
                and(
                    eq(schema.domainDnsRecord.domainId, domainRecord[0].id),
                    eq(schema.domainDnsRecord.recordType, recordType as "A" | "AAAA" | "CNAME" | "MX" | "TXT" | "NS" | "SRV" | "CAA" | "SPF" | "DKIM" | "DMARC"),
                    eq(schema.domainDnsRecord.name, name),
                ),
            );

        logger.info({
            domain,
            recordType,
            name,
        }, "DNS record marked as verified");
        return true;
    } catch (error) {
        logger.error({
            domain,
            recordType,
            name,
            error: error instanceof Error ? error.message : String(error),
        }, "Error verifying DNS record");
        return false;
    }
}

export async function deleteDNSRecords(domain: string, organizationId: string): Promise<void> {
    logger.info({ domain, organizationId }, "Deleting DNS records for domain");

    try {
        await db
            .delete(schema.domainDnsRecord)
            .where(and(eq(schema.domainDnsRecord.domain, domain), eq(schema.domainDnsRecord.organizationId, organizationId)));
        logger.info({ domain, organizationId }, "DNS records deleted successfully");
    } catch (error) {
        logger.error({
            domain,
            error: error instanceof Error ? error.message : String(error),
        }, "Error deleting DNS records");
        throw error;
    }
}
