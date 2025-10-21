import { logger } from "@reloop/logger";
import { ValidationService } from "../validation.service";
import type { ValidationTypes } from "../validation.type";

export async function validateDnsRecordsHandler(
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
