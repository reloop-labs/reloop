import { createPrivateKey, createPublicKey } from "node:crypto";
import type { DNSTypes } from "@be/domain/routes/dns/dns.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq } from "drizzle-orm";

export async function getDKIMKeysHandler(
	domain: string,
	organizationId: string,
): Promise<DNSTypes.DKIMKeysResponse | null> {
	logger.info({ domain }, "Getting DKIM keys for domain");

	try {
		const domainRecord = await db
			.select({
				dkimSelector: schema.domain.dkimSelector,
				dkimRecord: schema.domain.dkimRecord,
				dkimPrivateKey: schema.domain.dkimPrivateKey,
			})
			.from(schema.domain)
			.where(
				and(
					eq(schema.domain.domain, domain),
					eq(schema.domain.organizationId, organizationId),
				),
			)
			.limit(1);

		if (domainRecord.length === 0 || !domainRecord[0]) {
			logger.warn({ domain }, "Domain not found when getting DKIM keys");
			return null;
		}

		const record = domainRecord[0];
		if (!record.dkimPrivateKey) {
			logger.warn({ domain }, "No DKIM private key stored for domain");
			return null;
		}

		try {
			const privateKeyPem = record.dkimPrivateKey as string;
			const privateKeyObj = createPrivateKey({
				key: privateKeyPem,
				format: "pem",
				type: "pkcs8",
			});
			const publicKeyObj = createPublicKey(privateKeyObj);
			const publicKeyPem = publicKeyObj.export({
				type: "spki",
				format: "pem",
			}) as string;

			const keyDetails =
				privateKeyObj.asymmetricKeyDetails ?? publicKeyObj.asymmetricKeyDetails;
			const keyLength = keyDetails?.modulusLength ?? 2048;
			const algorithm = (privateKeyObj.asymmetricKeyType as string) || "rsa";

			return {
				selector: record.dkimSelector || "reloop",
				publicKey: publicKeyPem,
				privateKey: privateKeyPem,
				keyLength,
				algorithm,
			};
		} catch (err) {
			logger.error(
				{
					domain,
					error: err instanceof Error ? err.message : String(err),
				},
				"Stored DKIM private key is invalid",
			);
			return null;
		}
	} catch (error) {
		logger.error(
			{
				domain,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error getting DKIM keys",
		);
		throw error;
	}
}
