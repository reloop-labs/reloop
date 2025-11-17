import type { VerifyTypes } from "@be/domain/types/verify.type";
import { VerifyService } from "@be/domain/utils/dns-record-verify.service";
import { logger } from "@reloop/logger";

export async function verifyDNSRecordHandler(
	body: VerifyTypes.DnsVerifyRequest,
): Promise<VerifyTypes.DnsVerifyResult> {
	logger.info(
		{
			domain: body.domain,
			recordTypes: body.recordTypes,
		},
		"Verifying DNS records",
	);

	try {
		const result = await VerifyService.verifyDnsRecords(body);
		logger.info(
			{
				domain: body.domain,
				isValid: result.isValid,
				recordsCount: result.records.length,
				missingRecords: result.missingRecords,
				errors: result.errors,
			},
			"DNS validation completed",
		);
		return result;
	} catch (error) {
		logger.error(
			{
				domain: body.domain,
				recordTypes: body.recordTypes,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error validating DNS records",
		);
		throw error;
	}
}
