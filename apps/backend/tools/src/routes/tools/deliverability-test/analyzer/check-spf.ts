import dns from "node:dns/promises";
import { withDeadline } from "@be/tools/utils/deadline";
import type { CheckItem } from "../deliverability-test.types";
import type { ParsedEmailData } from "./parse-mime";

export interface SpfCheckResult {
	item: CheckItem;
	spfDomain: string;
	spfRecord: string | null;
	result:
		| "pass"
		| "neutral"
		| "softfail"
		| "fail"
		| "none"
		| "temperror"
		| "permerror";
}

async function fetchSpfRecord(
	domain: string,
): Promise<{ record: string | null; error?: string }> {
	try {
		const txtRecords = await withDeadline(
			dns.resolveTxt(domain),
			2000,
			`SPF TXT lookup for ${domain}`,
		);
		const flatRecords = txtRecords.map((r) => r.join(""));
		const spfRecords = flatRecords.filter((r) => r.trim().startsWith("v=spf1"));

		if (spfRecords.length === 0 || !spfRecords[0]) {
			return { record: null };
		}
		if (spfRecords.length > 1) {
			return {
				record: spfRecords[0],
				error: "Multiple SPF records found (RFC 7208 violation)",
			};
		}
		return { record: spfRecords[0] };
	} catch (e: unknown) {
		const err = e as { code?: string };
		if (err.code === "ENOTFOUND" || err.code === "ENODATA") {
			return { record: null };
		}
		return { record: null, error: err.code || "DNS lookup failed" };
	}
}

export async function checkSpf(
	email: ParsedEmailData,
): Promise<SpfCheckResult> {
	// Determine the domain for SPF evaluation (Return-Path is primary, fallback to From domain)
	let spfDomain = email.from.domain;
	if (email.returnPath && email.returnPath.includes("@")) {
		const parts = email.returnPath.split("@");
		if (parts[1]) spfDomain = parts[1].toLowerCase();
	}

	if (!spfDomain) {
		return {
			spfDomain: "",
			spfRecord: null,
			result: "none",
			item: {
				id: "auth-spf",
				title: "SPF (Sender Policy Framework)",
				mark: -2.0,
				status: "fail",
				description: "No sender domain found to evaluate SPF.",
				recommendations: [
					"Ensure your email includes a valid Return-Path or From address.",
				],
			},
		};
	}

	// 1. Check for MTA stamped Received-SPF or Authentication-Results header
	const receivedSpf = email.headers["received-spf"] || "";
	const authResults = email.headers["authentication-results"] || "";

	let headerVerdict: "pass" | "neutral" | "softfail" | "fail" | "none" | null =
		null;
	if (receivedSpf) {
		const lower = receivedSpf.toLowerCase();
		if (lower.startsWith("pass")) headerVerdict = "pass";
		else if (lower.startsWith("softfail")) headerVerdict = "softfail";
		else if (lower.startsWith("fail")) headerVerdict = "fail";
		else if (lower.startsWith("neutral")) headerVerdict = "neutral";
		else if (lower.startsWith("none")) headerVerdict = "none";
	} else if (authResults) {
		const match = authResults.match(/spf=([a-z]+)/i);
		if (match && match[1]) {
			const res = match[1].toLowerCase();
			if (["pass", "neutral", "softfail", "fail", "none"].includes(res)) {
				headerVerdict = res as
					| "pass"
					| "neutral"
					| "softfail"
					| "fail"
					| "none";
			}
		}
	}

	// 2. Query DNS for the SPF record
	const { record: spfRecord, error: dnsError } =
		await fetchSpfRecord(spfDomain);

	if (dnsError && dnsError.includes("Multiple SPF records")) {
		return {
			spfDomain,
			spfRecord,
			result: "permerror",
			item: {
				id: "auth-spf",
				title: "SPF (Sender Policy Framework)",
				mark: -2.0,
				status: "fail",
				description: `Domain ${spfDomain} has multiple SPF records, causing validation to fail.`,
				details: [
					`Domain: ${spfDomain}`,
					`Issue: Multiple TXT records starting with 'v=spf1'`,
				],
				recommendations: [
					"Merge all SPF directives into a single TXT record for this domain.",
				],
			},
		};
	}

	if (!spfRecord) {
		return {
			spfDomain,
			spfRecord: null,
			result: "none",
			item: {
				id: "auth-spf",
				title: "SPF (Sender Policy Framework)",
				mark: -1.5,
				status: "warn",
				description: `No SPF record found published for domain "${spfDomain}".`,
				details: [
					`Checked domain: ${spfDomain}`,
					`Sending IP: ${email.connectingIp || "Unknown"}`,
				],
				recommendations: [
					`Publish a TXT record for ${spfDomain} with value: "v=spf1 include:_spf.your-esp.com ~all"`,
				],
			},
		};
	}

	// If header explicitly stamped pass or we have a valid record
	if (headerVerdict === "pass") {
		return {
			spfDomain,
			spfRecord,
			result: "pass",
			item: {
				id: "auth-spf",
				title: "SPF (Sender Policy Framework)",
				mark: 0,
				status: "pass",
				description: `SPF record is valid and authorized for domain "${spfDomain}".`,
				details: [
					`Domain: ${spfDomain}`,
					`Record: ${spfRecord}`,
					email.connectingIp
						? `Connecting IP: ${email.connectingIp}`
						: "Sender IP authorized",
				],
			},
		};
	}

	if (headerVerdict === "softfail") {
		return {
			spfDomain,
			spfRecord,
			result: "softfail",
			item: {
				id: "auth-spf",
				title: "SPF (Sender Policy Framework)",
				mark: -1.0,
				status: "warn",
				description:
					"SPF resulted in SoftFail (~all). The sending IP is not explicitly authorized.",
				details: [
					`Domain: ${spfDomain}`,
					`Record: ${spfRecord}`,
					`Sending IP: ${email.connectingIp || "Unknown"}`,
				],
				recommendations: [
					`Add your sending server's IP address or include mechanism to the SPF record of ${spfDomain}.`,
				],
			},
		};
	}

	if (headerVerdict === "fail") {
		return {
			spfDomain,
			spfRecord,
			result: "fail",
			item: {
				id: "auth-spf",
				title: "SPF (Sender Policy Framework)",
				mark: -2.0,
				status: "fail",
				description:
					"SPF resulted in Hard Fail (-all). The sending IP is explicitly unauthorized.",
				details: [
					`Domain: ${spfDomain}`,
					`Record: ${spfRecord}`,
					`Sending IP: ${email.connectingIp || "Unknown"}`,
				],
				recommendations: [
					`Authorize your sending IP or ESP include in the SPF record on ${spfDomain}.`,
				],
			},
		};
	}

	// Default fallback when SPF record exists
	const hasStrictOrSoft =
		spfRecord.includes("-all") || spfRecord.includes("~all");
	return {
		spfDomain,
		spfRecord,
		result: "pass",
		item: {
			id: "auth-spf",
			title: "SPF (Sender Policy Framework)",
			mark: hasStrictOrSoft ? 0 : -0.5,
			status: hasStrictOrSoft ? "pass" : "warn",
			description: `SPF record found for "${spfDomain}".`,
			details: [`Domain: ${spfDomain}`, `Record: ${spfRecord}`],
			recommendations: !hasStrictOrSoft
				? [
						"We recommend ending your SPF record with '~all' or '-all' rather than '?all' or '+all'.",
					]
				: undefined,
		},
	};
}
