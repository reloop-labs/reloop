import { inngest } from "@be/workflow/inngest";
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

		// Set status to "verifying"
		await db
			.update(schema.domain)
			.set({ status: "verifying" })
			.where(eq(schema.domain.id, domainWithRecords.id));
		await db
			.update(schema.domainDnsRecord)
			.set({ status: "verifying" })
			.where(eq(schema.domainDnsRecord.domainId, domainWithRecords.id));

		// Trigger Inngest workflow for background verification with exponential backoff
		try {
			await inngest.send({
				name: "domain.verification",
				data: {
					domain,
					organizationId,
					// attempt and startedAt will be set automatically by the function
				},
			});
			logger.info(
				{ domain, organizationId },
				"Triggered background domain verification workflow",
			);
		} catch (error) {
			logger.error(
				{
					domain,
					organizationId,
					error: error instanceof Error ? error.message : String(error),
				},
				"Failed to trigger domain verification workflow",
			);
			// Revert status if Inngest fails
			await db
				.update(schema.domain)
				.set({ status: domainWithRecords.status })
				.where(eq(schema.domain.id, domainWithRecords.id));
			throw status(500, {
				message: "Failed to start verification process",
			});
		}

		// Return domain with "verifying" status
		// The Inngest function will update the status asynchronously
		return {
			...domainWithRecords,
			status: "verifying",
			dnsRecords: domainWithRecords.dnsRecords.map((record) => ({
				...record,
				status: "verifying",
			})),
		};
	} catch (error) {
		logger.error({ domain, error }, "Error verifying DNS records");
		throw status(500, { message: "Internal server error" });
	}
}
