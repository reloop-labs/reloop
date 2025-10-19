import { createId } from "@paralleldrive/cuid2";
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
        await db.insert(schema.dnsRecord).values({
            id: Number.parseInt(createId().replace(/\D/g, "").slice(0, 15), 10),
            aliasDomain: domain,
            organizationId,
            userId,
            recordType: record.recordType,
            name: record.name,
            value: record.value,
            ttl: record.ttl,
            priority: record.priority,
            description: record.description,
            isVerified: record.isVerified,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    } catch (dbError) {
        logger.error("Failed to insert DNS record", {
            domain,
            record,
            error: dbError instanceof Error ? dbError.message : String(dbError),
        });
        throw new Error(`Failed to insert DNS record: ${dbError instanceof Error ? dbError.message : String(dbError)}`);
    }
}

export async function insertDKIMKeys(
    dkimKeyPair: DNSTypes.DKIMKeyPair,
    domain: string,
    organizationId: string,
    userId: string,
): Promise<void> {
    try {
        await db.insert(schema.dkimKeys).values({
            organizationId,
            userId,
            aliasDomain: domain,
            selector: dkimKeyPair.selector,
            publicKey: dkimKeyPair.publicKey,
            privateKey: dkimKeyPair.privateKey,
            keyLength: 2048,
            algorithm: "rsa-sha256",
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    } catch (dbError) {
        logger.error("Failed to insert DKIM keys", {
            domain,
            error: dbError instanceof Error ? dbError.message : String(dbError),
        });
        throw new Error(`Failed to insert DKIM keys: ${dbError instanceof Error ? dbError.message : String(dbError)}`);
    }
}

export async function getDNSRecords(
    domain: string,
): Promise<DNSTypes.DNSRecordData[]> {
    logger.info("Getting DNS records for domain", { domain });

    try {
        const records = await db
            .select()
            .from(schema.dnsRecord)
            .where(eq(schema.dnsRecord.aliasDomain, domain));

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
        logger.error("Error getting DNS records", {
            domain,
            error: error instanceof Error ? error.message : String(error),
        });
        throw error;
    }
}

export async function getDKIMKeys(
    domain: string,
): Promise<DNSTypes.DKIMKeysResponse | null> {
    logger.info("Getting DKIM keys for domain", { domain });

    try {
        const keys = await db
            .select()
            .from(schema.dkimKeys)
            .where(eq(schema.dkimKeys.aliasDomain, domain))
            .limit(1);

        if (keys.length === 0) {
            return null;
        }

        const key = keys[0];
        if (!key) {
            return null;
        }
        return {
            selector: key.selector,
            publicKey: key.publicKey,
            privateKey: key.privateKey,
            keyLength: key.keyLength,
            algorithm: key.algorithm,
        };
    } catch (error) {
        logger.error("Error getting DKIM keys", {
            domain,
            error: error instanceof Error ? error.message : String(error),
        });
        throw error;
    }
}

export async function verifyDNSRecord(
    domain: string,
    recordType: string,
    name: string,
): Promise<boolean> {
    logger.info("Verifying DNS record", { domain, recordType, name });

    try {
        await db
            .update(schema.dnsRecord)
            .set({ isVerified: true, updatedAt: new Date() })
            .where(
                and(
                    eq(schema.dnsRecord.aliasDomain, domain),
                    eq(schema.dnsRecord.recordType, recordType),
                    eq(schema.dnsRecord.name, name),
                ),
            );

        logger.info("DNS record marked as verified", {
            domain,
            recordType,
            name,
        });
        return true;
    } catch (error) {
        logger.error("Error verifying DNS record", {
            domain,
            recordType,
            name,
            error: error instanceof Error ? error.message : String(error),
        });
        return false;
    }
}

export async function deleteDNSRecords(domain: string): Promise<void> {
    logger.info("Deleting DNS records for domain", { domain });

    try {
        await db
            .delete(schema.dnsRecord)
            .where(eq(schema.dnsRecord.aliasDomain, domain));

        await db
            .delete(schema.dkimKeys)
            .where(eq(schema.dkimKeys.aliasDomain, domain));

        logger.info("DNS records and DKIM keys deleted successfully", { domain });
    } catch (error) {
        logger.error("Error deleting DNS records", {
            domain,
            error: error instanceof Error ? error.message : String(error),
        });
        throw error;
    }
}
