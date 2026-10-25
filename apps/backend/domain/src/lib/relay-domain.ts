import { BusEvent, bus } from "@reloop/bus";
import type { DatabaseInstance } from "@reloop/db/client";
import { domainDnsRecord, domain as domainTable } from "@reloop/db/schema";
import { applySpamhausDblCheck } from "@reloop/db/spamhaus-dbl";
import { domainConfig } from "@reloop/domain/domain.config";
import { DomainErrors } from "@reloop/domain/error/domain.error-response";
import { ensureOwnershipRecord } from "@reloop/domain/lib/domain-ownership";
import { isReservedDomain } from "@reloop/domain/lib/reserved-domains";
import { and, eq, isNull, sql } from "drizzle-orm";

export function normalizeRelayDomain(input: string): string {
	const name = input.trim().toLowerCase().replace(/\.$/, "");
	if (/^www\./.test(name)) {
		throw DomainErrors.invalidDomain(
			input,
			"Domains starting with 'www.' are not supported. Use the domain you send from, e.g. example.com.",
		);
	}
	if (isReservedDomain(name)) {
		throw DomainErrors.invalidDomain(
			input,
			`"${input}" is reserved for Reloop platform mail.`,
		);
	}
	return name;
}

/** A relay domain held by another org must prove ownership before it goes live. */
const CONTESTED_RELAY = {
	status: "pending" as const,
	systemVerified: false,
	userVerifiedDomain: false,
	verificationFailedReason: null,
	isSendingEmailEnabled: true,
	isReceivingEmailEnabled: false,
	isClickTrackingEnabled: false,
	isOpenTrackingEnabled: false,
	isTrackingDomain: false,
};

/**
 * Settings to apply when an existing domain switches to a relay. Sending is
 * usable at once; receiving and tracking stay on only if their DNS record is
 * already verified — otherwise the live send check would fail the domain.
 * If another org holds the domain and this row isn't verified yet, it stays
 * pending until the ownership TXT verifies.
 */
export async function relayActivation(tx: DatabaseInstance, domainId: string) {
	const row = await tx.query.domain.findFirst({
		where: eq(domainTable.id, domainId),
		columns: {
			organizationId: true,
			userId: true,
			domain: true,
			status: true,
			systemVerified: true,
		},
	});
	const alreadyVerified = row?.status === "active" && row.systemVerified;
	if (row && !alreadyVerified) {
		const contested = await ensureOwnershipRecord(
			{
				domainId,
				organizationId: row.organizationId,
				userId: row.userId,
				domain: row.domain,
			},
			tx,
		);
		if (contested) return CONTESTED_RELAY;
	}

	const records = await tx
		.select({
			recordType: domainDnsRecord.recordType,
			purpose: domainDnsRecord.purpose,
			status: domainDnsRecord.status,
		})
		.from(domainDnsRecord)
		.where(
			and(
				eq(domainDnsRecord.domainId, domainId),
				isNull(domainDnsRecord.deletedAt),
			),
		);
	const verified = (type: string) =>
		records.some((r) => r.recordType === type && r.status === "active");
	const keepReceiving = verified("MX");
	const keepTracking = verified("CNAME");
	return {
		status: "active" as const,
		systemVerified: true,
		userVerifiedDomain: true,
		verificationFailedReason: null,
		isSendingEmailEnabled: true,
		...(keepReceiving ? {} : { isReceivingEmailEnabled: false }),
		...(keepTracking
			? {}
			: {
					isClickTrackingEnabled: false,
					isOpenTrackingEnabled: false,
					isTrackingDomain: false,
				}),
	};
}

export type RelayDomainResult = {
	domainId: string;
	domain: string;
	event: "created" | "undeleted" | "attached";
};

