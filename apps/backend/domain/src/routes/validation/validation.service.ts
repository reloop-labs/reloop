import { logger } from "@reloop/logger";
import { lookup, resolveCname, resolveMx, resolveTxt } from "dns";
import { promisify } from "util";
import type { ValidationTypes } from "./validation.type";

export class ValidationService {
    static async validateDnsRecords(
        data: ValidationTypes.DnsValidationRequest,
    ): Promise<ValidationTypes.DnsValidationResult> {
        const { domain, recordTypes = ["MX", "A", "TXT", "CNAME"] } = data;
        const records: ValidationTypes.DnsRecordData[] = [];
        const missingRecords: string[] = [];
        const errors: string[] = [];
        let isValid = true;

        const dnsLookup = promisify(lookup);

        for (const recordType of recordTypes) {
            try {
                switch (recordType.toUpperCase()) {
                    case "A":
                        try {
                            const result = await dnsLookup(domain, { family: 4 });
                            records.push({
                                type: "A",
                                name: domain,
                                value: result.address,
                                ttl: 300,
                            });
                        } catch {
                            missingRecords.push("A");
                            isValid = false;
                        }
                        break;

                    case "MX":
                        try {
                            const mxRecords =
                                await ValidationService.resolveMxRecords(domain);
                            if (mxRecords.length === 0) {
                                missingRecords.push("MX");
                                isValid = false;
                            } else {
                                records.push(...mxRecords);
                            }
                        } catch {
                            missingRecords.push("MX");
                            isValid = false;
                        }
                        break;

                    case "TXT":
                        try {
                            const txtRecords =
                                await ValidationService.resolveTxtRecords(domain);
                            if (txtRecords.length === 0) {
                                missingRecords.push("TXT");
                                isValid = false;
                            } else {
                                records.push(...txtRecords);
                            }
                        } catch {
                            missingRecords.push("TXT");
                            isValid = false;
                        }
                        break;

                    case "CNAME":
                        try {
                            const cnameRecords =
                                await ValidationService.resolveCnameRecords(domain);
                            if (cnameRecords.length === 0) {
                                missingRecords.push("CNAME");
                                isValid = false;
                            } else {
                                records.push(...cnameRecords);
                            }
                        } catch {
                            missingRecords.push("CNAME");
                            isValid = false;
                        }
                        break;

                    default:
                        errors.push(`Unsupported record type: ${recordType}`);
                        break;
                }
            } catch (error) {
                errors.push(
                    `Failed to resolve ${recordType} record: ${error instanceof Error ? error.message : "Unknown error"}`,
                );
                isValid = false;
            }
        }

        return {
            domain,
            isValid,
            records,
            missingRecords,
            errors,
            checkedAt: new Date().toISOString(),
        };
    }

    private static async resolveMxRecords(domain: string): Promise<ValidationTypes.DnsRecordData[]> {
        return new Promise((resolve, reject) => {
            resolveMx(domain, (err, addresses) => {
                if (err) {
                    reject(err);
                    return;
                }

                const records: ValidationTypes.DnsRecordData[] = [];
                if (addresses && Array.isArray(addresses)) {
                    addresses.forEach((address) => {
                        records.push({
                            type: "MX",
                            name: domain,
                            value: address.exchange,
                            ttl: 300,
                            priority: address.priority,
                        });
                    });
                }
                resolve(records);
            });
        });
    }

    private static async resolveTxtRecords(domain: string): Promise<ValidationTypes.DnsRecordData[]> {
        return new Promise((resolve, reject) => {
            resolveTxt(domain, (err, addresses) => {
                if (err) {
                    reject(err);
                    return;
                }

                const records: ValidationTypes.DnsRecordData[] = [];
                if (addresses && Array.isArray(addresses)) {
                    addresses.forEach((address) => {
                        const value = Array.isArray(address) ? address.join("") : address;
                        records.push({
                            type: "TXT",
                            name: domain,
                            value: value,
                            ttl: 300,
                        });
                    });
                }
                resolve(records);
            });
        });
    }

    private static async resolveCnameRecords(
        domain: string,
    ): Promise<ValidationTypes.DnsRecordData[]> {
        return new Promise((resolve, reject) => {
            resolveCname(domain, (err, addresses) => {
                if (err) {
                    reject(err);
                    return;
                }

                const records: ValidationTypes.DnsRecordData[] = [];
                if (addresses && Array.isArray(addresses)) {
                    addresses.forEach((address) => {
                        records.push({
                            type: "CNAME",
                            name: domain,
                            value: address,
                            ttl: 300,
                        });
                    });
                }
                resolve(records);
            });
        });
    }
}

export class ValidationServiceHandler {
    static async validateDnsRecords(
        body: ValidationTypes.DnsValidationRequest,
    ): Promise<ValidationTypes.DnsValidationResult> {
        logger.info({
            domain: body.domain,
            recordTypes: body.recordTypes,
        }, "Validating DNS records");

        try {
            const result = await ValidationService.validateDnsRecords(body);
            logger.info({
                domain: body.domain,
                isValid: result.isValid,
                recordsCount: result.records.length,
                missingRecords: result.missingRecords,
                errors: result.errors,
            }, "DNS validation completed");
            return result;
        } catch (error) {
            logger.error({
                domain: body.domain,
                recordTypes: body.recordTypes,
                error: error instanceof Error ? error.message : String(error),
            }, "Error validating DNS records");
            throw error;
        }
    }
}
