import {
	checkCnameRecord,
	checkDkimRecord,
	checkDmarcRecord,
	checkMxRecord,
	checkSpfRecord,
	type DnsCheckOutcome,
} from "@reloop/dns/verify-records";
import { and, eq, isNull } from "drizzle-orm";
import { type DatabaseInstance, db as defaultDb } from "./client";
import { domain, domainDnsRecord } from "./schema/domain";

export type StoredDnsRecord = {
	id: string;
	recordType: string;
	value: string;
	fqdn: string;
	priority: number | null;
	purpose: string;
};

export type DomainCheckFlags = {
	isSendingEmailEnabled: boolean;
	isReceivingEmailEnabled: boolean;
	isClickTrackingEnabled: boolean;
	isOpenTrackingEnabled: boolean;
};

export type PlannedDnsCheck = {
	id: string;
	label: "DKIM" | "SPF" | "DMARC" | "MX" | "CNAME";
	run: () => Promise<DnsCheckOutcome>;
};

/**
 * Records the domain must still publish for its enabled features.
 * Sending always requires DKIM, SPF, and DMARC. Receiving adds MX.
 * Click or open tracking adds the tracking CNAME.
 */
export function planDomainDnsChecks(
	records: StoredDnsRecord[],
	flags: DomainCheckFlags,
): { missingConfig: string[]; checks: PlannedDnsCheck[] } {
	const missingConfig: string[] = [];
	const checks: PlannedDnsCheck[] = [];

	const dkim = records.find(
		(record) =>
			record.recordType === "TXT" && record.value.startsWith("v=DKIM1"),
	);
	if (!dkim) {
		missingConfig.push("DKIM");
	} else {
		checks.push({
			id: dkim.id,
			label: "DKIM",
			run: () => checkDkimRecord(dkim.fqdn, dkim.value),
		});
	}

	if (flags.isSendingEmailEnabled) {
		const spf = records.find(
			(record) =>
				record.recordType === "TXT" && record.value.startsWith("v=spf1"),
		);
		const dmarc = records.find(
			(record) =>
				record.recordType === "TXT" && record.value.startsWith("v=DMARC1"),
		);
		if (!spf) missingConfig.push("SPF");
		else {
			checks.push({
				id: spf.id,
				label: "SPF",
				run: () => checkSpfRecord(spf.fqdn, spf.value),
			});
		}
		if (!dmarc) missingConfig.push("DMARC");
		else {
			checks.push({
				id: dmarc.id,
				label: "DMARC",
				run: () => checkDmarcRecord(dmarc.fqdn, dmarc.value),
			});
		}
	}

	if (flags.isReceivingEmailEnabled) {
		const mx =
			records.find(
				(record) =>
					record.recordType === "MX" && record.purpose === "receiving",
			) ??
			records.find(
				(record) => record.recordType === "MX" && record.purpose === "sending",
			);
		if (!mx) {
			missingConfig.push("MX");
		} else {
			checks.push({
				id: mx.id,
				label: "MX",
				run: () => checkMxRecord(mx.fqdn, mx.value, mx.priority ?? 10),
			});
		}
	}

	const trackingEnabled =
		flags.isClickTrackingEnabled || flags.isOpenTrackingEnabled;
	if (trackingEnabled) {
		const cname = records.find((record) => record.recordType === "CNAME");
		if (!cname) {
			missingConfig.push("CNAME");
		} else {
			checks.push({
				id: cname.id,
				label: "CNAME",
				run: () => checkCnameRecord(cname.fqdn, cname.value),
			});
		}
	}

	return { missingConfig, checks };
}

export function dnsFailureReason(failed: string[]): string {
	if (failed.length === 0) {
		return "One or more DNS records could not be verified";
	}
	if (failed.length === 1) {
		return `Your ${failed[0]} record is missing or incorrect`;
	}
	const last = failed[failed.length - 1];
	const rest = failed.slice(0, -1).join(", ");
	return `Your ${rest}, and ${last} records are missing or incorrect`;
}

export type DnsCheckSummary =
	| { ok: true }
	| {
			ok: false;
			code: "unverified";
			missing: string[];
			reason: string;
			transient: false;
	  }
	| {
			ok: false;
			code: "lookup_failed";
			missing: string[];
			transient: true;
	  };

export function summarizeDnsChecks(input: {
	missingConfig: string[];
	results: { label: string; outcome: DnsCheckOutcome }[];
}): DnsCheckSummary {
	const mismatched = input.results
		.filter((result) => result.outcome === "mismatch")
		.map((result) => result.label);
	const lookupFailed = input.results
		.filter((result) => result.outcome === "lookup_failed")
		.map((result) => result.label);
	const missing = [...input.missingConfig, ...mismatched];

	if (missing.length > 0) {
		return {
			ok: false,
			code: "unverified",
			missing,
			reason: dnsFailureReason(missing),
			transient: false,
		};
	}
	if (lookupFailed.length > 0) {
		return {
			ok: false,
			code: "lookup_failed",
			missing: lookupFailed,
			transient: true,
		};
	}
	return { ok: true };
}

