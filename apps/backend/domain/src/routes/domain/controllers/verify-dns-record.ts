import {
	verifyDkimRecord,
	verifyDmarcRecord,
	verifyMxRecord,
	verifySpfRecord,
} from "@be/domain/utils/verify-dns-records";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

export async function verifyDNSRecordHandler(params: {
	domain: string;
	organizationId: string;
}) {
	const { domain, organizationId } = params;
	try {
		const domainWithRecords = await db.query.domain.findFirst({
			where: and(
				eq(schema.domain.domain, domain),
				eq(schema.domain.organizationId, organizationId),
				isNull(schema.domain.deletedAt),
			),
			with: {
				dnsRecords: {
					where: isNull(schema.domainDnsRecord.deletedAt),
				},
			},
		});

		if (!domainWithRecords) {
			logger.warn({ domain }, "Domain not found");
			throw status(404, { message: "Domain not found" });
		}

		// Verify all DNS records
		const verificationResults = await Promise.all(
			domainWithRecords.dnsRecords.map(async (record) => {
				let isVerified = false;
				const recordType = record.recordTypeName.toUpperCase();
				try {
					switch (recordType) {
						case "MX":
							if (record.priority !== null && record.priority !== undefined) {
								isVerified = await verifyMxRecord(
									domainWithRecords.domain,
									record.value,
									record.priority,
								);
							} else {
								isVerified = false;
							}
							break;

						case "SPF":
							isVerified = await verifySpfRecord(
								domainWithRecords.domain,
								record.value,
							);
							break;

						case "DKIM":
							isVerified = await verifyDkimRecord(record.name, record.value);
							break;

						case "DMARC":
							isVerified = await verifyDmarcRecord(record.name, record.value);
							break;

						default:
							isVerified = false;
							break;
					}
				} catch (error) {
					logger.error(
						{
							domain,
							recordType,
							name: record.name,
							error: error instanceof Error ? error.message : String(error),
						},
						`Error verifying ${recordType} record`,
					);
					isVerified = false;
				}

				return {
					...record,
					isVerified,
				};
			}),
		);

		// Log summary
		const verifiedCount = verificationResults.filter(
			(r) => r.isVerified,
		).length;
		const totalCount = verificationResults.length;
		logger.info(
			{
				domain,
				verifiedCount,
				totalCount,
				verificationStatus:
					verifiedCount === totalCount ? "all_verified" : "partial_verified",
			},
			`DNS records verification completed: ${verifiedCount}/${totalCount} verified`,
		);

		return {
			...domainWithRecords,
			dnsRecords: verificationResults,
		};
	} catch (error) {
		logger.error({ domain, error }, "Error verifying DNS records");
		throw status(500, { message: "Internal server error" });
	}
}
