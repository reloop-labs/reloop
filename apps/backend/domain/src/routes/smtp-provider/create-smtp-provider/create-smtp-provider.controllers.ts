import { encryptSecretStrict } from "@reloop/db";
import { db } from "@reloop/db/client";
import { smtpProvider } from "@reloop/db/schema";
import {
	DomainErrors,
	SmtpProviderErrors,
} from "@reloop/domain/error/domain.error-response";
import {
	attachRelayDomain,
	normalizeRelayDomain,
	publishRelayDomainEvent,
} from "@reloop/domain/lib/relay-domain";
import {
	assertSecurityAllowed,
	assertSmtpProviderQuota,
	presentSmtpProvider,
	resolveSmtpHost,
} from "@reloop/domain/lib/smtp-provider";
import type { SmtpProviderCreateBody } from "@reloop/domain/model/smtp-provider.model";
import { useLogger } from "evlog/elysia";
import { runSmtpProviderTest } from "../test-smtp-provider/test-smtp-provider.controllers";

export function encryptSmtpPassword(password: string): string {
	try {
		return encryptSecretStrict(password);
	} catch {
		throw SmtpProviderErrors.encryptionUnavailable();
	}
}

/**
 * One-step setup: store the relay, create (or reuse) the sending domain and
 * point it at the relay, then test the connection. The user never has to add
 * or verify the domain separately.
 */
export async function createSmtpProviderController({
	organizationId,
	userId,
	body,
}: {
	organizationId: string;
	userId: string;
	body: SmtpProviderCreateBody;
}) {
	const log = useLogger();
	const security = body.security ?? "starttls";
	const host = body.host.trim().toLowerCase();
	const domainName = normalizeRelayDomain(body.domain);
	assertSecurityAllowed(security);
	await resolveSmtpHost(host);
	const passwordEnc = body.password ? encryptSmtpPassword(body.password) : null;

	const { row, attached } = await db.transaction(async (tx) => {
		await assertSmtpProviderQuota(organizationId, tx);
		const [inserted] = await tx
			.insert(smtpProvider)
			.values({
				organizationId,
				name: body.name?.trim() || domainName,
				host,
				port: body.port,
				security,
				username: body.username?.trim() || null,
				passwordEnc,
			})
			.returning();
		if (!inserted) {
			throw DomainErrors.databaseError("Failed to create SMTP provider");
		}
		const attached = await attachRelayDomain(tx, {
			organizationId,
			userId,
			domainName,
			smtpProviderId: inserted.id,
		});
		return { row: inserted, attached };
	});

	try {
		await publishRelayDomainEvent(organizationId, attached);
	} catch (error) {
		log.warn(
			`Failed to publish relay domain event: ${error instanceof Error ? error.message : String(error)}`,
		);
	}

	// Test right away so the user sees "Connected" or the exact error.
	const tested = await runSmtpProviderTest(row).catch(() => ({ row }));

	return presentSmtpProvider({
		...tested.row,
		domains: [{ id: attached.domainId, domain: attached.domain }],
	});
}
