import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { DNSTypes } from "@reloop/domain/routes/dns/dns.type";
import { generateDKIMKeyPair } from "@reloop/domain/utils/dkim-key-generator";
import {
    generateAllDNSRecords,
    generateDKIMRecord,
} from "@reloop/domain/utils/dns-record-generator";
import { logger } from "@reloop/logger";
import { and, eq } from "drizzle-orm";

export interface GeneratedDNSData {
    dnsRecords: DNSTypes.DNSRecord[];
    dkimKeyPair: DNSTypes.DKIMKeyPair;
    spfRecord: string;
    dkimRecord: string;
    dmarcRecord: string;
}

export type DNSRecordStatus = "start-verify" | "verifying" | "active" | "suspended" | "failed";

export interface DNSRecordData {
    recordType: string;
    name: string;
    value: string;
    ttl: number;
    priority?: number;
    description?: string;
    isVerified: boolean;
    status: DNSRecordStatus;
}

/**
 * Generates DNS records and DKIM key pair for a domain
 */
export async function generateDNSData(
    domain: string,
    serverDomain: string,
    dkimSelector = "mail",
): Promise<GeneratedDNSData> {
    logger.info(
        {
            domain,
            serverDomain,
            dkimSelector,
        },
        "Generating DNS data for domain",
    );

    // Generate DKIM key pair
    const dkimKeyPair = await generateDKIMKeyPair(dkimSelector);

    // Generate all DNS records
    const dnsRecords = generateAllDNSRecords(domain, serverDomain);

    // Generate DKIM record
    const dkimRecord = generateDKIMRecord(
        domain,
        dkimSelector,
        dkimKeyPair.publicKey,
    );

    // Add DKIM record to the list
    dnsRecords.push(dkimRecord);

    // Extract specific record values
    const spfValue =
        dnsRecords.find((r) => r.value.startsWith("v=spf1"))?.value || "";
    const dkimValue =
        dnsRecords.find((r) => r.value.startsWith("v=DKIM1"))?.value || "";
    const dmarcValue =
        dnsRecords.find((r) => r.value.startsWith("v=DMARC1"))?.value || "";

    return {
        dnsRecords,
        dkimKeyPair,
        spfRecord: spfValue,
        dkimRecord: dkimValue,
        dmarcRecord: dmarcValue,
    };
}

/**
 * Inserts DNS records into the database
 */
export async function insertDNSRecords(
    dnsRecordData: DNSRecordData[],
    dkimKeyPair: DNSTypes.DKIMKeyPair,
    domain: string,
    organizationId: string,
    userId: string,
    domainId: string,
): Promise<void> {
    logger.info(
        {
            domain,
            organizationId,
            userId,
            recordCount: dnsRecordData.length,
        },
        "Inserting DNS records into database",
    );

    // Insert DNS records
    for (const record of dnsRecordData) {
        await db.insert(schema.domainDnsRecord).values({
            domainId,
            organizationId,
            userId,
            recordType: record.recordType as
                | "A"
                | "AAAA"
                | "CNAME"
                | "MX"
                | "TXT"
                | "NS"
                | "SRV"
                | "CAA"
                | "SPF"
                | "DKIM"
                | "DMARC",
            name: record.name,
            value: record.value,
            ttl: record.ttl,
            priority: record.priority,
            description: record.description,
            isVerified: record.isVerified,
            status: record.status,
            domain,
        });
    }

    // Update domain with DKIM selector
    await db
        .update(schema.domain)
        .set({
            dkimSelector: dkimKeyPair.selector,
            updatedAt: new Date(),
        })
        .where(eq(schema.domain.id, domainId));

    logger.info(
        {
            domain,
            recordCount: dnsRecordData.length,
        },
        "DNS records inserted successfully",
    );
}

/**
 * Converts DNS records to database format
 */
export function convertToDNSRecordData(
    dnsRecords: DNSTypes.DNSRecord[],
): DNSRecordData[] {
    return dnsRecords.map((record) => ({
        recordType: record.type,
        name: record.name,
        value: record.value,
        ttl: record.ttl || 3600,
        priority: record.priority,
        description: record.description,
        isVerified: false,
        status: "start-verify",
    }));
}

/**
 * Checks if DNS records already exist for a domain
 */
export async function getExistingDNSRecords(
    domain: string,
    organizationId: string,
): Promise<{
    spfRecord: string;
    dkimRecord: string;
    dmarcRecord: string;
} | null> {
    const existingRecords = await db
        .select()
        .from(schema.domainDnsRecord)
        .where(
            and(
                eq(schema.domainDnsRecord.domain, domain),
                eq(schema.domainDnsRecord.organizationId, organizationId),
            ),
        );

    if (existingRecords.length === 0) {
        return null;
    }

    const spf = existingRecords.find(
        (r) => r.recordType === "TXT" && r.value.startsWith("v=spf1"),
    );
    const dkim = existingRecords.find(
        (r) => r.recordType === "TXT" && r.value.startsWith("v=DKIM1"),
    );
    const dmarc = existingRecords.find(
        (r) => r.recordType === "TXT" && r.value.startsWith("v=DMARC1"),
    );

    return {
        spfRecord: spf?.value || "",
        dkimRecord: dkim?.value || "",
        dmarcRecord: dmarc?.value || "",
    };
}