/**
 * Make `domainName` send through the given relay with zero setup: reuse the
 * org's domain if it exists, revive a soft-deleted one, or create it. Relay
 * domains need no Reloop DNS, so they are active immediately — unless another
 * org already holds the name, in which case the domain stays pending until
 * its ownership TXT verifies. Runs inside the caller's transaction; call
 * `publishRelayDomainEvent` after commit.
 */
export async function attachRelayDomain(
	tx: DatabaseInstance,
	args: {
		organizationId: string;
		userId: string;
		domainName: string;
		smtpProviderId: string;
	},
): Promise<RelayDomainResult> {
	const name = normalizeRelayDomain(args.domainName);
	const sameName = and(
		sql`lower(${domainTable.domain}) = ${name}`,
		eq(domainTable.organizationId, args.organizationId),
	);

	const active = await tx.query.domain.findFirst({
		where: and(sameName, isNull(domainTable.deletedAt)),
		columns: { id: true, domain: true },
	});
	if (active) {
		await tx
			.update(domainTable)
			.set({
				smtpProviderId: args.smtpProviderId,
				...(await relayActivation(tx, active.id)),
			})
			.where(eq(domainTable.id, active.id));
		return { domainId: active.id, domain: active.domain, event: "attached" };
	}

	const relayDefaults = {
		smtpProviderId: args.smtpProviderId,
		status: "active" as const,
		systemVerified: true,
		userVerifiedDomain: true,
		verificationFailedReason: null,
		isSendingEmailEnabled: true,
		isReceivingEmailEnabled: false,
		isClickTrackingEnabled: false,
		isOpenTrackingEnabled: false,
		isTrackingDomain: false,
		lastVerifiedAt: new Date(),
	};

	const deleted = await tx.query.domain.findFirst({
		where: sameName,
		columns: { id: true, domain: true },
	});
	if (deleted) {
		await tx
			.update(domainTable)
			.set({ ...relayDefaults, deletedAt: null })
			.where(eq(domainTable.id, deleted.id));
		await holdIfContested(tx, deleted.id, args);
		return { domainId: deleted.id, domain: deleted.domain, event: "undeleted" };
	}

	const [created] = await tx
		.insert(domainTable)
		.values({
			...relayDefaults,
			domain: name,
			organizationId: args.organizationId,
			userId: args.userId,
			customReturnPath: domainConfig.constants.defaultCustomReturnPath,
			trackingSubdomain: domainConfig.constants.defaultTrackingSubdomain,
		})
		.returning({ id: domainTable.id, domain: domainTable.domain });
	if (!created) throw DomainErrors.databaseError("Failed to create domain");
	await holdIfContested(tx, created.id, args);
	return { domainId: created.id, domain: created.domain, event: "created" };
}

/** Another org holds this name: add the ownership TXT and keep it pending. */
async function holdIfContested(
	tx: DatabaseInstance,
	domainId: string,
	args: { organizationId: string; userId: string; domainName: string },
): Promise<void> {
	const contested = await ensureOwnershipRecord(
		{
			domainId,
			organizationId: args.organizationId,
			userId: args.userId,
			domain: normalizeRelayDomain(args.domainName),
		},
		tx,
	);
	if (!contested) return;
	await tx
		.update(domainTable)
		.set({ ...CONTESTED_RELAY, lastVerifiedAt: null })
		.where(eq(domainTable.id, domainId));
}

export async function publishRelayDomainEvent(
	organizationId: string,
	result: RelayDomainResult,
): Promise<void> {
	// Relay domains are live without verification, so check them here.
	await applySpamhausDblCheck({
		domainId: result.domainId,
		domainName: result.domain,
	});
	const payload = {
		domainId: result.domainId,
		domain: result.domain,
		organizationId,
	};
	if (result.event === "created") {
		await bus.publish(BusEvent.DOMAIN_CREATED, payload);
	} else if (result.event === "undeleted") {
		await bus.publish(BusEvent.DOMAIN_UNDELETED, payload);
	} else {
		await bus.publish(BusEvent.DOMAIN_UPDATED, payload);
	}
}
