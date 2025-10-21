import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq } from "drizzle-orm";
import { status } from "elysia";
import { getExistingDNSRecords } from "../../../utils";
import {
    generateDNSRecords,
    insertDNSRecordsToDatabase,
} from "../../dns/controllers/generate-dns-records";
import type { DomainTypes } from "../domain.type";
import { formatDomainResponse } from "./format-domain-response";

export async function createDomain(
    organizationId: string,
    userId: string,
    domain: string,
    serverIP = "mail.reloop.sh",
): Promise<DomainTypes.DomainResponse> {
    logger.info(
        {
            domain: domain,
            organizationId: organizationId,
            userId: userId,
        },
        "Creating domain",
    );
    try {
        const existingDomain = await db
            .select()
            .from(schema.domain)
            .where(
                and(
                    eq(schema.domain.domain, domain),
                    eq(schema.domain.organizationId, organizationId),
                ),
            )
            .limit(1);
        if (existingDomain.length > 0) {
            logger.warn({ domain }, "Domain already exists");
            throw status(409, { message: "Domain already exists" });
        }
        // Check if DNS records already exist
        const existingRecords = await getExistingDNSRecords(domain, organizationId);

        let dnsData: {
            spfRecord: string;
            dkimRecord: string;
            dmarcRecord: string;
        };
        if (existingRecords) {
            logger.info({ domain }, "Using existing DNS records");
            dnsData = {
                spfRecord: existingRecords.spfRecord,
                dkimRecord: existingRecords.dkimRecord,
                dmarcRecord: existingRecords.dmarcRecord,
            };
        } else {
            const generatedDNS = await generateDNSRecords(domain, serverIP, "reloop");
            dnsData = {
                spfRecord: generatedDNS.spfRecord,
                dkimRecord: generatedDNS.dkimRecord,
                dmarcRecord: generatedDNS.dmarcRecord,
            };
        }

        const newDomain = await db
            .insert(schema.domain)
            .values({
                userId: userId,
                organizationId: organizationId,
                domain: domain,
                domainType: "custom",
                status: "start-verify",
                userVerified: false,
                systemVerified: false,
                dnsConfigured: false,
                dkimSelector: "reloop",
                dmarcPolicy: "none",
                trackingDomain: false,
                createdAt: new Date(),
                updatedAt: new Date(),
                spfRecord: dnsData.spfRecord,
                dkimRecord: dnsData.dkimRecord,
                dmarcRecord: dnsData.dmarcRecord,
            })
            .returning();
        if (!newDomain[0]) {
            logger.error({ domain }, "Failed to create domain - no data returned");
            throw status(500, { message: "Failed to create domain" });
        }
        if (!existingRecords) {
            try {
                const generatedDNS = await generateDNSRecords(domain, serverIP, "reloop");
                await insertDNSRecordsToDatabase(
                    domain,
                    organizationId,
                    userId,
                    generatedDNS.dnsData,
                );

                // Update the domain table with the generated DNS record values
                await db
                    .update(schema.domain)
                    .set({
                        spfRecord: generatedDNS.spfRecord,
                        dkimRecord: generatedDNS.dkimRecord,
                        dmarcRecord: generatedDNS.dmarcRecord,
                        updatedAt: new Date(),
                    })
                    .where(
                        and(
                            eq(schema.domain.domain, domain),
                            eq(schema.domain.organizationId, organizationId),
                        ),
                    );

                logger.info(
                    {
                        domain,
                        spfRecord: generatedDNS.spfRecord,
                        dkimRecord: generatedDNS.dkimRecord,
                        dmarcRecord: generatedDNS.dmarcRecord,
                    },
                    "DNS records generated and stored successfully",
                );
            } catch (dnsError) {
                logger.error(
                    {
                        domain,
                        error:
                            dnsError instanceof Error ? dnsError.message : String(dnsError),
                    },
                    "Failed to generate DNS records and DKIM keys",
                );
            }
        }
        const domainWithDnsRecords = await db.query.domain.findFirst({
            where: eq(schema.domain.id, newDomain[0].id),
            with: {
                dnsRecords: true,
            },
        });

        logger.info(
            {
                domain,
                id: newDomain[0].id,
            },
            "Domain created successfully",
        );
        if (!domainWithDnsRecords) {
            logger.error(
                { domain },
                "Failed to fetch domain with DNS records after creation",
            );
            throw status(500, { message: "Failed to fetch domain data" });
        }
        return formatDomainResponse(
            domainWithDnsRecords,
            domainWithDnsRecords.dnsRecords || [],
        );
    } catch (error) {
        logger.error(
            {
                domain,
                error: error instanceof Error ? error.message : String(error),
            },
            "Error creating domain",
        );
        if (error instanceof Error && error.message.includes("already exists")) {
            throw status(409, { message: "Domain already exists" });
        }
        throw error;
    }
}

export async function createDomainHandler(
    organizationId: string,
    userId: string,
    body: DomainTypes.CreateDomainRequest,
): Promise<DomainTypes.DomainResponse> {
    logger.info(
        {
            domain: body.domain,
            organizationId,
            userId,
        },
        "Creating domain",
    );

    try {
        const domain = await createDomain(
            organizationId,
            userId,
            body.domain,
            "mail.reloop.sh",
        );

        logger.info(
            {
                domain: body.domain,
                organizationId,
                userId,
            },
            "Domain created successfully",
        );

        return domain;
    } catch (error) {
        logger.error(
            {
                domain: body.domain,
                organizationId,
                userId,
                error: error instanceof Error ? error.message : String(error),
            },
            "Error creating domain",
        );
        throw error;
    }
}
