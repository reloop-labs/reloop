import { MailErrors } from "@reloop/be-mail/lib/errors";
import { isPlatformTestDomain } from "@reloop/be-mail/lib/platform-test";
import { db } from "@reloop/db/client";
import { domain } from "@reloop/db/schema";
import { and, eq } from "drizzle-orm";

export async function verifyDomainAuth_step2({
	organizationId,
	domainName,
}: {
	organizationId: string;
	domainName: string;
}) {
	// Platform domain is only allowed on the dedicated platform-test path.
	if (isPlatformTestDomain(domainName)) {
		throw MailErrors.platformDomainReserved(domainName);
	}

	const domainRecord = await db
		.select()
		.from(domain)
		.where(
			and(
				eq(domain.organizationId, organizationId),
				eq(domain.domain, domainName),
			),
		)
		.limit(1);

	if (domainRecord.length === 0 || !domainRecord[0]) {
		throw MailErrors.domainNotFound(domainName);
	}

	return { currentDomain: domainRecord[0] };
}
