import dns from "node:dns/promises";
import { withDeadline } from "@be/tools/utils/deadline";
import type { CheckItem } from "../deliverability-test.types";
import type { DkimCheckResult } from "./check-dkim";
import type { ParsedEmailData } from "./parse-mime";
import type { SpfCheckResult } from "./check-spf";

export interface DmarcCheckResult {
	item: CheckItem;
	hasDmarc: boolean;
	dmarcRecord: string | null;
	policy: "none" | "quarantine" | "reject" | "none_found";
	spfAligned: boolean;
	dkimAligned: boolean;
	aligned: boolean;
	result: "pass" | "fail" | "none";
}

interface ParsedDmarcTag {
	p?: string;
	sp?: string;
	pct?: string;
	rua?: string;
	ruf?: string;
	adkim?: string;
	aspf?: string;
}

function parseDmarcRecord(record: string): ParsedDmarcTag {
	const tags: ParsedDmarcTag = {};
	const parts = record.split(";");
	for (const part of parts) {
		const eqIndex = part.indexOf("=");
		if (eqIndex > 0) {
			const key = part.slice(0, eqIndex).trim().toLowerCase();
			const val = part.slice(eqIndex + 1).trim();
			(tags as Record<string, string>)[key] = val;
		}
	}
	return tags;
}

function getOrgDomain(domain: string): string {
	const parts = domain.split(".");
	if (parts.length <= 2) return domain;
	// Return last 2 parts (e.g. sub.example.com -> example.com)
	return parts.slice(-2).join(".");
}

async function fetchDmarcRecord(
	domain: string,
): Promise<{ record: string | null; queryHost: string }> {
	const queryHost = `_dmarc.${domain}`;
	try {
		const txtRecords = await withDeadline(
			dns.resolveTxt(queryHost),
			2000,
			`DMARC TXT lookup for ${queryHost}`,
		);
		const flat = txtRecords.map((r) => r.join("")).filter((r) => r.trim().startsWith("v=DMARC1"));
		if (flat.length > 0 && flat[0]) {
			return { record: flat[0], queryHost };
		}
	} catch {}

	// Fallback to organizational domain
	const orgDomain = getOrgDomain(domain);
	if (orgDomain !== domain) {
		const orgQueryHost = `_dmarc.${orgDomain}`;
		try {
			const txtRecords = await withDeadline(
				dns.resolveTxt(orgQueryHost),
				2000,
				`DMARC org domain lookup for ${orgQueryHost}`,
			);
			const flat = txtRecords.map((r) => r.join("")).filter((r) => r.trim().startsWith("v=DMARC1"));
			if (flat.length > 0 && flat[0]) {
				return { record: flat[0], queryHost: orgQueryHost };
			}
		} catch {}
	}

	return { record: null, queryHost };
}

