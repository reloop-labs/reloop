import { logger } from "@reloop/logger";
import { DNSService } from "../../lib/dns-service";
import type { DNSModel } from "./model";

type DNSRecordResponse = DNSModel.DNSRecordResponse;
type DKIMKeysResponse = DNSModel.DKIMKeysResponse;
type GenerateDNSBody = DNSModel.GenerateDNSBody;
type GenerateDNSResponse = DNSModel.GenerateDNSResponse;
type VerifyDNSBody = DNSModel.VerifyDNSBody;
type VerifyDNSResponse = DNSModel.VerifyDNSResponse;
type DeleteDNSResponse = DNSModel.DeleteDNSResponse;

export class DNSServiceHandler {
    /**
     * Get DNS records for a domain
     */
    static async getDNSRecords(domain: string): Promise<DNSRecordResponse[]> {
        logger.info("Getting DNS records for domain", { domain });

        try {
            const records = await DNSService.getDNSRecords(domain);
            logger.info("DNS records retrieved successfully", {
                domain,
                count: records.length
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

    /**
     * Get DKIM keys for a domain
     */
    static async getDKIMKeys(domain: string): Promise<DKIMKeysResponse | null> {
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

    /**
     * Verify DNS record
     */
    static async verifyDNSRecord(
        domain: string,
        body: VerifyDNSBody,
    ): Promise<VerifyDNSResponse> {
        logger.info("Verifying DNS record", {
            domain,
            recordType: body.recordType,
            name: body.name
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
                verified
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

    /**
     * Generate DNS records for a domain
     */
    static async generateDNSRecords(
        domain: string,
        organizationId: string,
        userId: string,
        body: GenerateDNSBody,
    ): Promise<GenerateDNSResponse> {
        logger.info("Generating DNS records for domain", {
            domain,
            organizationId,
            userId,
            serverIP: body.serverIP,
            dkimSelector: body.dkimSelector,
        });

        try {
            await DNSService.generateAndInsertDNSRecords(
                domain,
                organizationId,
                userId,
                body.serverIP || "127.0.0.1",
                body.dkimSelector || "mail",
            );

            const response = {
                message: "DNS records and DKIM keys generated successfully",
                domain,
                serverIP: body.serverIP || "127.0.0.1",
                dkimSelector: body.dkimSelector || "mail",
            };

            logger.info("DNS records generated successfully", response);
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

    /**
     * Delete DNS records for a domain
     */
    static async deleteDNSRecords(domain: string): Promise<DeleteDNSResponse> {
        logger.info("Deleting DNS records for domain", { domain });

        try {
            await DNSService.deleteDNSRecords(domain);
            const response = { message: "DNS records and DKIM keys deleted successfully" };
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