export type SendingDomainDnsResult =
	| { ok: true }
	| { ok: false; code: "not_found" }
	| { ok: false; code: "suspended" }
	| { ok: false; code: "sending_disabled" }
	| {
			ok: false;
			code: "unverified";
			missing: string[];
			reason: string;
			transient: false;
	  }
	| {
			ok: false;
			code: "lookup_failed";
			missing: string[];
			transient: true;
	  };

/**
 * Live-check every DNS record required for this domain before a send.
 * A stored "active" flag is not enough: the customer may have deleted the
 * records at their DNS host since the last verification job.
 *
 * A definitive mismatch marks the domain unverified. A resolver timeout
 * blocks this send and leaves the stored status alone.
 * Suspended domains stay suspended.
 */
export async function ensureSendingDomainVerified(
	{
		domainId,
		organizationId,
	}: {
		domainId: string;
		organizationId: string;
	},
	database: DatabaseInstance = defaultDb,
): Promise<SendingDomainDnsResult> {
	const row = await database.query.domain.findFirst({
		where: and(
			eq(domain.id, domainId),
			eq(domain.organizationId, organizationId),
			isNull(domain.deletedAt),
		),
		columns: {
			id: true,
			status: true,
			systemVerified: true,
			isSendingEmailEnabled: true,
			isReceivingEmailEnabled: true,
			isClickTrackingEnabled: true,
			isOpenTrackingEnabled: true,
		},
		with: {
			dnsRecords: {
				where: isNull(domainDnsRecord.deletedAt),
				columns: {
					id: true,
					recordType: true,
					value: true,
					fqdn: true,
					priority: true,
					purpose: true,
					status: true,
				},
			},
		},
	});

	if (!row) return { ok: false, code: "not_found" };
	if (row.status === "suspended") return { ok: false, code: "suspended" };
	if (!row.isSendingEmailEnabled) {
		return { ok: false, code: "sending_disabled" };
	}

	const flags: DomainCheckFlags = {
		isSendingEmailEnabled: row.isSendingEmailEnabled,
		isReceivingEmailEnabled: row.isReceivingEmailEnabled,
		isClickTrackingEnabled: row.isClickTrackingEnabled,
		isOpenTrackingEnabled: row.isOpenTrackingEnabled,
	};
	const trackingEnabled =
		flags.isClickTrackingEnabled || flags.isOpenTrackingEnabled;
	const { missingConfig, checks } = planDomainDnsChecks(row.dnsRecords, flags);
	const outcomes = await Promise.all(
		checks.map(async (check) => ({
			id: check.id,
			label: check.label,
			outcome: await check.run(),
		})),
	);
	const summary = summarizeDnsChecks({
		missingConfig,
		results: outcomes.map(({ label, outcome }) => ({ label, outcome })),
	});

	if (summary.ok) {
		const storedActive = new Map(
			row.dnsRecords.map((record) => [record.id, record.status]),
		);
		const alreadyVerified =
			row.status === "active" &&
			row.systemVerified &&
			outcomes.every((result) => storedActive.get(result.id) === "active");
		if (!alreadyVerified) {
			await Promise.all([
				database
					.update(domain)
					.set({
						status: "active",
						systemVerified: true,
						userVerifiedDomain: true,
						lastVerifiedAt: new Date(),
						verificationFailedReason: null,
						isTrackingDomain: trackingEnabled,
					})
					.where(eq(domain.id, domainId)),
				...outcomes.map((result) =>
					database
						.update(domainDnsRecord)
						.set({ status: "active", verificationError: null })
						.where(eq(domainDnsRecord.id, result.id)),
				),
			]);
		}
		return { ok: true };
	}

	if (summary.code === "lookup_failed") {
		const confirmed = outcomes.filter((result) => result.outcome === "match");
		if (confirmed.length > 0) {
			await Promise.all(
				confirmed.map((result) =>
					database
						.update(domainDnsRecord)
						.set({ status: "active", verificationError: null })
						.where(eq(domainDnsRecord.id, result.id)),
				),
			);
		}
		return summary;
	}

	const failedIds = new Set(
		outcomes
			.filter((result) => result.outcome === "mismatch")
			.map((result) => result.id),
	);
	const passedIds = outcomes
		.filter((result) => result.outcome === "match")
		.map((result) => result.id);

	await Promise.all([
		database
			.update(domain)
			.set({
				status: "failed",
				systemVerified: false,
				verificationFailedReason: summary.reason,
				isTrackingDomain: false,
			})
			.where(eq(domain.id, domainId)),
		...[...failedIds].map((id) =>
			database
				.update(domainDnsRecord)
				.set({
					status: "failed",
					verificationError: "DNS record is missing or does not match",
				})
				.where(eq(domainDnsRecord.id, id)),
		),
		...passedIds.map((id) =>
			database
				.update(domainDnsRecord)
				.set({ status: "active", verificationError: null })
				.where(eq(domainDnsRecord.id, id)),
		),
	]);

	return summary;
}