export async function checkDmarc(
	email: ParsedEmailData,
	spfResult: SpfCheckResult,
	dkimResult: DkimCheckResult,
): Promise<DmarcCheckResult> {
	const fromDomain = email.from.domain.toLowerCase();

	if (!fromDomain) {
		return {
			item: {
				id: "auth-dmarc",
				title: "DMARC (Domain-based Message Authentication)",
				mark: -2.0,
				status: "fail",
				description: "No sender domain found in From header to check DMARC.",
				recommendations: ["Ensure email has a valid From: address with domain."],
			},
			hasDmarc: false,
			dmarcRecord: null,
			policy: "none_found",
			spfAligned: false,
			dkimAligned: false,
			aligned: false,
			result: "none",
		};
	}

	const { record: dmarcRecord, queryHost } = await fetchDmarcRecord(fromDomain);

	if (!dmarcRecord) {
		return {
			item: {
				id: "auth-dmarc",
				title: "DMARC (Domain-based Message Authentication)",
				mark: -1.5,
				status: "warn",
				description: `No DMARC policy found published at "${queryHost}".`,
				details: [
					`Queried: ${queryHost}`,
					"Major inbox providers (Gmail, Yahoo) require a DMARC policy for high delivery rates.",
				],
				recommendations: [
					`Publish a TXT record at "_dmarc.${fromDomain}" with value: "v=DMARC1; p=none; rua=mailto:dmarc-reports@${fromDomain}"`,
				],
			},
			hasDmarc: false,
			dmarcRecord: null,
			policy: "none_found",
			spfAligned: false,
			dkimAligned: false,
			aligned: false,
			result: "none",
		};
	}

	const tags = parseDmarcRecord(dmarcRecord);
	const rawPolicy = (tags.p || "none").toLowerCase();
	const policy = ["quarantine", "reject"].includes(rawPolicy)
		? (rawPolicy as "quarantine" | "reject")
		: "none";

	// Determine alignment
	// SPF is aligned if SPF passed and the SPF domain matches the From domain (or relaxed org domain)
	const spfDomain = spfResult.spfDomain.toLowerCase();
	const spfMatchesFrom =
		spfDomain === fromDomain ||
		fromDomain.endsWith(`.${spfDomain}`) ||
		getOrgDomain(spfDomain) === getOrgDomain(fromDomain);
	const spfAligned = spfResult.result === "pass" && spfMatchesFrom;

	// DKIM is aligned if DKIM passed and DKIM d= domain matches the From domain (or relaxed org domain)
	const dkimDomain = dkimResult.domain?.toLowerCase() || "";
	const dkimMatchesFrom =
		dkimDomain === fromDomain ||
		fromDomain.endsWith(`.${dkimDomain}`) ||
		(dkimDomain ? getOrgDomain(dkimDomain) === getOrgDomain(fromDomain) : false);
	const dkimAligned = dkimResult.result === "pass" && dkimMatchesFrom;

	// DMARC passes if at least one is aligned and authenticated
	const dmarcPassed = spfAligned || dkimAligned;

	if (!dmarcPassed) {
		let mark = -1.5;
		if (policy === "reject") mark = -2.5;
		else if (policy === "quarantine") mark = -2.0;

		return {
			item: {
				id: "auth-dmarc",
				title: "DMARC (Domain-based Message Authentication)",
				mark,
				status: "fail",
				description: `DMARC authentication failed: neither SPF nor DKIM is aligned with From domain "${fromDomain}".`,
				details: [
					`Policy: ${policy} (record: ${dmarcRecord})`,
					`SPF Alignment: ${spfAligned ? "Aligned" : "Misaligned"} (SPF evaluated on: ${spfResult.spfDomain || "unknown"})`,
					`DKIM Alignment: ${dkimAligned ? "Aligned" : "Misaligned"} (Signed by: ${dkimResult.domain || "unsigned"})`,
					policy === "reject"
						? "Your DMARC policy is 'reject', meaning receivers will reject this email."
						: policy === "quarantine"
							? "Your DMARC policy is 'quarantine', meaning receivers will send this to spam."
							: "Your DMARC policy is 'none', so receivers monitor without rejecting.",
				],
				recommendations: [
					`Align your DKIM signature domain (d=) or your Return-Path domain to match "${fromDomain}".`,
				],
			},
			hasDmarc: true,
			dmarcRecord,
			policy,
			spfAligned,
			dkimAligned,
			aligned: false,
			result: "fail",
		};
	}

	return {
		item: {
			id: "auth-dmarc",
			title: "DMARC (Domain-based Message Authentication)",
			mark: 0,
			status: "pass",
			description: `DMARC authentication passed with policy "${policy}" (at least one aligned signature).`,
			details: [
				`Record: ${dmarcRecord}`,
				`Policy: p=${policy}`,
				`SPF Alignment: ${spfAligned ? "Aligned (Pass)" : "Not aligned"}`,
				`DKIM Alignment: ${dkimAligned ? "Aligned (Pass)" : "Not aligned"}`,
			],
			recommendations:
				policy === "none"
					? ["Once your aligned authentication is stable, consider upgrading your policy to 'p=quarantine' or 'p=reject'."]
					: undefined,
		},
		hasDmarc: true,
		dmarcRecord,
		policy,
		spfAligned,
		dkimAligned,
		aligned: true,
		result: "pass",
	};
}
