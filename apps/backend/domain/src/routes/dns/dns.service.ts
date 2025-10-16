import { generateKeyPair } from "node:crypto";
import { promisify } from "node:util";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq } from "drizzle-orm";
import type { DNSTypes } from "./dns.type";

const generateKeyPairAsync = promisify(generateKeyPair);


export class DNSService {
    static async generateKeyPair(
        selector = "mail",
        keyLength = 2048,
    ): Promise<DNSTypes.DKIMKeyPair> {
        try {
            const { publicKey, privateKey } = await generateKeyPairAsync("rsa", {
                modulusLength: keyLength,
                publicKeyEncoding: {
                    type: "spki",
                    format: "pem",
                },
                privateKeyEncoding: {
                    type: "pkcs8",
                    format: "pem",
                },
            });

            return {
                publicKey,
                privateKey,
                selector,
            };
        } catch (error) {
            throw new Error(`Failed to generate DKIM key pair: ${error}`);
        }
    }

    static generateDKIMRecord(
        domain: string,
        selector: string,
        publicKey: string,
    ): DNSTypes.DNSRecord {
        // Remove PEM headers and format the public key for DNS
        const cleanPublicKey = publicKey
            .replace(/-----BEGIN PUBLIC KEY-----/, "")
            .replace(/-----END PUBLIC KEY-----/, "")
            .replace(/\s/g, "");

        const dkimValue = `v=DKIM1; k=rsa; p=${cleanPublicKey}`;

        return {
            type: "TXT",
            name: `${selector}._domainkey.${domain}`,
            value: dkimValue,
            ttl: 3600,
            description: "DKIM public key for email authentication",
        };
    }

    static generateSPFRecord(domain: string, serverIP: string): DNSTypes.DNSRecord {
        const spfValue = `v=spf1 ip4:${serverIP} mx a:${domain} ~all`;

        return {
            type: "TXT",
            name: domain,
            value: spfValue,
            ttl: 3600,
            description: "SPF record for email authentication",
        };
    }

    static generateDMARCRecord(domain: string): DNSTypes.DNSRecord {
        const dmarcValue = `v=DMARC1; p=quarantine; rua=mailto:dmarc@${domain}; ruf=mailto:dmarc@${domain}; sp=quarantine; adkim=r; aspf=r;`;

        return {
            type: "TXT",
            name: `_dmarc.${domain}`,
            value: dmarcValue,
            ttl: 3600,
            description: "DMARC policy for email authentication",
        };
    }

    static generateMXRecord(domain: string, priority = 10): DNSTypes.DNSRecord {
        return {
            type: "MX",
            name: domain,
            value: domain,
            priority,
            ttl: 3600,
            description: "Mail exchange record",
        };
    }

    static generateARecord(domain: string, serverIP: string): DNSTypes.DNSRecord {
        return {
            type: "A",
            name: domain,
            value: serverIP,
            ttl: 3600,
            description: "Domain A record pointing to mail server",
        };
    }

    static generateAllDNSRecords(domain: string, serverIP: string): DNSTypes.DNSRecord[] {
        return [
            DNSService.generateARecord(domain, serverIP),
            DNSService.generateMXRecord(domain),
            DNSService.generateSPFRecord(domain, serverIP),
            DNSService.generateDMARCRecord(domain),
        ];
    }

    static async generateAndInsertDNSRecords(
        domain: string,
        organizationId: string,
        userId: string,
        serverIP: string,
        dkimSelector = "mail",
    ): Promise<void> {
        logger.info("Generating DNS records for domain", {
            domain,
            organizationId,
            userId,
            serverIP,
            dkimSelector,
        });

        try {
            // Generate DKIM key pair
            const dkimKeyPair = await DNSService.generateKeyPair(dkimSelector);

            // Generate all DNS records
            const dnsRecords = DNSService.generateAllDNSRecords(domain, serverIP);

            // Add DKIM record to the list
            const dkimRecord = DNSService.generateDKIMRecord(
                domain,
                dkimSelector,
                dkimKeyPair.publicKey,
            );
            dnsRecords.push(dkimRecord);

            // Convert to database format
            const dnsRecordData: DNSTypes.DNSRecordData[] = dnsRecords.map((record) => ({
                recordType: record.type,
                name: record.name,
                value: record.value,
                ttl: record.ttl || 3600,
                priority: record.priority,
                description: record.description,
                isVerified: false,
            }));

            // Insert DNS records into database one by one
            for (const record of dnsRecordData) {
                await db.insert(schema.dnsRecord).values({
                    id: Math.floor(Math.random() * 1000000000), // Generate a random ID for now
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
            }

            // Insert DKIM keys into database
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

            logger.info("DNS records and DKIM keys generated successfully", {
                domain,
                recordCount: dnsRecordData.length,
            });
        } catch (error) {
            logger.error("Error generating DNS records", {
                domain,
                error: error instanceof Error ? error.message : String(error),
            });
            throw error;
        }
    }

    static async getDNSRecords(domain: string): Promise<DNSTypes.DNSRecordData[]> {
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

    static async getDKIMKeys(domain: string): Promise<DNSTypes.DKIMKeysResponse | null> {
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

    static async verifyDNSRecord(
        domain: string,
        recordType: string,
        name: string,
    ): Promise<boolean> {
        logger.info("Verifying DNS record", { domain, recordType, name });

        try {
            // This would typically involve making a DNS query to verify the record exists
            // For now, we'll just mark it as verified in the database
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

    static async deleteDNSRecords(domain: string): Promise<void> {
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
}

export class DNSServiceHandler {
    static async getDNSRecords(domain: string): Promise<DNSTypes.DNSRecordResponse[]> {
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

    static async getDKIMKeys(domain: string): Promise<DNSTypes.DKIMKeysResponse | null> {
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

            const response: DNSTypes.GenerateDNSResponse = {
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

    static async deleteDNSRecords(domain: string): Promise<DNSTypes.DeleteDNSResponse> {
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
