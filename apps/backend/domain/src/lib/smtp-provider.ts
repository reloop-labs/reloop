import { type DatabaseInstance, db } from "@reloop/db/client";
import {
	domain,
	organizationPlan,
	type SmtpSecurity,
	smtpProvider,
} from "@reloop/db/schema";
import { isSelfHosted } from "@reloop/db/self-hosted";
import { SmtpProviderErrors } from "@reloop/domain/error/domain.error-response";
import { getPlanLimits } from "@reloop/pricing";
import {
	resolvePublicTarget,
	SsrfBlockedError,
} from "@reloop/webhook-delivery";
import { and, count, eq, inArray, isNull, sql } from "drizzle-orm";
import nodemailer from "nodemailer";

export type SmtpProviderRow = typeof smtpProvider.$inferSelect;
export type SmtpProviderDomain = { id: string; domain: string };

/** Live domains relayed through each provider, keyed by provider id. */
export async function loadRelayDomains(
	providerIds: string[],
	tx: DatabaseInstance = db,
): Promise<Map<string, SmtpProviderDomain[]>> {
	const map = new Map<string, SmtpProviderDomain[]>();
	if (providerIds.length === 0) return map;
	const rows = await tx
		.select({
			id: domain.id,
			domain: domain.domain,
			smtpProviderId: domain.smtpProviderId,
		})
		.from(domain)
		.where(
			and(
				inArray(domain.smtpProviderId, providerIds),
				isNull(domain.deletedAt),
			),
		);
	for (const row of rows) {
		if (!row.smtpProviderId) continue;
		const list = map.get(row.smtpProviderId) ?? [];
		list.push({ id: row.id, domain: row.domain });
		map.set(row.smtpProviderId, list);
	}
	return map;
}

/** API shape. Never includes the password. */
export function presentSmtpProvider(
	row: SmtpProviderRow & { domains?: SmtpProviderDomain[] },
) {
	return {
		object: "smtp_provider" as const,
		id: row.id,
		name: row.name,
		host: row.host,
		port: row.port,
		security: row.security,
		username: row.username,
		hasPassword: Boolean(row.passwordEnc),
		domains: (row.domains ?? []).map((d) => ({ id: d.id, domain: d.domain })),
		status: row.status,
		lastTestedAt: row.lastTestedAt,
		lastError: row.lastError,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
	};
}

export async function findOrgSmtpProvider(
	organizationId: string,
	id: string,
	tx: DatabaseInstance = db,
): Promise<SmtpProviderRow> {
	const row = await tx.query.smtpProvider.findFirst({
		where: and(
			eq(smtpProvider.id, id),
			eq(smtpProvider.organizationId, organizationId),
		),
	});
	if (!row) throw SmtpProviderErrors.notFound(id);
	return row;
}

export async function getSmtpProviderLimit(
	organizationId: string,
	tx: DatabaseInstance = db,
): Promise<number | null> {
	if (isSelfHosted()) return null;
	const plan = await tx.query.organizationPlan.findFirst({
		where: eq(organizationPlan.organizationId, organizationId),
		columns: { planId: true, maxSmtpProviders: true },
	});
	if (!plan) return 0;
	// Rows created before the column existed hold the default 0 (deploys use
	// `drizzle-kit push`, which skips the SQL backfill) — use the catalog cap.
	return Math.max(
		plan.maxSmtpProviders,
		getPlanLimits(plan.planId).maxSmtpProviders,
	);
}

/** Lock the org and throw if one more provider would exceed the plan cap. */
export async function assertSmtpProviderQuota(
	organizationId: string,
	tx: DatabaseInstance,
): Promise<void> {
	const limit = await getSmtpProviderLimit(organizationId, tx);
	if (limit === null) return;

	await tx.execute(
		sql`select pg_advisory_xact_lock(hashtext(${`smtp:${organizationId}`}))`,
	);
	const [row] = await tx
		.select({ total: count() })
		.from(smtpProvider)
		.where(eq(smtpProvider.organizationId, organizationId));
	const used = Number(row?.total ?? 0);
	if (used >= limit) {
		throw SmtpProviderErrors.limitReached({ used, limit });
	}
}

/**
 * Resolve the host and refuse private/reserved targets so customers can't
 * point the relay at internal infrastructure. Self-hosted may relay to LAN.
 */
export async function resolveSmtpHost(host: string) {
	try {
		return await resolvePublicTarget(host, { allowPrivate: isSelfHosted() });
	} catch (error) {
		if (error instanceof SsrfBlockedError) {
			throw SmtpProviderErrors.hostBlocked(host);
		}
		throw SmtpProviderErrors.hostUnresolvable(host);
	}
}

export type SmtpConnectionConfig = {
	host: string;
	port: number;
	security: SmtpSecurity;
	username: string | null;
	password: string | null;
};

/** Plaintext relays would expose the password; only self-hosters may opt in. */
export function assertSecurityAllowed(security: SmtpSecurity): void {
	if (security === "none" && !isSelfHosted()) {
		throw SmtpProviderErrors.plaintextNotAllowed();
	}
}

/** Connect, negotiate TLS and authenticate. Returns null on success. */
export async function testSmtpConnection(
	config: SmtpConnectionConfig,
): Promise<string | null> {
	const target = await resolveSmtpHost(config.host);
	const transporter = nodemailer.createTransport({
		// Connect to the vetted IP; keep the name for SNI/certificate checks.
		host: target.pinnedIp,
		port: config.port,
		secure: false,
		requireTLS: config.security === "starttls",
		ignoreTLS: config.security === "none",
		tls: { servername: config.host },
		auth:
			config.username && config.password
				? { user: config.username, pass: config.password }
				: undefined,
		connectionTimeout: 10_000,
		greetingTimeout: 10_000,
		socketTimeout: 15_000,
	});
	try {
		await transporter.verify();
		return null;
	} catch (error) {
		return error instanceof Error ? error.message : String(error);
	} finally {
		transporter.close();
	}
}
