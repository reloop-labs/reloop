import { DomainErrors } from "@be/domain/lib/errors";
import type { DomainTypes } from "@be/domain/types/domain.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { DOMAIN_UNDELETE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq, isNull } from "drizzle-orm";
import { useLogger } from "evlog/elysia";

export async function handleUndelete_step2({
	deletedDomain,
	organizationId,
	domain,
	customReturnPath,
	clickTracking,
	openTracking,
	tls,
	sendingEmail,
	receivingEmail,
}: {
	deletedDomain: DomainTypes.DomainData | null | undefined;
	organizationId: string;
	domain: string;
	customReturnPath?: string;
	clickTracking?: boolean;
	openTracking?: boolean;
	tls?: "opportunistic" | "enforced";
	sendingEmail?: boolean;
	receivingEmail?: boolean;
}): Promise<DomainTypes.DomainResponse | null> {
	const logger = useLogger();

	if (deletedDomain?.deletedAt) {
		const now = new Date();
		const domainId = deletedDomain.id;
		logger.info("Undeleting domain", { domainId });

		await db
			.update(schema.domain)
			.set({
				deletedAt: null,
				updatedAt: now,
				createdAt: now,
				status: "start-verify",
				customReturnPath,
				clickTracking,
				openTracking,
				tls,
				sendingEmail,
				receivingEmail,
			})
			.where(eq(schema.domain.id, domainId));

		logger.info("Undeleting domain DNS records", { domainId });
		await db
			.update(schema.domainDnsRecord)
			.set({
				deletedAt: null,
				updatedAt: now,
			})
			.where(eq(schema.domainDnsRecord.domainId, domainId));

		const undeletedDomain = await db.query.domain.findFirst({
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

		if (!undeletedDomain) {
			throw DomainErrors.failedToUndelete(domain);
		}
		logger.info("Domain undeleted successfully", {
			domainId,
			domain,
			event: DOMAIN_UNDELETE_WEBHOOK_EVENT.id,
		});

		return {
			...undeletedDomain,
			object: "domain" as const,
			event: DOMAIN_UNDELETE_WEBHOOK_EVENT.id,
		};
	}

	return null;
}
