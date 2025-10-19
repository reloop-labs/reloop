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

export async function generateAndInsertDNSRecords(
    domain: string,
    organizationId: string,
    userId: string,
    serverDomain: string,
    dkimSelector = "mail",
): Promise<void> {
    logger.info(
        {
            domain,
            organizationId,
            userId,
            serverDomain,
            dkimSelector,
        },
        "DNS records generation Details",
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

        for (const record of dnsRecordData) {
            await insertDNSRecord(record, domain, organizationId, userId);
        }

        await insertDKIMKeys(dkimKeyPair, domain, organizationId, userId);

        logger.info({
            domain,
            recordCount: dnsRecordData.length,
        }, "DNS records and DKIM keys generated successfully");
    } catch (error) {
        logger.error(
            {
                domain,
                error: error instanceof Error ? error.message : String(error),
            },
            '"Error generating DNS records"',
        );
        throw error;
    }
}

export { deleteDNSRecords, getDKIMKeys, getDNSRecords, verifyDNSRecord };
