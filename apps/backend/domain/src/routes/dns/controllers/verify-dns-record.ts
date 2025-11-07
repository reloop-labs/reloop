import type { DNSTypes } from "@be/domain/routes/dns/dns.type";
import {
	invalidateDNSRecordsCache,
	invalidateDomainCache,
} from "@be/domain/utils/cache-helpers";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { inngest } from "@reloop/inngest/client";
import { logger } from "@reloop/logger";
import { and, eq } from "drizzle-orm";

export async function verifyDNSRecordHandler(
	domain: string,
	body: DNSTypes.VerifyDNSBody,
	organizationId: string,
): Promise<DNSTypes.VerifyDNSResponse> {
	logger.info(
		{
			domain,
			recordType: body.recordType,
			name: body.name,
		},
		"Verifying DNS record",
	);

	try {
		const domainRecord = await db
			.select({ id: schema.domain.id })
			.from(schema.domain)
			.where(eq(schema.domain.domain, domain))
			.limit(1);

		if (domainRecord.length === 0 || !domainRecord[0]) {
			logger.warn({ domain }, "Domain not found when verifying DNS record");
			return { verified: false };
		}

		await db
			.update(schema.domainDnsRecord)
			.set({
				isVerified: true,
				status: "active",
				updatedAt: new Date(),
			})
			.where(
				and(
					eq(schema.domainDnsRecord.domainId, domainRecord[0].id),
					eq(
						schema.domainDnsRecord.recordType,
						body.recordType as
						| "A"
						| "AAAA"
						| "CNAME"
						| "MX"
						| "TXT"
						| "NS"
						| "SRV"
						| "CAA"
						| "SPF"
						| "DKIM"
						| "DMARC",
					),
					eq(schema.domainDnsRecord.name, body.name),
				),
			);

		logger.info(
			{
				domain,
				recordType: body.recordType,
				name: body.name,
			},
			"DNS record marked as verified",
		);

		// Trigger DNS verification workflow via Inngest for background verification
		try {
			const dnsRecord = await db.query.domainDnsRecord.findFirst({
				where: and(
					eq(schema.domainDnsRecord.domainId, domainRecord[0].id),
					eq(
						schema.domainDnsRecord.recordType,
						body.recordType as
						| "A"
						| "AAAA"
						| "CNAME"
						| "MX"
						| "TXT"
						| "NS"
						| "SRV"
						| "CAA"
						| "SPF"
						| "DKIM"
						| "DMARC",
					),
					eq(schema.domainDnsRecord.name, body.name),
				),
			});

			if (dnsRecord) {
				await inngest.send({
					name: "verify/dns-record",
					data: {
						dnsRecordId: dnsRecord.id,
						domainId: domainRecord[0].id,
						recordType: body.recordType,
						name: body.name,
						value: dnsRecord.value,
						organizationId: organizationId,
					},
				});
				logger.info(
					{ dnsRecordId: dnsRecord.id },
					"DNS record verification triggered",
				);
			}
		} catch (error) {
			logger.warn(
				{
					domain,
					error: error instanceof Error ? error.message : String(error),
				},
				"Failed to trigger DNS verification, will continue with manual verification",
			);
		}

		// Invalidate caches after successful verification
		await invalidateDomainCache(domain, organizationId);
		await invalidateDNSRecordsCache(domain, organizationId);

		return { verified: true };
	} catch (error) {
		logger.error(
			{
				domain,
				recordType: body.recordType,
				name: body.name,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error verifying DNS record",
		);
		return { verified: false };
	}
}
