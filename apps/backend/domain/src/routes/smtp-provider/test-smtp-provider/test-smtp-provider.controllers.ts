import { decryptSecretStrict } from "@reloop/db";
import { db } from "@reloop/db/client";
import { smtpProvider } from "@reloop/db/schema";
import { SmtpProviderErrors } from "@reloop/domain/error/domain.error-response";
import {
	findOrgSmtpProvider,
	loadRelayDomains,
	presentSmtpProvider,
	type SmtpProviderRow,
	testSmtpConnection,
} from "@reloop/domain/lib/smtp-provider";
import { eq } from "drizzle-orm";

/** Connect + auth against the relay and persist the result on the row. */
export async function runSmtpProviderTest(
	provider: SmtpProviderRow,
): Promise<{ error: string | null; row: SmtpProviderRow }> {
	let password: string | null = null;
	if (provider.passwordEnc) {
		try {
			password = decryptSecretStrict(provider.passwordEnc);
		} catch {
			throw SmtpProviderErrors.encryptionUnavailable();
		}
	}

	const error = await testSmtpConnection({
		host: provider.host,
		port: provider.port,
		security: provider.security,
		username: provider.username,
		password,
	});

	const [row] = await db
		.update(smtpProvider)
		.set({
			status: error ? "failing" : "ok",
			lastError: error,
			lastTestedAt: new Date(),
		})
		.where(eq(smtpProvider.id, provider.id))
		.returning();

	return { error, row: row ?? provider };
}

export async function testSmtpProviderController({
	organizationId,
	providerId,
}: {
	organizationId: string;
	providerId: string;
}) {
	const provider = await findOrgSmtpProvider(organizationId, providerId);
	const { error, row } = await runSmtpProviderTest(provider);
	const domains = await loadRelayDomains([row.id]);
	return {
		ok: error === null,
		error,
		provider: presentSmtpProvider({ ...row, domains: domains.get(row.id) }),
	};
}
