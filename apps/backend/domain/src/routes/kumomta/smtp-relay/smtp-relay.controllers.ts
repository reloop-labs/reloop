import { timingSafeEqual } from "node:crypto";
import { sanitizeInternalSecret } from "@reloop/auth/middleware";
import { decryptSecretStrict } from "@reloop/db";
import { db } from "@reloop/db/client";
import { smtpProvider } from "@reloop/db/schema";
import { domainConfig } from "@reloop/domain/domain.config";
import {
	AuthErrors,
	SmtpProviderErrors,
} from "@reloop/domain/error/domain.error-response";
import { resolveSmtpHost } from "@reloop/domain/lib/smtp-provider";
import { eq } from "drizzle-orm";

const internalSecret = sanitizeInternalSecret(
	domainConfig.RELOOP_INTERNAL_SECRET,
	domainConfig.NODE_ENV,
);

/**
 * KumoMTA's queue/egress hooks only know the provider id (no org context),
 * so this endpoint trusts the internal secret alone. Ownership was already
 * checked when the id was attached to the message (org-scoped dkim-key).
 */
export function assertInternalSecret(header: string | undefined): void {
	if (!internalSecret || !header) {
		throw AuthErrors.unauthorized("Internal secret required");
	}
	const a = Buffer.from(header);
	const b = Buffer.from(internalSecret);
	if (a.length !== b.length || !timingSafeEqual(a, b)) {
		throw AuthErrors.unauthorized("Internal secret required");
	}
}

export async function getSmtpRelayController(providerId: string) {
	const provider = await db.query.smtpProvider.findFirst({
		where: eq(smtpProvider.id, providerId),
	});
	if (!provider) throw SmtpProviderErrors.notFound(providerId);

	// Re-vet on every (cached) lookup so DNS changes can't retarget the relay
	// at internal hosts; KumoMTA connects to `addr`, not the name.
	const target = await resolveSmtpHost(provider.host);

	let password: string | null = null;
	if (provider.passwordEnc) {
		try {
			password = decryptSecretStrict(provider.passwordEnc);
		} catch {
			throw SmtpProviderErrors.encryptionUnavailable();
		}
	}

	return {
		host: provider.host,
		addr: target.family === 6 ? `[${target.pinnedIp}]` : target.pinnedIp,
		port: provider.port,
		security: provider.security,
		username: provider.username,
		password,
	};
}
