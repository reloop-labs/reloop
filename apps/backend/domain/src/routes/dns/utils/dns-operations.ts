import { logger } from "@reloop/logger";
import type { DNSTypes } from "../dns.type";
import { generateDKIMKeyPair } from "./dkim-key-generator";
import {
    deleteDNSRecords,
    getDKIMKeys,
    getDNSRecords,
    insertDKIMKeys,
    insertDNSRecord,
    verifyDNSRecord,
} from "./dns-database-operations";
import {
    generateAllDNSRecords,
    generateDKIMRecord,
} from "./dns-record-generator";

export async function generateDNSRecords(
    domain: string,
    serverDomain: string,
    dkimSelector = "mail",
): Promise<{
    dnsRecordData: DNSTypes.DNSRecordData[];
    dkimKeyPair: { publicKey: string; privateKey: string; selector: string };
    spfRecord: string;
    dkimRecord: string;
    dmarcRecord: string;
}> {
    logger.info(
        {
            domain,
            serverDomain,
            dkimSelector,
        },
        "Generating DNS records",
    );

    try {
        const dkimKeyPair = await generateDKIMKeyPair(dkimSelector);
        const dnsRecords = generateAllDNSRecords(domain, serverDomain);
        const dkimRecord = generateDKIMRecord(
            domain,
            dkimSelector,
            dkimKeyPair.publicKey,
        );
        dnsRecords.push(dkimRecord);

        const dnsRecordData: DNSTypes.DNSRecordData[] = dnsRecords.map(
            (record) => ({
                recordType: record.type,
                name: record.name,
                value: record.value,
                ttl: record.ttl || 3600,
                priority: record.priority,
                description: record.description,
                isVerified: false,
            }),
        );

        // Extract SPF, DKIM, and DMARC values to return
        const spfValue = dnsRecords.find(r => r.value.startsWith("v=spf1"))?.value || "";
        const dkimValue = dnsRecords.find(r => r.value.startsWith("v=DKIM1"))?.value || "";
        const dmarcValue = dnsRecords.find(r => r.value.startsWith("v=DMARC1"))?.value || "";

        logger.info({
            domain,
            recordCount: dnsRecordData.length,
        }, "DNS records generated successfully");

        return {
            dnsRecordData,
            dkimKeyPair,
            spfRecord: spfValue,
            dkimRecord: dkimValue,
            dmarcRecord: dmarcValue,
        };
    } catch (error) {
        logger.error(
            {
                domain,
                error: error instanceof Error ? error.message : String(error),
            },
            "Error generating DNS records",
        );
        throw error;
    }
}

/**
 * Insert DNS records and DKIM keys into the database
 */
export async function insertDNSRecords(
    dnsRecordData: DNSTypes.DNSRecordData[],
    dkimKeyPair: { publicKey: string; privateKey: string; selector: string },
    domain: string,
    organizationId: string,
    userId: string,
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

    try {
        for (const record of dnsRecordData) {
            await insertDNSRecord(record, domain, organizationId, userId);
        }

        await insertDKIMKeys(dkimKeyPair, domain, organizationId, userId);

        logger.info({
            domain,
            recordCount: dnsRecordData.length,
        }, "DNS records and DKIM keys inserted successfully");
    } catch (error) {
        logger.error(
            {
                domain,
                error: error instanceof Error ? error.message : String(error),
            },
            "Error inserting DNS records",
        );
        throw error;
    }
}

/**
 * Generate and insert DNS records for a domain (convenience function)
 * Checks for existing records and returns them if found
 */
export async function generateAndInsertDNSRecords(
    domain: string,
    organizationId: string,
    userId: string,
    serverDomain: string,
    dkimSelector = "mail",
): Promise<{ spfRecord: string; dkimRecord: string; dmarcRecord: string }> {
    logger.info(
        {
            domain,
            organizationId,
            userId,
            serverDomain,
            dkimSelector,
        },
        "DNS records generation and insertion",
    );

    // Check if the domain already has DNS records
    const existingRecords = await getDNSRecords(domain, organizationId);
    if (existingRecords.length > 0) {
        logger.info({
            domain,
            dnsRecords: existingRecords,
        }, "DNS records already exist for domain");

        // Extract and return existing SPF, DKIM, and DMARC records
        const spf = existingRecords.find(r => r.recordType === "TXT" && r.value.startsWith("v=spf1"));
        const dkim = existingRecords.find(r => r.recordType === "TXT" && r.value.startsWith("v=DKIM1"));
        const dmarc = existingRecords.find(r => r.recordType === "TXT" && r.value.startsWith("v=DMARC1"));

        return {
            spfRecord: spf?.value || "",
            dkimRecord: dkim?.value || "",
            dmarcRecord: dmarc?.value || "",
        };
    }

    // Generate DNS records
    const { dnsRecordData, dkimKeyPair, spfRecord, dkimRecord, dmarcRecord } =
        await generateDNSRecords(domain, serverDomain, dkimSelector);

    // Insert DNS records
    await insertDNSRecords(dnsRecordData, dkimKeyPair, domain, organizationId, userId);

    return {
        spfRecord,
        dkimRecord,
        dmarcRecord,
    };
}

export { deleteDNSRecords, getDKIMKeys, getDNSRecords, verifyDNSRecord };
