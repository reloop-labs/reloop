import { logger } from "@reloop/logger";
import type { DNSTypes } from "./dns.type";
import {
    deleteDNSRecords,
    generateAndInsertDNSRecords,
    getDKIMKeys,
    getDNSRecords,
    verifyDNSRecord,
} from "./utils/dns-operations";

export class DNSService {
    static async generateAndInsertDNSRecords(
        domain: string,
        organizationId: string,
        userId: string,
        serverDomain: string,
        dkimSelector = "mail",
    ): Promise<void> {
        return generateAndInsertDNSRecords(domain, organizationId, userId, serverDomain, dkimSelector);
    }

    static async getDNSRecords(
        domain: string,
    ): Promise<DNSTypes.DNSRecordData[]> {
        return getDNSRecords(domain);
    }

    static async getDKIMKeys(
        domain: string,
    ): Promise<DNSTypes.DKIMKeysResponse | null> {
        return getDKIMKeys(domain);
    }

    static async verifyDNSRecord(
        domain: string,
        recordType: string,
        name: string,
    ): Promise<boolean> {
        return verifyDNSRecord(domain, recordType, name);
    }

    static async deleteDNSRecords(domain: string): Promise<void> {
        return deleteDNSRecords(domain);
    }
}

export class DNSServiceHandler {
    static async getDNSRecords(
        domain: string,
    ): Promise<DNSTypes.DNSRecordResponse[]> {
        logger.info("Getting DNS records for domain", { domain });

        try {
            const records = await DNSService.getDNSRecords(domain);
            logger.info("DNS records retrieved successfully", {
                domain,
                count: records.length,
            });
            return records;
        } catch (error) {
            logger.error("Error getting DNS records", {
                domain,
                error: error instanceof Error ? error.message : String(error),
            });
            throw error;
        }
    }

    static async getDKIMKeys(
        domain: string,
    ): Promise<DNSTypes.DKIMKeysResponse | null> {
        logger.info("Getting DKIM keys for domain", { domain });

        try {
            const keys = await DNSService.getDKIMKeys(domain);
            logger.info("DKIM keys retrieved successfully", { domain });
            return keys;
        } catch (error) {
            logger.error("Error getting DKIM keys", {
                domain,
                error: error instanceof Error ? error.message : String(error),
            });
            throw error;
        }
    }

    static async verifyDNSRecord(
        domain: string,
        body: DNSTypes.VerifyDNSBody,
    ): Promise<DNSTypes.VerifyDNSResponse> {
        logger.info("Verifying DNS record", {
            domain,
            recordType: body.recordType,
            name: body.name,
        });

        try {
            const verified = await DNSService.verifyDNSRecord(
                domain,
                body.recordType,
                body.name,
            );
            logger.info("DNS record verification completed", {
                domain,
                recordType: body.recordType,
                name: body.name,
                verified,
            });
            return { verified };
        } catch (error) {
            logger.error("Error verifying DNS record", {
                domain,
                recordType: body.recordType,
                name: body.name,
                error: error instanceof Error ? error.message : String(error),
            });
            throw error;
        }
    }

    static async generateDNSRecords(
        domain: string,
        organizationId: string,
        userId: string,
        body: DNSTypes.GenerateDNSBody,
    ): Promise<DNSTypes.GenerateDNSResponse> {
        logger.info("Generating DNS records for domain", {
            domain,
            organizationId,
            userId,
            serverDomain: body.serverDomain,
            dkimSelector: body.dkimSelector,
        });

        try {
            await DNSService.generateAndInsertDNSRecords(
                domain,
                organizationId,
                userId,
                body.serverDomain || domain,
                body.dkimSelector || "mail",
            );

            const response: DNSTypes.GenerateDNSResponse = {
                message: "DNS records and DKIM keys generated successfully",
                domain,
                serverDomain: body.serverDomain || domain,
                dkimSelector: body.dkimSelector || "mail",
            };

            logger.info({ ...response }, "DNS records generated successfully");
            return response;
        } catch (error) {
            logger.error("Error generating DNS records", {
                domain,
                organizationId,
                userId,
                error: error instanceof Error ? error.message : String(error),
            });
            throw error;
        }
    }

    static async deleteDNSRecords(
        domain: string,
    ): Promise<DNSTypes.DeleteDNSResponse> {
        logger.info("Deleting DNS records for domain", { domain });

        try {
            await DNSService.deleteDNSRecords(domain);
            const response: DNSTypes.DeleteDNSResponse = {
                message: "DNS records and DKIM keys deleted successfully",
            };
            logger.info("DNS records deleted successfully", { domain });
            return response;
        } catch (error) {
            logger.error("Error deleting DNS records", {
                domain,
                error: error instanceof Error ? error.message : String(error),
            });
            throw error;
        }
    }
}
