import { db } from "@reloop/db/client";
import { domain, domainDnsRecord, smtpProvider } from "@reloop/db/schema";
import { findOrgSmtpProvider } from "@reloop/domain/lib/smtp-provider";
import { and, eq, inArray, isNull, notExists } from "drizzle-orm";

/**
 * Domains that only existed for this relay (no Reloop DNS records) are
 * soft-deleted with it. Domains with Reloop DNS fall back to direct delivery
 * (FK set null) and are re-checked on their next send.
 */
export async function deleteSmtpProviderController({
	organizationId,
	providerId,
}: {
	organizationId: string;
	providerId: string;
}) {
	await findOrgSmtpProvider(organizationId, providerId);

	await db.transaction(async (tx) => {
		const relayOnly = await tx
			.select({ id: domain.id })
			.from(domain)
			.where(
				and(
					eq(domain.smtpProviderId, providerId),
					eq(domain.organizationId, organizationId),
					isNull(domain.deletedAt),
					notExists(
						tx
							.select({ id: domainDnsRecord.id })
							.from(domainDnsRecord)
							.where(
								and(
									eq(domainDnsRecord.domainId, domain.id),
									eq(domainDnsRecord.recordTypeName, "DKIM"),
									isNull(domainDnsRecord.deletedAt),
								),
							),
					),
				),
			);
		if (relayOnly.length > 0) {
			await tx
				.update(domain)
				.set({ deletedAt: new Date(), smtpProviderId: null })
				.where(
					inArray(
						domain.id,
						relayOnly.map((d) => d.id),
					),
				);
		}

		// Remaining domains go back to Reloop delivery and need our DNS again.
		await tx
			.update(domain)
			.set({ status: "pending", systemVerified: false })
			.where(
				and(eq(domain.smtpProviderId, providerId), isNull(domain.deletedAt)),
			);

		await tx
			.delete(smtpProvider)
			.where(
				and(
					eq(smtpProvider.id, providerId),
					eq(smtpProvider.organizationId, organizationId),
				),
			);
	});

	return {
		object: "smtp_provider" as const,
		id: providerId,
		deleted: true as const,
	};
}
