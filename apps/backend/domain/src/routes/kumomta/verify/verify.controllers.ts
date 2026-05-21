import { db } from "@reloop/db/client";
import { domain } from "@reloop/db/schema";
import { KumoMtaErrors } from "@reloop/domain/error/domain.error-response";
import { and, eq, isNull } from "drizzle-orm";
import { useLogger } from "evlog/elysia";

export async function verifyDomainController({
	domainName,
	orgId,
}: {
	domainName: string;
	orgId: string;
}): Promise<{ isVerified: boolean }> {
	const log = useLogger();
	try {
		const domainRecord = await db.query.domain.findFirst({
			where: and(
				eq(domain.domain, domainName),
				eq(domain.organizationId, orgId),
				isNull(domain.deletedAt),
			),
			columns: { status: true },
		});
		if (!domainRecord) {
			throw KumoMtaErrors.domainNotFound(domainName);
		}
		return { isVerified: domainRecord.status === "active" };
	} catch (error) {
		log.error(
			`Error verifying domain ${domainName}: ${error instanceof Error ? error.message : String(error)}`,
		);
		throw error;
	}
}
