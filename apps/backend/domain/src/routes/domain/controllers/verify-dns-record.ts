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
		return domainWithRecords;
	} catch (error) {
		logger.error({ domain, error }, "Error verifying DNS records");
		throw status(500, { message: "Internal server error" });
	}
}
