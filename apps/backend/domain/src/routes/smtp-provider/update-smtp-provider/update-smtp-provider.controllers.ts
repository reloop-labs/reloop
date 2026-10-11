import { db } from "@reloop/db/client";
import { smtpProvider } from "@reloop/db/schema";
import { DomainErrors } from "@reloop/domain/error/domain.error-response";
import {
	attachRelayDomain,
	publishRelayDomainEvent,
	type RelayDomainResult,
} from "@reloop/domain/lib/relay-domain";
import {
	assertSecurityAllowed,
	findOrgSmtpProvider,
	loadRelayDomains,
	presentSmtpProvider,
	resolveSmtpHost,
} from "@reloop/domain/lib/smtp-provider";
import type { SmtpProviderUpdateBody } from "@reloop/domain/model/smtp-provider.model";
import { and, eq } from "drizzle-orm";
import { encryptSmtpPassword } from "../create-smtp-provider/create-smtp-provider.controllers";

export async function updateSmtpProviderController({
	organizationId,
	userId,
	providerId,
	body,
}: {
	organizationId: string;
	userId: string;
	providerId: string;
	body: SmtpProviderUpdateBody;
}) {
	await findOrgSmtpProvider(organizationId, providerId);

	const update: Partial<typeof smtpProvider.$inferInsert> = {};
	if (body.name !== undefined) update.name = body.name.trim();
	if (body.host !== undefined) {
		update.host = body.host.trim().toLowerCase();
		await resolveSmtpHost(update.host);
	}
	if (body.port !== undefined) update.port = body.port;
	if (body.security !== undefined) {
		assertSecurityAllowed(body.security);
		update.security = body.security;
	}
	if (body.username !== undefined) {
		update.username = body.username?.trim() || null;
	}
	if (body.password !== undefined) {
		update.passwordEnc = body.password
			? encryptSmtpPassword(body.password)
			: null;
	}

	// Any connection change invalidates the last test result.
	const connectionChanged = [
		"host",
		"port",
		"security",
		"username",
		"passwordEnc",
	].some((key) => key in update);
	if (connectionChanged) {
		update.status = "unverified";
		update.lastError = null;
	}

	const { row, attached } = await db.transaction(async (tx) => {
		const [updated] = await tx
			.update(smtpProvider)
			.set(update)
			.where(
				and(
					eq(smtpProvider.id, providerId),
					eq(smtpProvider.organizationId, organizationId),
				),
			)
			.returning();
		// Optional: route one more sending domain through this relay.
		let attached: RelayDomainResult | null = null;
		if (updated && body.domain) {
			attached = await attachRelayDomain(tx, {
				organizationId,
				userId,
				domainName: body.domain,
				smtpProviderId: providerId,
			});
		}
		return { row: updated, attached };
	});

	if (!row) throw DomainErrors.databaseError("Failed to update SMTP provider");
	if (attached) await publishRelayDomainEvent(organizationId, attached);
	const domains = await loadRelayDomains([row.id]);
	return presentSmtpProvider({ ...row, domains: domains.get(row.id) });
}
