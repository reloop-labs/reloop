import { db } from "@reloop/db/client";
import { domain, domainDnsRecord } from "@reloop/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { log } from "evlog";
import { kumomtaConfig } from "../../kumomta.config";
import { verifyApiKeyController } from "../verify/verify.controllers";

interface DkimKeyInput {
	key: string;
	domainName: string;
}

interface DkimKeyResult {
	selector?: string;
	privateKey?: string;
	error?: string;
	code?: number;
}

export async function dkimKeyController(
	input: DkimKeyInput,
): Promise<DkimKeyResult> {
	try {
		let organizationId: string | undefined;

		if (input.key === kumomtaConfig.X_KUMOMTA_KEY) {
			organizationId = undefined;
		} else {
			const apiKeyResult = await verifyApiKeyController(input.key);
			if (!apiKeyResult) return { error: "Invalid API Key", code: 401 };
			organizationId = apiKeyResult.organizationId;
		}

		const domainQuery = organizationId
			? and(
					eq(domain.domain, input.domainName),
					eq(domain.organizationId, organizationId),
					isNull(domain.deletedAt),
				)
			: and(eq(domain.domain, input.domainName), isNull(domain.deletedAt));

		log.info({
			...{ domain: input.domainName, organizationId },
			message: "[DKIM-KEY] Querying domain",
		});

		// Find the active domain for this org
		const domainRecord = await db.query.domain.findFirst({
			where: domainQuery,
			columns: { id: true, status: true },
		});

		if (!domainRecord) {
			log.warn({
				...{ domain: input.domainName },
				message: "[DKIM-KEY] Domain NOT FOUND",
			});
			return { error: "Domain not found", code: 404 };
		}

		if (domainRecord.status !== "active") {
			log.warn({
				...{ domain: input.domainName, status: domainRecord.status },
				message: "[DKIM-KEY] Domain found but NOT ACTIVE",
			});
			return { error: "Domain not active", code: 404 };
		}

		// Fetch the DKIM DNS record (recordTypeName = 'DKIM')
		const dkimRecord = await db.query.domainDnsRecord.findFirst({
			where: and(
				eq(domainDnsRecord.domainId, domainRecord.id),
				eq(domainDnsRecord.recordTypeName, "DKIM"),
				isNull(domainDnsRecord.deletedAt),
			),
			columns: { name: true, privateKey: true },
		});

		if (!dkimRecord || !dkimRecord.privateKey) {
			return { error: "DKIM key not found for domain", code: 404 };
		}

		// The `name` field is e.g. "reloop._domainkey" — extract just the selector part
		const selector = dkimRecord.name.replace(/\._domainkey.*$/, "");

		return { selector, privateKey: dkimRecord.privateKey, code: 200 };
	} catch (error) {
		log.error(
			{
				error: error instanceof Error ? error.message : String(error),
				domain: input.domainName,
			},
			"Error fetching DKIM key",
		);
		return { error: "Internal Error", code: 500 };
	}
}
