import { MailErrors } from "@reloop/be-mail/lib/errors";
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
	// Platform domain (e.g. reloop.dev) is owned by the system/platform org and
	// sent via reloop-email + RELOOP_API_KEY. Customer orgs cannot register it
	// (create-domain reserved). Normal ownership check is sufficient.
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
