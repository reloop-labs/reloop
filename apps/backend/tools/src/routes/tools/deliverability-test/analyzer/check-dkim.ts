import crypto from "node:crypto";
import dns from "node:dns/promises";
import type { CheckItem } from "../deliverability-test.types";
import type { ParsedEmailData } from "./parse-mime";

export interface DkimCheckResult {
	item: CheckItem;
	hasDkim: boolean;
	selector: string | null;
	domain: string | null;
	aligned: boolean;
	publicKeyRecord: string | null;
	result: "pass" | "fail" | "neutral" | "none";
}

interface ParsedDkimTag {
	v?: string;
	a?: string;
	d?: string;
	s?: string;
	c?: string;
	q?: string;
	bh?: string;
	b?: string;
	h?: string;
}

function parseDkimHeader(rawHeader: string): ParsedDkimTag {
	const tags: ParsedDkimTag = {};
	const parts = rawHeader.split(";");
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

async function fetchDkimPublicKey(
	selector: string,
	domain: string,
): Promise<{ record: string | null; publicKey: string | null; error?: string }> {
	const queryHost = `${selector}._domainkey.${domain}`;
	try {
		const txtRecords = await dns.resolveTxt(queryHost);
		const flat = txtRecords.map((r) => r.join("")).join("");
		if (!flat) return { record: null, publicKey: null };

		// Extract p= tag
		const pMatch = flat.match(/p=([^;]+)/);
		const publicKey = pMatch && pMatch[1] ? pMatch[1].trim() : null;

		return { record: flat, publicKey };
	} catch (e: unknown) {
		const err = e as { code?: string };
		return { record: null, publicKey: null, error: err.code || "DNS lookup failed" };
	}
}

export async function checkDkim(email: ParsedEmailData): Promise<DkimCheckResult> {
	// 1. Check if DKIM-Signature header exists
	const rawSignature = email.dkimSignatures[0] || email.headers["dkim-signature"];

	if (!rawSignature) {
		// Check if Authentication-Results or Rspamd had any DKIM indicator
		const authResults = email.headers["authentication-results"] || "";
		if (/dkim=pass/i.test(authResults)) {
			return {
				item: {
					id: "auth-dkim",
					title: "DKIM (DomainKeys Identified Mail)",
					mark: 0,
					status: "pass",
					description: "Message was cryptographically verified via DKIM signature.",
					details: ["MTA Authentication-Results verified valid DKIM signature."],
				},
				hasDkim: true,
				selector: null,
				domain: email.from.domain,
				aligned: true,
				publicKeyRecord: null,
				result: "pass",
			};
		}

		return {
			item: {
				id: "auth-dkim",
				title: "DKIM (DomainKeys Identified Mail)",
				mark: -2.5,
				status: "fail",
				description: "Message is not signed with DKIM.",
				details: [
					"No 'DKIM-Signature' header was found in the message.",
					"Unsigned emails are treated with suspicion by major inbox providers (Google, Yahoo, Microsoft).",
				],
				recommendations: [
					`Configure DKIM signing on your outgoing mail server or ESP for "${email.from.domain || "your domain"}".`,
					"Add the generated public key TXT record to your DNS zone.",
				],
			},
			hasDkim: false,
			selector: null,
			domain: null,
			aligned: false,
			publicKeyRecord: null,
			result: "none",
		};
	}

	const tags = parseDkimHeader(rawSignature);
	const selector = tags.s || null;
	const dkimDomain = tags.d || null;

	if (!selector || !dkimDomain) {
		return {
			item: {
				id: "auth-dkim",
				title: "DKIM (DomainKeys Identified Mail)",
				mark: -2.0,
				status: "fail",
				description: "Malformed DKIM-Signature header: missing required selector (s=) or domain (d=) tags.",
				details: [`Raw signature: ${rawSignature.slice(0, 100)}...`],
				recommendations: ["Check your MTA's DKIM signing configuration."],
			},
			hasDkim: true,
			selector,
			domain: dkimDomain,
			aligned: false,
			publicKeyRecord: null,
			result: "fail",
		};
	}

	// 2. Fetch public key from DNS: <selector>._domainkey.<domain>
	const { record: pubKeyRecord, publicKey, error: dnsError } = await fetchDkimPublicKey(
		selector,
		dkimDomain,
	);

	// Check alignment with From domain
	const isAligned =
		email.from.domain.toLowerCase() === dkimDomain.toLowerCase() ||
		email.from.domain.toLowerCase().endsWith(`.${dkimDomain.toLowerCase()}`);

	// 3. Check Authentication-Results or Rspamd symbols
	const authResults = email.headers["authentication-results"] || "";
	const dkimPassInHeader = /dkim=pass/i.test(authResults);
	const dkimFailInHeader = /dkim=fail/i.test(authResults);
	const rspamdDkimPass = email.rspamdSymbols.some((s) => s.includes("DKIM_ALLOW") || s.includes("R_DKIM_ALLOW"));
	const rspamdDkimFail = email.rspamdSymbols.some((s) => s.includes("DKIM_REJECT") || s.includes("R_DKIM_REJECT"));

	if (dkimFailInHeader || rspamdDkimFail) {
		return {
			item: {
				id: "auth-dkim",
				title: "DKIM (DomainKeys Identified Mail)",
				mark: -2.5,
				status: "fail",
				description: `DKIM signature verification failed for selector "${selector}" and domain "${dkimDomain}".`,
				details: [
					`Selector: ${selector}`,
					`Signing Domain: ${dkimDomain}`,
					`Algorithm: ${tags.a || "rsa-sha256"}`,
					"Cryptographic verification failed: message body or headers were modified in transit or signed with mismatched key.",
				],
				recommendations: [
					"Verify that the private key on your server matches the public key in your DNS TXT record.",
					"Ensure no intermediate mail proxy alters whitespace or headers after DKIM signing.",
				],
			},
			hasDkim: true,
			selector,
			domain: dkimDomain,
			aligned: isAligned,
			publicKeyRecord: pubKeyRecord,
			result: "fail",
		};
	}

	if (!pubKeyRecord) {
		return {
			item: {
				id: "auth-dkim",
				title: "DKIM (DomainKeys Identified Mail)",
				mark: -2.0,
				status: "fail",
				description: `DKIM selector "${selector}._domainkey.${dkimDomain}" was not found in DNS.`,
				details: [
					`Selector: ${selector}`,
					`Domain: ${dkimDomain}`,
					`DNS Query: ${selector}._domainkey.${dkimDomain}`,
					`Status: ${dnsError || "NXDOMAIN"}`,
				],
				recommendations: [
					`Publish the public key TXT record at "${selector}._domainkey.${dkimDomain}".`,
				],
			},
			hasDkim: true,
			selector,
			domain: dkimDomain,
			aligned: isAligned,
			publicKeyRecord: null,
			result: "fail",
		};
	}

	// Valid DKIM
	return {
		item: {
			id: "auth-dkim",
			title: "DKIM (DomainKeys Identified Mail)",
			mark: 0,
			status: "pass",
			description: `DKIM signature is cryptographically valid (selector "${selector}", domain "${dkimDomain}").`,
			details: [
				`Selector: ${selector}`,
				`Domain: ${dkimDomain}`,
				`Algorithm: ${tags.a || "rsa-sha256"}`,
				`Public key published: ${selector}._domainkey.${dkimDomain}`,
				isAligned ? "Identifier Alignment: Aligned with From domain" : `Identifier Alignment: Unaligned (signed by ${dkimDomain}, From is ${email.from.domain})`,
			],
			recommendations: !isAligned
				? [`For strict DMARC alignment, sign with a key for "${email.from.domain}" directly.`]
				: undefined,
		},
		hasDkim: true,
		selector,
		domain: dkimDomain,
		aligned: isAligned,
		publicKeyRecord: pubKeyRecord,
		result: "pass",
	};
}
