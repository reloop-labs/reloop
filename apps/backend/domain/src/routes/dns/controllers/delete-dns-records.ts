import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { DNSTypes } from "@reloop/domain/routes/dns/dns.type";
import {
	invalidateDNSRecordsCache,
	invalidateDomainCache,
} from "@reloop/domain/utils/cache-helpers";
import { logger } from "@reloop/logger";
import { and, eq } from "drizzle-orm";

export async function deleteDNSRecordsHandler(
	domain: string,
	organizationId: string,
): Promise<DNSTypes.DeleteDNSResponse> {
	logger.info({ domain, organizationId }, "Deleting DNS records for domain");

	try {
		await db
			.delete(schema.domainDnsRecord)
			.where(
				and(
					eq(schema.domainDnsRecord.domain, domain),
					eq(schema.domainDnsRecord.organizationId, organizationId),
				),
			);
		await invalidateDomainCache(domain, organizationId);
		await invalidateDNSRecordsCache(domain, organizationId);

		logger.info({ domain, organizationId }, "DNS records deleted successfully");

		const response: DNSTypes.DeleteDNSResponse = {
			message: "DNS records and DKIM keys deleted successfully",
		};
		return response;
	} catch (error) {
		logger.error(
			{
				domain,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error deleting DNS records",
		);
		throw error;
	}
}
