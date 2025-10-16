import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { generateKeyPair } from "crypto";
import { and, eq } from "drizzle-orm";
import { promisify } from "util";

const generateKeyPairAsync = promisify(generateKeyPair);

export interface DKIMKeyPair {
    publicKey: string;
    privateKey: string;
    selector: string;
}

export interface DNSRecord {
    type: string;
    name: string;
    value: string;
    ttl?: number;
    priority?: number;
    description?: string;
}

export interface DNSRecordData {
    recordType: string;
    name: string;
    value: string;
    ttl: number;
    priority?: number;
    description?: string;
    isVerified: boolean;
}

export class DNSService {
    /**
     * Generate DKIM key pair
     */
    static async generateKeyPair(
        selector = "mail",
        keyLength = 2048,
    ): Promise<DKIMKeyPair> {
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

    /**
     * Generate DKIM DNS record
     */
    static generateDKIMRecord(
        domain: string,
        selector: string,
        publicKey: string,
    ): DNSRecord {
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

    /**
     * Generate SPF record
     */
    static generateSPFRecord(domain: string, serverIP: string): DNSRecord {
        const spfValue = `v=spf1 ip4:${serverIP} mx a:${domain} ~all`;

        return {
            type: "TXT",
            name: domain,
            value: spfValue,
            ttl: 3600,
            description: "SPF record for email authentication",
        };
    }

    /**
     * Generate DMARC record
     */
    static generateDMARCRecord(domain: string): DNSRecord {
        const dmarcValue = `v=DMARC1; p=quarantine; rua=mailto:dmarc@${domain}; ruf=mailto:dmarc@${domain}; sp=quarantine; adkim=r; aspf=r;`;

        return {
            type: "TXT",
            name: `_dmarc.${domain}`,
            value: dmarcValue,
            ttl: 3600,
            description: "DMARC policy for email authentication",
        };
    }

    /**
     * Generate MX record
     */
    static generateMXRecord(domain: string, priority = 10): DNSRecord {
        return {
            type: "MX",
            name: domain,
            value: domain,
            priority,
            ttl: 3600,
            description: "Mail exchange record",
        };
    }

    /**
     * Generate A record
     */
    static generateARecord(domain: string, serverIP: string): DNSRecord {
        return {
            type: "A",
            name: domain,
            value: serverIP,
            ttl: 3600,
            description: "Domain A record pointing to mail server",
        };
    }

    /**
     * Generate all DNS records for a domain
     */
    static generateAllDNSRecords(
        domain: string,
        serverIP: string,
    ): DNSRecord[] {
        return [
            DNSService.generateARecord(domain, serverIP),
            DNSService.generateMXRecord(domain),
            DNSService.generateSPFRecord(domain, serverIP),
            DNSService.generateDMARCRecord(domain),
        ];
    }

    /**
     * Generate and insert DNS records for a domain
     */
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
            const dnsRecords = DNSService.generateAllDNSRecords(
                domain,
                serverIP,
            );

            // Add DKIM record to the list
            const dkimRecord = DNSService.generateDKIMRecord(
                domain,
                dkimSelector,
                dkimKeyPair.publicKey,
            );
            dnsRecords.push(dkimRecord);

            // Convert to database format
            const dnsRecordData: DNSRecordData[] = dnsRecords.map((record) => ({
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

    /**
     * Get DNS records for a domain
     */
    static async getDNSRecords(domain: string): Promise<DNSRecordData[]> {
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

    /**
     * Get DKIM keys for a domain
     */
    static async getDKIMKeys(domain: string): Promise<{
        selector: string;
        publicKey: string;
        privateKey: string;
        keyLength: number;
        algorithm: string;
    } | null> {
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

    /**
     * Verify DNS record
     */
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

    /**
     * Delete DNS records for a domain
     */
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
