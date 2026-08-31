import net from "node:net";
import {
	type AuthSpfResult,
	type DomainAuthReport,
	checkDomainAuth,
	cleanDomainInput,
} from "@be/tools/routes/tools/auth-checker/auth-checker.service";

export interface SpoofReason {
	id: string;
	severity: "critical" | "warning" | "info" | "success";
	title: string;
	detail: string;
}

export interface SpoofNextStep {
	title: string;
	body: string;
	href: string;
}

export interface SpoofCheckResult {
	domain: string;
	resolvedAt: string;
	responseTimeMs: number;
	spoofable: boolean;
	verdict: "spoofable" | "partially_protected" | "protected";
	headline: string;
	summary: string;
	inboxOutcome: "delivered" | "spam" | "rejected";
	dmarc: {
		published: boolean;
		policy: string | null;
		subdomainPolicy: string | null;
		percentage: number | null;
		rawRecord: string | null;
	};
	spf: {
		published: boolean;
		qualifier: string | null;
		lookupCount: number;
		rawRecord: string | null;
	};
	dkim: {
		published: boolean;
		selector: string | null;
		keyLength: number | null;
	};
	mx: {
		published: boolean;
		provider: string | null;
	};
	reasons: SpoofReason[];
	nextStep: SpoofNextStep;
	subdomainNote?: string | null;
}

