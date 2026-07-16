import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { useLogger } from "evlog/elysia";
import { domainConfig } from "@reloop/domain/domain.config";
import { DomainErrors } from "@reloop/domain/error/domain.error-response";
import { discoverDomainConnect } from "@reloop/domain/utils/domain-connect-discovery";
import { getDomainConnectParts } from "@reloop/domain/utils/domain-connect-parts";

export async function discoverController({
	domainId,
	organizationId,
}: {
	domainId: string;
	organizationId: string;
}) {
	const log = useLogger();

	// 1. Fetch domain from DB, verify ownership
	const domainRecord = await db.query.domain.findFirst({
		where: and(
			eq(schema.domain.id, domainId),
			isNull(schema.domain.deletedAt),
			eq(schema.domain.organizationId, organizationId),
		),
	});

	if (!domainRecord) {
		throw DomainErrors.domainNotFound(domainId);
	}

	// 2. Extract root domain for DC discovery
	const { domain: rootDomain } = getDomainConnectParts(domainRecord.domain);

	// 3. Run DC discovery
	log.info(`Running Domain Connect discovery for ${rootDomain}`);
	const result = await discoverDomainConnect(
		rootDomain,
		domainConfig.DOMAIN_CONNECT_PROVIDER_ID || "reloop.sh",
		domainConfig.DOMAIN_CONNECT_SERVICE_ID || "email-setup",
	);

	return {
		supported: result.supported,
		templateSupported: result.templateSupported,
		provider: result.provider,
		error: result.error,
	};
}
