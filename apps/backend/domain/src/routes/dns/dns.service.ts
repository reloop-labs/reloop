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
        logger.info({ domain }, "Getting DNS records for domain");

        try {
            const records = await DNSService.getDNSRecords(domain);
            logger.info({
                domain,
                count: records.length,
            }, "DNS records retrieved successfully");
            return records;
        } catch (error) {
            logger.error({
                domain,
                error: error instanceof Error ? error.message : String(error),
            }, "Error getting DNS records");
            throw error;
        }
    }

    static async getDKIMKeys(
        domain: string,
    ): Promise<DNSTypes.DKIMKeysResponse | null> {
        logger.info({ domain }, "Getting DKIM keys for domain");

        try {
            const keys = await DNSService.getDKIMKeys(domain);
            logger.info({ domain }, "DKIM keys retrieved successfully");
            return keys;
        } catch (error) {
            logger.error({
                domain,
                error: error instanceof Error ? error.message : String(error),
            }, "Error getting DKIM keys");
            throw error;
        }
    }

    static async verifyDNSRecord(
        domain: string,
        body: DNSTypes.VerifyDNSBody,
    ): Promise<DNSTypes.VerifyDNSResponse> {
        logger.info({
            domain,
            recordType: body.recordType,
            name: body.name,
        }, "Verifying DNS record");

        try {
            const verified = await DNSService.verifyDNSRecord(
                domain,
                body.recordType,
                body.name,
            );
            logger.info({
                domain,
                recordType: body.recordType,
                name: body.name,
                verified,
            }, "DNS record verification completed");
            return { verified };
        } catch (error) {
            logger.error({
                domain,
                recordType: body.recordType,
                name: body.name,
                error: error instanceof Error ? error.message : String(error),
            }, "Error verifying DNS record");
            throw error;
        }
    }

    static async generateDNSRecords(
        domain: string,
        organizationId: string,
        userId: string,
        body: DNSTypes.GenerateDNSBody,
    ): Promise<DNSTypes.GenerateDNSResponse> {
        logger.info({
            domain,
            organizationId,
            userId,
            serverDomain: body.serverDomain,
            dkimSelector: body.dkimSelector,
        }, "Generating DNS records for domain");

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
            logger.error({
                domain,
                organizationId,
                userId,
                error: error instanceof Error ? error.message : String(error),
            }, "Error generating DNS records");
            throw error;
        }
    }

    static async deleteDNSRecords(
        domain: string,
    ): Promise<DNSTypes.DeleteDNSResponse> {
        logger.info({ domain }, "Deleting DNS records for domain");

        try {
            await DNSService.deleteDNSRecords(domain);
            const response: DNSTypes.DeleteDNSResponse = {
                message: "DNS records and DKIM keys deleted successfully",
            };
            logger.info({ domain }, "DNS records deleted successfully");
            return response;
        } catch (error) {
            logger.error({
                domain,
                error: error instanceof Error ? error.message : String(error),
            }, "Error deleting DNS records");
            throw error;
        }
    }
}
