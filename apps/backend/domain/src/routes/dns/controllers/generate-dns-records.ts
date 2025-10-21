import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { DNSTypes } from "@reloop/domain/routes/dns/dns.type";
import {
    convertToDNSRecordData,
    type GeneratedDNSData,
    generateDNSData,
    getExistingDNSRecords,
    insertDNSRecords,
} from "@reloop/domain/utils";
import {
    invalidateDNSRecordsCache,
    invalidateDomainCache,
} from "@reloop/domain/utils/cache-helpers";
import { logger } from "@reloop/logger";
import { and, eq } from "drizzle-orm";

export async function generateDNSRecords(
    domain: string,
    serverDomain: string,
    dkimSelector = "mail",
): Promise<{
    spfRecord: string;
    dkimRecord: string;
    dmarcRecord: string;
    dnsData: GeneratedDNSData;
}> {
    logger.info(
        {
            domain,
            serverDomain,
            dkimSelector,
        },
        "Generating DNS records",
    );
    const dnsData = await generateDNSData(domain, serverDomain, dkimSelector);

    return {
        spfRecord: dnsData.spfRecord,
        dkimRecord: dnsData.dkimRecord,
        dmarcRecord: dnsData.dmarcRecord,
        dnsData,
    };
}

export async function insertDNSRecordsToDatabase(
    domain: string,
    organizationId: string,
    userId: string,
    dnsData: GeneratedDNSData,
): Promise<void> {
    logger.info(
        {
            domain,
            organizationId,
            userId,
        },
        "Inserting DNS records to database",
    );

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
        throw new Error(
            `Domain ${domain} not found for organization ${organizationId}`,
        );
    }

    const dnsRecordData = convertToDNSRecordData(dnsData.dnsRecords);
    await insertDNSRecords(
        dnsRecordData,
        dnsData.dkimKeyPair,
        domain,
        organizationId,
        userId,
        domainRecord[0].id,
    );
}

export async function generateDNSRecordsHandler(
    domain: string,
    organizationId: string,
    userId: string,
    body: DNSTypes.GenerateDNSBody,
): Promise<DNSTypes.GenerateDNSResponse> {
    logger.info(
        {
            domain,
            organizationId,
            userId,
            serverDomain: body.serverDomain,
            dkimSelector: body.dkimSelector,
        },
        "Generating DNS records for domain",
    );

    try {
        const existingRecords = await getExistingDNSRecords(domain, organizationId);

        if (existingRecords) {
            logger.info(
                {
                    domain,
                    dnsRecords: existingRecords,
                },
                "DNS records already exist for domain",
            );

            const response: DNSTypes.GenerateDNSResponse = {
                message: "DNS records already exist",
                domain,
                serverDomain: body.serverDomain || domain,
                dkimSelector: body.dkimSelector || "mail",
            };

            return response;
        }

        const dnsRecords = await generateDNSRecords(
            domain,
            body.serverDomain || domain,
            body.dkimSelector || "mail",
        );

        await insertDNSRecordsToDatabase(
            domain,
            organizationId,
            userId,
            dnsRecords.dnsData,
        );
        await db
            .update(schema.domain)
            .set({
                spfRecord: dnsRecords.spfRecord,
                dkimRecord: dnsRecords.dkimRecord,
                dmarcRecord: dnsRecords.dmarcRecord,
                updatedAt: new Date(),
            })
            .where(
                and(
                    eq(schema.domain.domain, domain),
                    eq(schema.domain.organizationId, organizationId),
                ),
            );

        const response: DNSTypes.GenerateDNSResponse = {
            message: "DNS records and DKIM keys generated successfully",
            domain,
            serverDomain: body.serverDomain || domain,
            dkimSelector: body.dkimSelector || "mail",
        };

        logger.info(
            {
                ...response,
                spfRecord: dnsRecords.spfRecord,
                dkimRecord: dnsRecords.dkimRecord,
                dmarcRecord: dnsRecords.dmarcRecord,
            },
            "DNS records generated successfully",
        );

        // Invalidate caches after successful DNS record generation
        await invalidateDomainCache(domain, organizationId);
        await invalidateDNSRecordsCache(domain, organizationId);

        return response;
    } catch (error) {
        logger.error(
            {
                domain,
                organizationId,
                userId,
                error: error instanceof Error ? error.message : String(error),
            },
            "Error generating DNS records",
        );
        throw error;
    }
}
