import { decryptSecretStrict } from "@reloop/db";
import { db } from "@reloop/db/client";
import { smtpProvider } from "@reloop/db/schema";
import { SmtpProviderErrors } from "@reloop/domain/error/domain.error-response";
import {
	findOrgSmtpProvider,
	loadRelayDomains,
	presentSmtpProvider,
	type SmtpProviderRow,
	sendSmtpTestEmail,
	testSmtpConnection,
} from "@reloop/domain/lib/smtp-provider";
import { eq } from "drizzle-orm";

/** Connect + auth against the relay and persist the result on the row. */
export async function runSmtpProviderTest(
	provider: SmtpProviderRow,
	email?: { from: string; to: string },
): Promise<{ error: string | null; row: SmtpProviderRow }> {
	let password: string | null = null;
	if (provider.passwordEnc) {
		try {
			password = decryptSecretStrict(provider.passwordEnc);
		} catch {
			throw SmtpProviderErrors.encryptionUnavailable();
		}
	}

	const config = {
		host: provider.host,
		port: provider.port,
		security: provider.security,
		username: provider.username,
		password,
	};
	const error = email
		? await sendSmtpTestEmail(config, email)
		: await testSmtpConnection(config);

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
	to,
	from,
}: {
	organizationId: string;
	providerId: string;
	/** When set, deliver a real test email instead of only logging in. */
	to?: string;
	from?: string;
}) {
	const provider = await findOrgSmtpProvider(organizationId, providerId);
	const domains = await loadRelayDomains([provider.id]);
	const sender =
		from ?? `hello@${domains.get(provider.id)?.[0]?.domain ?? provider.host}`;
	const { error, row } = await runSmtpProviderTest(
		provider,
		to ? { from: sender, to } : undefined,
	);
	return {
		ok: error === null,
		error,
		provider: presentSmtpProvider({ ...row, domains: domains.get(row.id) }),
	};
}
