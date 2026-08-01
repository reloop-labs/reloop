import { db } from "@reloop/db/client";
import { domain } from "@reloop/db/schema";
import { and, eq, isNull, sql } from "drizzle-orm";
import { useLogger } from "evlog/elysia";

/**
 * Normalize a hostname from Caddy's on-demand TLS `ask` query.
 * Strips trailing dots, lowercases, and trims whitespace.
 */
export function normalizeHostname(host: string): string {
	return host.trim().toLowerCase().replace(/\.$/, "");
}

/**
 * Whether `host` is an active custom tracking domain (CNAME → link.*).
 *
 * Caddy calls this before issuing a certificate for a customer tracking host
 * (e.g. `link.example.com`). Only active domains with verified tracking CNAME
 * are allowed — prevents open certificate issuance for arbitrary SNI names.
 */
export async function isActiveTrackingHostname(host: string): Promise<boolean> {
	const hostname = normalizeHostname(host);
	if (!hostname || hostname.includes("/") || hostname.includes(" ")) {
		return false;
	}

	const log = useLogger();

	try {
		// Tracking host is always `{trackingSubdomain}.{domain}` (see log-incoming
		// and generateTrackingCNAMERecord + create-domain step-3).
		const rows = await db
			.select({ id: domain.id })
			.from(domain)
			.where(
				and(
					sql`lower(${domain.trackingSubdomain} || '.' || ${domain.domain}) = ${hostname}`,
					eq(domain.status, "active"),
					eq(domain.isTrackingDomain, true),
					isNull(domain.deletedAt),
				),
			)
			.limit(1);

		const active = rows.length > 0;
		log.info(`[CADDY-ASK] hostname=${hostname} active=${active}`);
		return active;
	} catch (error) {
		log.error(
			`[CADDY-ASK] Error checking hostname ${hostname}: ${error instanceof Error ? error.message : String(error)}`,
		);
		// Fail closed: never allow cert issuance when the check itself errors.
		return false;
	}
}