export function evaluateSpoofability(
	domain: string,
	report: {
		spf: AuthSpfResult;
		dmarc: {
			published: boolean;
			policy: string | null;
			subdomainPolicy: string | null;
			percentage: number | null;
			rawRecord: string | null;
			warnings?: string[];
		};
		dkim: {
			published: boolean;
			selector: string | null;
			keyLength: number | null;
		};
		mx: {
			published: boolean;
			provider: string | null;
		};
		responseTimeMs?: number;
		resolvedAt?: string;
	},
): SpoofCheckResult {
	const reasons: SpoofReason[] = [];
	let verdict: "spoofable" | "partially_protected" | "protected" = "spoofable";
	let spoofable = true;
	let headline = `Yes — anyone can send as you@${domain}`;
	let summary = "";
	let inboxOutcome: "delivered" | "spam" | "rejected" = "delivered";
	let subdomainNote: string | null = null;

	const { spf, dmarc, dkim, mx } = report;
	const isMultipleDmarc = Boolean(
		dmarc.warnings?.some((w) => w.toLowerCase().includes("multiple dmarc")),
	);
	const isSpfPlusAll = spf.published && spf.qualifier === "+all";
	const isSpfNeutral = spf.published && spf.qualifier === "?all";
	const pct = dmarc.percentage ?? 100;

	// Decision Tree
	if (isSpfPlusAll) {
		verdict = "spoofable";
		spoofable = true;
		inboxOutcome = "delivered";
		headline = `Yes — anyone can send as you@${domain}`;
		summary =
			"Your SPF record contains '+all', which explicitly tells mail servers that every IP on the internet is authorized to send email on your behalf.";
		reasons.push({
			id: "spf-plus-all",
			severity: "critical",
			title: "SPF is set to '+all' (Open Door)",
			detail:
				"The '+all' directive authorizes the entire internet to send email for your domain. Attackers will pass SPF authentication.",
		});
	} else if (!dmarc.published || isMultipleDmarc) {
		verdict = "spoofable";
		spoofable = true;
		inboxOutcome = "delivered";
		headline = `Yes — anyone can send as you@${domain}`;
		summary = isMultipleDmarc
			? "Multiple DMARC records were found. Mailbox providers will treat multiple records as invalid and deliver unauthenticated fake emails."
			: "No DMARC record is published. Receiving mail servers like Gmail and Outlook have no instruction to block fake emails using your domain.";
		reasons.push({
			id: isMultipleDmarc ? "dmarc-multiple" : "dmarc-missing",
			severity: "critical",
			title: isMultipleDmarc ? "Multiple DMARC records (Invalid)" : "Missing DMARC Record",
			detail: isMultipleDmarc
				? "RFC 7489 states that domains with more than one DMARC record must be treated as having no valid policy."
				: "Without a DMARC policy, email receivers cannot enforce SPF or DKIM failures and will deliver unauthorized messages.",
		});
	} else if (dmarc.policy === "none") {
		verdict = "spoofable";
		spoofable = true;
		inboxOutcome = "delivered";
		headline = `Yes — anyone can send as you@${domain}`;
		summary =
			"Your DMARC policy is set to 'p=none' (monitoring only). Receiving servers will still deliver unauthorized emails directly to inboxes.";
		reasons.push({
			id: "dmarc-p-none",
			severity: "critical",
			title: "DMARC is Monitoring Only ('p=none')",
			detail:
				"The 'p=none' policy collects telemetry reports but does not block spoofers. This is the most common reason domains remain vulnerable.",
		});
	} else if (dmarc.policy === "quarantine") {
		verdict = "partially_protected";
		spoofable = true;
		inboxOutcome = "spam";
		headline = `Sometimes — fake mail can still get through as you@${domain}`;
		summary =
			"Your DMARC policy is set to 'p=quarantine'. Mailbox providers are instructed to move unauthenticated emails to the Spam folder rather than rejecting them.";
		reasons.push({
			id: "dmarc-p-quarantine",
			severity: "warning",
			title: "DMARC Policy is 'p=quarantine'",
			detail:
				"Failing messages are marked as suspicious or sent to junk, but some mailbox providers may still deliver them if users check spam.",
		});
	} else if (dmarc.policy === "reject" && pct < 100) {
		verdict = "partially_protected";
		spoofable = true;
		inboxOutcome = "spam";
		headline = `Sometimes — fake mail can still get through as you@${domain}`;
		summary = `Your DMARC policy is set to 'p=reject' but only applies to ${pct}% of mail. The remaining ${100 - pct}% is subject to weaker enforcement.`;
		reasons.push({
			id: "dmarc-pct-low",
			severity: "warning",
			title: `Partial Enforcement ('pct=${pct}')`,
			detail: `Only ${pct}% of unauthorized messages are rejected. Increase 'pct=100' to fully protect all outbound email.`,
		});
	} else if (dmarc.policy === "reject" && !spf.published) {
		verdict = "partially_protected";
		spoofable = false;
		inboxOutcome = "spam";
		headline = `Sometimes — reject is set but SPF is missing`;
		summary =
			"Your DMARC policy is set to 'p=reject', but no SPF record was found. While spoofed mail with no DKIM signature is blocked, legitimate emails without DKIM will also be dropped.";
		reasons.push({
			id: "spf-missing-with-reject",
			severity: "warning",
			title: "Missing SPF Record",
			detail:
				"Publish a valid SPF record (e.g. 'v=spf1 include:... ~all') to ensure your legitimate sending infrastructure aligns with DMARC.",
		});
	} else if (dmarc.policy === "reject" && spf.published) {
		verdict = "protected";
		spoofable = false;
		inboxOutcome = "rejected";
		headline = `No — receivers are told to reject fakes as you@${domain}`;
		summary =
			"Your domain enforces strict DMARC ('p=reject') and SPF protection. Major mailbox providers like Gmail, Yahoo, and Outlook are instructed to immediately discard fraudulent emails.";
		reasons.push({
			id: "dmarc-protected",
			severity: "success",
			title: "Strict DMARC Policy ('p=reject')",
			detail:
				"Mailbox providers will drop and reject any message pretending to come from your domain that fails authentication.",
		});
	} else {
		verdict = "spoofable";
		spoofable = true;
		inboxOutcome = "delivered";
		headline = `Yes — anyone can send as you@${domain}`;
		summary = "The domain does not have an active DMARC enforcement policy.";
	}

	// Subdomain Hole Check (sp=none when root is reject/quarantine)
	if (dmarc.published && dmarc.subdomainPolicy === "none" && dmarc.policy === "reject") {
		subdomainNote = `Your root domain is locked, but your subdomains have 'sp=none' and are still spoofable (e.g. ceo@mail.${domain}).`;
		reasons.push({
			id: "subdomain-hole",
			severity: "warning",
			title: "Subdomain Vulnerability ('sp=none')",
			detail:
				"An attacker can still impersonate your brand by sending from subdomains like mail." +
				domain +
				" or billing." +
				domain +
				".",
		});
	} else if (dmarc.published && dmarc.subdomainPolicy === "reject") {
		reasons.push({
			id: "subdomain-locked",
			severity: "success",
			title: "Subdomains Locked ('sp=reject')",
			detail: "Subdomains inherit the strict rejection policy.",
		});
	}

	// Additional SPF & DKIM contextual reasons
	if (spf.published) {
		if (isSpfNeutral) {
			reasons.push({
				id: "spf-neutral",
				severity: "warning",
				title: "SPF Qualifier is Neutral ('?all')",
				detail:
					"The '?all' mechanism does not tell mail servers to fail unauthorized senders. Upgrade to '~all' or '-all'.",
			});
		} else if (spf.lookupCount > 10) {
			reasons.push({
				id: "spf-permerror",
				severity: "warning",
				title: `SPF Exceeds 10 Lookups (${spf.lookupCount}/10)`,
				detail:
					"Exceeding 10 DNS lookups triggers an SPF PermError, which can cause your own legitimate emails to fail authentication.",
			});
		} else if (spf.qualifier === "-all" || spf.qualifier === "~all") {
			reasons.push({
				id: "spf-valid",
				severity: "success",
				title: `SPF Configured ('${spf.qualifier}')`,
				detail: `Legitimate sending servers are specified with ${spf.lookupCount}/10 DNS lookups.`,
			});
		}
	}

	if (dkim.published) {
		reasons.push({
			id: "dkim-found",
			severity: "info",
			title: `DKIM Public Key Found (Selector: '${dkim.selector}')`,
			detail: dkim.keyLength ? `${dkim.keyLength}-bit RSA key` : "Published in DNS",
		});
	} else {
		reasons.push({
			id: "dkim-note",
			severity: "info",
			title: "DKIM Selector Notice",
			detail:
				"We tested common standard selectors. Your ESP (Google, SendGrid, Reloop) may use a custom selector for signing.",
		});
	}

	if (!mx.published) {
		reasons.push({
			id: "mx-missing",
			severity: "info",
			title: "No MX Records Published",
			detail:
				"This domain cannot receive inbound email. Fake emails sent as this domain can still be delivered, but return replies will bounce.",
		});
	}

	// Next Steps Guidance
	let nextStep: SpoofNextStep;
	if (verdict === "spoofable") {
		nextStep = {
			title: "Lock your domain with Reloop",
			body: "Add your domain in Reloop. We'll automatically generate your SPF, DKIM, and DMARC records, walk you from 'p=none' to 'p=reject', and send instant alerts if records drift.",
			href: "/dashboard/signup",
		};
	} else if (verdict === "partially_protected") {
		nextStep = {
			title: "Upgrade to strict enforcement ('p=reject')",
			body: "Move your DMARC policy from 'p=quarantine' to 'p=reject' and ensure 'pct=100' so 100% of unauthorized spoof attempts are immediately dropped.",
			href: `/tools/auth-checker?domain=${encodeURIComponent(domain)}`,
		};
	} else {
		nextStep = {
			title: "Your domain is protected",
			body: "Send transactional and marketing emails through Reloop with full SPF, DKIM, and DMARC alignment without weakening your security policy.",
			href: "/dashboard/signup",
		};
	}

	return {
		domain,
		resolvedAt: report.resolvedAt || new Date().toISOString(),
		responseTimeMs: report.responseTimeMs || 0,
		spoofable,
		verdict,
		headline,
		summary,
		inboxOutcome,
		dmarc: {
			published: dmarc.published,
			policy: dmarc.policy,
			subdomainPolicy: dmarc.subdomainPolicy,
			percentage: dmarc.percentage,
			rawRecord: dmarc.rawRecord,
		},
		spf: {
			published: spf.published,
			qualifier: spf.qualifier,
			lookupCount: spf.lookupCount,
			rawRecord: spf.rawRecord,
		},
		dkim: {
			published: dkim.published,
			selector: dkim.selector,
			keyLength: dkim.keyLength,
		},
		mx: {
			published: mx.published,
			provider: mx.provider,
		},
		reasons,
		nextStep,
		subdomainNote,
	};
}

export async function checkDomainSpoofability(
	rawInput: string,
): Promise<SpoofCheckResult> {
	let input = (rawInput || "").trim();
	if (!input) {
		throw new Error("Please enter a domain name (e.g. stripe.com).");
	}

	// Handle email address input: ceo@acme.com -> acme.com
	if (input.includes("@")) {
		const atIndex = input.lastIndexOf("@");
		input = input.slice(atIndex + 1);
	}

	const domain = cleanDomainInput(input);
	if (!domain || net.isIP(domain)) {
		throw new Error(
			"Enter a domain name (e.g. stripe.com). An IP address cannot be spoofed as a From domain.",
		);
	}

	const authReport: DomainAuthReport = await checkDomainAuth(domain);
	return evaluateSpoofability(domain, authReport);
}
