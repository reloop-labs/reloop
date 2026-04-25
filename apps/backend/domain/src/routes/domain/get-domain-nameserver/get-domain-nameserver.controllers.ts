import { resolveNs } from "node:dns/promises";
import type { DNSTypes } from "@be/domain/types/dns.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { DOMAIN_GET_DNS_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

export async function getDomainDNSController({
	domainId,
	organizationId,
	logger,
}: {
	domainId: string;
	organizationId: string;
	logger: Logger;
}): Promise<DNSTypes.DomainNameserversResponse> {
	try {
		const foundDomain = await db.query.domain.findFirst({
			where: and(
				eq(schema.domain.id, domainId),
				eq(schema.domain.organizationId, organizationId),
				isNull(schema.domain.deletedAt),
			),
		});

		if (!foundDomain) {
			throw status(404, { message: "Domain not found" });
		}

		let nameservers: string[] | null = null;
		let dnsProvider: string | null = "unknown";

		const domainParts = foundDomain.domain.split(".");
		const baseDomain =
			domainParts.length > 2
				? domainParts.slice(-2).join(".")
				: foundDomain.domain;

		try {
			nameservers = await resolveNs(baseDomain);

			if (nameservers && nameservers.length > 0) {
				const firstNs = nameservers[0];
				if (firstNs) {
					const ns = firstNs.toLowerCase();
					if (ns.includes("cloudflare.com")) {
						dnsProvider = "cloudflare";
					} else if (ns.includes("vercel-dns.com")) {
						dnsProvider = "vercel";
					} else if (ns.includes("godaddy.com") || ns.includes("domaincontrol.com")) {
						dnsProvider = "godaddy";
					}
				}
			}
		} catch (error) {
			logger.warn(
				{
					domainId,
					domain: foundDomain.domain,
					error: error instanceof Error ? error.message : String(error),
				},
				"Unable to resolve nameservers for domain",
			);
		}

		return {
			object: "domain_nameservers" as const,
			domainId: foundDomain.id,
			domain: foundDomain.domain,
			nameservers,
			dnsProvider,
			event: DOMAIN_GET_DNS_WEBHOOK_EVENT.id,
		};
	} catch (error) {
		logger.error({ domainId, error }, "Error getting domain nameservers");
		throw error;
	}
}
