import { randomUUID } from "node:crypto";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { useLogger } from "evlog/elysia";
import { domainConfig } from "@reloop/domain/domain.config";
import { DomainErrors } from "@reloop/domain/error/domain.error-response";
import { redis } from "@reloop/domain/lib/redis";
import { discoverDomainConnect } from "@reloop/domain/utils/domain-connect-discovery";
import { getDomainConnectParts } from "@reloop/domain/utils/domain-connect-parts";
import { signDomainConnectRequest } from "@reloop/domain/utils/domain-connect-signer";

const DC_NONCE_TTL = 600; // 10 minutes
const DC_NONCE_PREFIX = "dc-nonce";

export async function applyUrlController({
	domainId,
	organizationId,
	groupIds,
}: {
	domainId: string;
	organizationId: string;
	groupIds?: string;
}) {
	const log = useLogger();

	// 1. Fetch domain + DNS records from DB
	const domainRecord = await db.query.domain.findFirst({
		where: and(
			eq(schema.domain.id, domainId),
			isNull(schema.domain.deletedAt),
			eq(schema.domain.organizationId, organizationId),
		),
		with: {
			dnsRecords: {
				where: isNull(schema.domainDnsRecord.deletedAt),
			},
		},
	});

	if (!domainRecord) {
		throw DomainErrors.domainNotFound(domainId);
	}

	// 2. Run DC discovery to get urlSyncUX
	const { domain: rootDomain } = getDomainConnectParts(domainRecord.domain);
	const discovery = await discoverDomainConnect(
		rootDomain,
		domainConfig.DOMAIN_CONNECT_PROVIDER_ID || "reloop.sh",
		domainConfig.DOMAIN_CONNECT_SERVICE_ID || "email-setup",
	);

	if (!discovery.supported || !discovery.urlSyncUX) {
		throw DomainErrors.invalidDomain(
			domainRecord.domain,
			discovery.error || "DNS provider does not support Domain Connect",
		);
	}

	if (!discovery.templateSupported) {
		throw DomainErrors.invalidDomain(
			domainRecord.domain,
			"DNS provider has not onboarded the Reloop template yet",
		);
	}

	// 3. Extract the DKIM public key from stored records
	const dkimRecord = domainRecord.dnsRecords.find(
		(r) => r.recordType === "TXT" && r.name.includes("_domainkey"),
	);

	if (!dkimRecord) {
		throw DomainErrors.invalidDomain(
			domainRecord.domain,
			"DKIM record not found for this domain",
		);
	}

	const domainKeyMatch = dkimRecord.value.match(/p=([^;]+)/);
	if (!domainKeyMatch?.[1]) {
		throw DomainErrors.invalidDomain(
			domainRecord.domain,
			"Could not extract DKIM public key",
		);
	}
	const domainKey = domainKeyMatch[1].trim();

	// 4. Split domain into DC parts
	const { domain: dcDomain, host: dcHost } = getDomainConnectParts(
		domainRecord.domain,
	);

	// 5. Determine which groupIds to apply
	const resolvedGroupIds = groupIds
		? groupIds.split(",").map((g) => g.trim())
		: determineGroupIds(domainRecord);

	// 6. Generate nonce for CSRF protection
	const nonce = randomUUID();
	const state = `${domainId}:${nonce}`;
	await redis.set(`${DC_NONCE_PREFIX}:${nonce}`, domainId, DC_NONCE_TTL);

	// 7. Build the callback URL
	const callbackUrl = `${domainConfig.BASE_URL}/api/domain/v1/domain-connect/callback`;

	// 8. Build query string
	const params = new URLSearchParams();
	params.set("domain", dcDomain);
	if (dcHost) params.set("host", dcHost);
	params.set("domainKey", domainKey);
	params.set("groupId", resolvedGroupIds.join(","));
	params.set("redirect_uri", callbackUrl);
	params.set("state", state);

	// 9. Sign the query string (required for syncPubKeyDomain templates / Cloudflare)
	const privateKey = domainConfig.DOMAIN_CONNECT_SIGNING_PRIVATE_KEY;
	if (!privateKey) {
		throw DomainErrors.invalidDomain(
			domainRecord.domain,
			"Domain Connect signing key is not configured",
		);
	}

	const queryString = params.toString();
	const signature = signDomainConnectRequest(queryString, privateKey);
	// Cloudflare requires `sig` to be the last query parameter; `key` must come before it.
	params.set("key", domainConfig.DOMAIN_CONNECT_SIGNING_PUB_KEY_ID || "_dc");
	params.set("sig", signature);

	// 10. Build the full apply URL
	const providerId = domainConfig.DOMAIN_CONNECT_PROVIDER_ID || "reloop.sh";
	const serviceId = domainConfig.DOMAIN_CONNECT_SERVICE_ID || "email-setup";
	const applyUrl = `${discovery.urlSyncUX}/v2/domainTemplates/providers/${providerId}/services/${serviceId}/apply?${params.toString()}`;

	log.info(`Generated Domain Connect apply URL for ${domainRecord.domain}`);

	return {
		applyUrl,
		provider: discovery.provider!,
	};
}

/**
 * Determine which record groups to apply based on domain settings.
 */
function determineGroupIds(domain: {
	isSendingEmailEnabled?: boolean | null;
	isReceivingEmailEnabled?: boolean | null;
	isClickTrackingEnabled?: boolean | null;
	isOpenTrackingEnabled?: boolean | null;
}): string[] {
	const groups = ["verification"]; // DKIM always included

	if (domain.isSendingEmailEnabled !== false) {
		groups.push("sending"); // SPF + DMARC
	}
	if (domain.isReceivingEmailEnabled !== false) {
		groups.push("receiving"); // MX
	}
	if (domain.isClickTrackingEnabled || domain.isOpenTrackingEnabled) {
		groups.push("tracking"); // CNAME
	}

	return groups;
}
