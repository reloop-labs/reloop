import dns from "node:dns/promises";
import net from "node:net";
import {
	type AuthSpfResult,
	type DomainAuthReport,
	checkDomainAuth,
	cleanDomainInput,
	parseSpfRecord,
} from "@be/tools/routes/tools/auth-checker/auth-checker.service";
import { withDeadline } from "@be/tools/utils/deadline";

export interface SenderEvidence {
	type:
		| "spf_include"
		| "nested_spf_include"
		| "dkim_selector"
		| "mx_host"
		| "ip4"
		| "ip6";
	value: string;
}

export interface SenderItem {
	vendor: string;
	role: "inbox_and_send" | "inbox_only" | "send" | "dkim_only";
	confidence: "high" | "medium" | "low";
	leftover: boolean;
	evidence: SenderEvidence[];
}

export interface InboxInfo {
	provider: string | null;
	exchanges: string[];
}

export interface UnnamedSenders {
	ip4: string[];
	ip6: string[];
	includes: string[];
}

export interface WhoSendsNextStep {
	title: string;
	body: string;
	href: string;
}

export interface WhoSendsReport {
	domain: string;
	resolvedAt: string;
	responseTimeMs: number;
	verdict:
		| "single_stack"
		| "split_stack"
		| "crowded"
		| "send_only"
		| "opaque"
		| "unpublished"
		| "wide_open";
	headline: string;
	summary: string;
	disclaimer: string;
	inbox: InboxInfo;
	senders: SenderItem[];
	unnamed: UnnamedSenders;
	spf: {
		published: boolean;
		qualifier: string | null;
		lookupCount: number;
		rawRecord: string | null;
	};
	nextStep: WhoSendsNextStep;
	subdomainNote?: string | null;
}

export interface VendorCatalogEntry {
	id: string;
	name: string;
	spfPatterns: RegExp[];
	dkimSelectors: string[];
	ambiguousSelectors?: string[];
}

export const VENDOR_CATALOG: VendorCatalogEntry[] = [
	{
		id: "reloop",
		name: "Reloop",
		spfPatterns: [/reloop\.sh$/i, /reloop\.email$/i, /spf\.reloop\.sh$/i],
		dkimSelectors: ["reloop"],
		ambiguousSelectors: ["s1"],
	},
	{
		id: "google_workspace",
		name: "Google Workspace",
		spfPatterns: [
			/_spf\.google\.com$/i,
			/_spf\.googlemail\.com$/i,
			/google\.com$/i,
		],
		dkimSelectors: ["google"],
	},
	{
		id: "microsoft_365",
		name: "Microsoft 365",
		spfPatterns: [
			/spf\.protection\.outlook\.com$/i,
			/protection\.outlook\.com$/i,
			/outlook\.com$/i,
		],
		dkimSelectors: ["selector1", "selector2"],
	},
	{
		id: "amazon_ses",
		name: "Amazon SES",
		spfPatterns: [/amazonses\.com$/i, /_spf\.amazonses\.com$/i],
		dkimSelectors: ["ses", "amazonses"],
	},
	{
		id: "sendgrid",
		name: "SendGrid",
		spfPatterns: [/sendgrid\.net$/i, /sendgrid\.com$/i],
		dkimSelectors: ["sendgrid", "smtpapi", "s2"],
		ambiguousSelectors: ["s1"],
	},
	{
		id: "mailgun",
		name: "Mailgun",
		spfPatterns: [/mailgun\.org$/i, /mailgun\.com$/i],
		dkimSelectors: ["mailo", "mxa", "mailgun"],
	},
	{
		id: "postmark",
		name: "Postmark",
		spfPatterns: [/postmarkapp\.com$/i, /mtasv\.net$/i, /wildbit\.com$/i],
		dkimSelectors: ["postmark", "pm"],
	},
	{
		id: "mailchimp",
		name: "Mailchimp",
		spfPatterns: [
			/servers\.mcsv\.net$/i,
			/mcsv\.net$/i,
			/mandrillapp\.com$/i,
			/mandrill\.com$/i,
		],
		dkimSelectors: ["k1", "k2", "k3", "mandrill"],
	},
	{
		id: "hubspot",
		name: "HubSpot",
		spfPatterns: [/hubspotemail\.net$/i, /hubspot\.com$/i],
		dkimSelectors: ["hs1", "hs2"],
	},
	{
		id: "zendesk",
		name: "Zendesk",
		spfPatterns: [/zendesk\.com$/i, /spf\.zendesk\.com$/i, /mail\.zendesk\.com$/i],
		dkimSelectors: ["zendesk1", "zendesk2"],
	},
	{
		id: "salesforce",
		name: "Salesforce / Marketing Cloud",
		spfPatterns: [
			/exacttarget\.com$/i,
			/salesforce\.com$/i,
			/cust-spf\.exacttarget\.com$/i,
		],
		dkimSelectors: ["mta", "sfmc"],
	},
	{
		id: "sparkpost",
		name: "SparkPost / MessageBird",
		spfPatterns: [/sparkpostmail\.com$/i, /sparkpost\.com$/i],
		dkimSelectors: ["scph", "sparkpost"],
	},
	{
		id: "customer_io",
		name: "Customer.io",
		spfPatterns: [/customer\.io$/i],
		dkimSelectors: ["cio"],
	},
	{
		id: "loops",
		name: "Loops",
		spfPatterns: [/loops\.so$/i],
		dkimSelectors: ["loops"],
	},
	{
		id: "resend",
		name: "Resend",
		spfPatterns: [/resend\.com$/i, /resend\.app$/i],
		dkimSelectors: ["resend"],
	},
	{
		id: "valimail",
		name: "Valimail",
		spfPatterns: [/vali\.email$/i, /valimail\.com$/i, /valimail\.net$/i],
		dkimSelectors: ["valimail", "vm"],
	},
	{
		id: "cloudflare",
		name: "Cloudflare Email",
		spfPatterns: [
			/_spf\.mx\.cloudflare\.net$/i,
			/cloudflare\.com$/i,
			/cloudflare\.net$/i,
		],
		dkimSelectors: ["cloudflare"],
	},
	{
		id: "proofpoint",
		name: "Proofpoint",
		spfPatterns: [/pphosted\.com$/i, /proofpoint\.com$/i],
		dkimSelectors: ["proofpoint", "pp"],
	},
	{
		id: "mimecast",
		name: "Mimecast",
		spfPatterns: [/mimecast\.com$/i, /dmarcanalyzer\.com$/i],
		dkimSelectors: ["mimecast"],
	},
	{
		id: "barracuda",
		name: "Barracuda",
		spfPatterns: [/barracudanetworks\.com$/i, /ess\.barracudanetworks\.com$/i],
		dkimSelectors: ["barracuda"],
	},
	{
		id: "redsift",
		name: "Red Sift (OnDMARC)",
		spfPatterns: [/ondmarc\.com$/i, /redsift\.com$/i],
		dkimSelectors: ["ondmarc"],
	},
	{
		id: "powerdmarc",
		name: "PowerDMARC",
		spfPatterns: [/powerdmarc\.com$/i],
		dkimSelectors: ["powerdmarc"],
	},
	{
		id: "easydmarc",
		name: "EasyDMARC",
		spfPatterns: [/easydmarc\.com$/i],
		dkimSelectors: ["easydmarc"],
	},
	{
		id: "zoho",
		name: "Zoho Mail",
		spfPatterns: [/zoho\.(?:com|eu|in)$/i, /transmail\.net$/i],
		dkimSelectors: ["zmail", "zoho"],
	},
	{
		id: "proton",
		name: "Proton Mail",
		spfPatterns: [/protonmail\.ch$/i, /proton\.me$/i],
		dkimSelectors: ["protonmail"],
	},
	{
		id: "fastmail",
		name: "Fastmail",
		spfPatterns: [/messagingengine\.com$/i, /fastmail\.com$/i],
		dkimSelectors: ["mesmtp", "fm1"],
	},
	{
		id: "icloud",
		name: "iCloud Mail",
		spfPatterns: [/icloud\.com$/i, /apple\.com$/i],
		dkimSelectors: ["icloud"],
	},
	{
		id: "brevo",
		name: "Brevo (Sendinblue)",
		spfPatterns: [/sendinblue\.com$/i, /brevo\.com$/i],
		dkimSelectors: ["mail"],
	},
	{
		id: "klaviyo",
		name: "Klaviyo",
		spfPatterns: [/klaviyo\.com$/i, /klaviyomail\.com$/i],
		dkimSelectors: ["kl"],
	},
];

export function mapSpfIncludeToVendor(host: string): VendorCatalogEntry | null {
	const clean = host.toLowerCase().trim();
	for (const entry of VENDOR_CATALOG) {
		if (entry.spfPatterns.some((p) => p.test(clean))) {
			return entry;
		}
	}
	return null;
}

export function mapDkimSelectorToVendor(
	selector: string,
	presentSpfVendors: Set<string>,
): { vendor: VendorCatalogEntry | null; isAmbiguous: boolean } {
	const sel = selector.toLowerCase().trim();

	// Check direct unique selectors first
	for (const entry of VENDOR_CATALOG) {
		if (entry.dkimSelectors.includes(sel)) {
			return { vendor: entry, isAmbiguous: false };
		}
	}

	// Check ambiguous selectors like 's1'
	const matches = VENDOR_CATALOG.filter((e) =>
		e.ambiguousSelectors?.includes(sel),
	);
	if (matches.length > 0) {
		// If SPF already lists one of these vendors, associate with that vendor
		const spfMatch = matches.find((m) => presentSpfVendors.has(m.name));
		if (spfMatch) {
			return { vendor: spfMatch, isAmbiguous: matches.length > 1 };
		}
		// If no SPF match or multiple SPF matches, treat as ambiguous
		return { vendor: null, isAmbiguous: true };
	}

	return { vendor: null, isAmbiguous: false };
}

export async function resolveNestedSpfIncludes(
	unmatchedIncludes: string[],
	resolver: dns.Resolver,
	maxDepth = 2,
	maxTotalLookups = 10,
): Promise<Array<{ originalHost: string; nestedHost: string }>> {
	const results: Array<{ originalHost: string; nestedHost: string }> = [];
	let lookupsDone = 0;

	for (const host of unmatchedIncludes) {
		if (lookupsDone >= maxTotalLookups) break;
		try {
			lookupsDone++;
			const txts = await withDeadline(
				resolver.resolveTxt(host),
				1200,
				`Nested SPF TXT (${host})`,
			);
			const spfTxt = (txts || [])
				.map((entry) => entry.join("").trim())
				.find((t) => t.startsWith("v=spf1"));

			if (spfTxt) {
				const parsed = parseSpfRecord(spfTxt);
				for (const childInc of parsed.includes) {
					results.push({ originalHost: host, nestedHost: childInc });
				}
				// Also check redirect=
				const redirectMatch = spfTxt.match(/redirect=([^\s]+)/i);
				if (redirectMatch && redirectMatch[1]) {
					results.push({ originalHost: host, nestedHost: redirectMatch[1] });
				}
			}
		} catch {
			// Ignore DNS errors on nested hosts
		}
	}

	return results;
}

export interface IdentifySendersInput {
	domain: string;
	inbox: {
		provider: string | null;
		exchanges: string[];
	};
	spf: {
		published: boolean;
		qualifier: string | null;
		lookupCount: number;
		includes: string[];
		ip4: string[];
		ip6: string[];
		rawRecord: string | null;
	};
	dkim: {
		published: boolean;
		selector: string | null;
		keyLength: number | null;
		testedSelectors?: string[];
	};
	nestedSpf?: Array<{ originalHost: string; nestedHost: string }>;
	dmarcSubdomainPolicy?: string | null;
	dmarcPolicy?: string | null;
	responseTimeMs?: number;
	resolvedAt?: string;
}

export function identifySenders(input: IdentifySendersInput): WhoSendsReport {
	const {
		domain,
		inbox,
		spf,
		dkim,
		nestedSpf = [],
		dmarcSubdomainPolicy,
		dmarcPolicy,
		responseTimeMs = 0,
		resolvedAt = new Date().toISOString(),
	} = input;

	const disclaimer =
		"This is who DNS authorizes, not who sent mail last week. DNS is a permission list, not a volume log.";

	// 1. Map SPF Includes
	const vendorSendersMap = new Map<
		string,
		{
			vendor: string;
			role: "inbox_and_send" | "inbox_only" | "send" | "dkim_only";
			confidence: "high" | "medium" | "low";
			leftover: boolean;
			evidence: SenderEvidence[];
		}
	>();

	const unnamedIncludes: string[] = [];
	const mappedOriginalHosts = new Set<string>();

	for (const inc of spf.includes) {
		const vendorMatch = mapSpfIncludeToVendor(inc);
		if (vendorMatch) {
			mappedOriginalHosts.add(inc);
			if (!vendorSendersMap.has(vendorMatch.name)) {
				vendorSendersMap.set(vendorMatch.name, {
					vendor: vendorMatch.name,
					role:
						inbox.provider &&
						(inbox.provider.toLowerCase().includes(vendorMatch.name.toLowerCase()) ||
							vendorMatch.name.toLowerCase().includes(inbox.provider.toLowerCase()))
							? "inbox_and_send"
							: "send",
					confidence: "high",
					leftover: false,
					evidence: [{ type: "spf_include", value: inc }],
				});
			} else {
				vendorSendersMap.get(vendorMatch.name)!.evidence.push({
					type: "spf_include",
					value: inc,
				});
			}
		} else {
			unnamedIncludes.push(inc);
		}
	}

	// 2. Map Nested SPF Includes
	for (const nested of nestedSpf) {
		const vendorMatch = mapSpfIncludeToVendor(nested.nestedHost);
		if (vendorMatch) {
			mappedOriginalHosts.add(nested.originalHost);
			const evidenceVal = `${nested.originalHost} → ${nested.nestedHost}`;
			if (!vendorSendersMap.has(vendorMatch.name)) {
				vendorSendersMap.set(vendorMatch.name, {
					vendor: vendorMatch.name,
					role:
						inbox.provider &&
						(inbox.provider.toLowerCase().includes(vendorMatch.name.toLowerCase()) ||
							vendorMatch.name.toLowerCase().includes(inbox.provider.toLowerCase()))
							? "inbox_and_send"
							: "send",
					confidence: "high",
					leftover: false,
					evidence: [{ type: "nested_spf_include", value: evidenceVal }],
				});
			} else {
				vendorSendersMap.get(vendorMatch.name)!.evidence.push({
					type: "nested_spf_include",
					value: evidenceVal,
				});
			}
		}
	}

	// 3. Map DKIM Selectors
	const presentSpfVendorNames = new Set(vendorSendersMap.keys());
	if (dkim.published && dkim.selector) {
		const { vendor: dkimVendor } = mapDkimSelectorToVendor(
			dkim.selector,
			presentSpfVendorNames,
		);

		if (dkimVendor) {
			if (vendorSendersMap.has(dkimVendor.name)) {
				vendorSendersMap.get(dkimVendor.name)!.evidence.push({
					type: "dkim_selector",
					value: dkim.selector,
				});
			} else {
				// DKIM-only vendor
				vendorSendersMap.set(dkimVendor.name, {
					vendor: dkimVendor.name,
					role: "dkim_only",
					confidence: "medium",
					leftover: false,
					evidence: [{ type: "dkim_selector", value: dkim.selector }],
				});
			}
		}
	}

	// 4. Add Unmatched Includes as low confidence senders
	const remainingUnknownIncludes = unnamedIncludes.filter(
		(inc) => !mappedOriginalHosts.has(inc),
	);
	for (const unk of remainingUnknownIncludes) {
		if (!vendorSendersMap.has(unk)) {
			vendorSendersMap.set(unk, {
				vendor: unk,
				role: "send",
				confidence: "low",
				leftover: false,
				evidence: [{ type: "spf_include", value: unk }],
			});
		}
	}

	// 5. If Inbox provider exists but was not in SPF, tag if appropriate
	if (inbox.provider) {
		const matchedInboxVendor = VENDOR_CATALOG.find((v) =>
			inbox.provider!.toLowerCase().includes(v.name.toLowerCase()),
		);
		if (matchedInboxVendor && vendorSendersMap.has(matchedInboxVendor.name)) {
			const item = vendorSendersMap.get(matchedInboxVendor.name)!;
			if (item.role === "send") item.role = "inbox_and_send";
		}
	}

	// 6. Leftover detection (e.g. Mailchimp/SendGrid in SPF without DKIM signature while other ESPs have DKIM)
	const hasAnyDkimSignature = dkim.published;
	for (const [, item] of vendorSendersMap) {
		if (
			hasAnyDkimSignature &&
			item.role === "send" &&
			!item.evidence.some((e) => e.type === "dkim_selector") &&
			(item.vendor === "Mailchimp" ||
				item.vendor === "SendGrid" ||
				item.vendor === "Zendesk" ||
				item.vendor === "HubSpot")
		) {
			item.leftover = true;
		}
	}

	const senders = Array.from(vendorSendersMap.values());
	const namedSenders = senders.filter((s) => s.confidence !== "low");

	// 7. Determine Verdict
	let verdict:
		| "single_stack"
		| "split_stack"
		| "crowded"
		| "send_only"
		| "opaque"
		| "unpublished"
		| "wide_open";
	let headline = "";
	let summary = "";

	const isWideOpen = spf.published && spf.qualifier === "+all";
	const isUnpublished = !spf.published;
	const isIpOnly =
		namedSenders.length === 0 &&
		(spf.ip4.length > 0 || spf.ip6.length > 0 || remainingUnknownIncludes.length > 0);

	if (isWideOpen) {
		verdict = "wide_open";
		headline = "Anyone on the internet is authorized to send";
		summary =
			"Your SPF record contains '+all', explicitly permitting all IP addresses globally to send email pretending to be your domain.";
	} else if (isUnpublished) {
		verdict = "unpublished";
		headline = "No sending policy — we can’t see who is authorized";
		summary =
			"No SPF record is published. We cannot determine which email service providers are authorized to send on behalf of this domain.";
	} else if (isIpOnly && namedSenders.length === 0) {
		verdict = "opaque";
		headline = "Sending IPs are listed, but we can’t name the vendor";
		summary = `SPF authorizes ${spf.ip4.length + spf.ip6.length} direct IP range(s) without named ESP includes. Sending is tied to dedicated IP infrastructure.`;
	} else if (senders.length >= 4) {
		verdict = "crowded";
		headline = `${senders.length} services can send as ${domain}`;
		summary = `${senders.length} distinct service providers are authorized to send email for ${domain}. Multiple active includes increase SPF lookup limits and security surface area.`;
	} else if (!inbox.provider && senders.length >= 1) {
		verdict = "send_only";
		const sendNames = senders.map((s) => s.vendor).join(", ");
		headline = `Mail is sent via ${sendNames}. This domain does not receive mail.`;
		summary = `No MX records were found. This domain is configured exclusively for outbound transactional or marketing email via ${sendNames}.`;
	} else if (
		inbox.provider &&
		namedSenders.length > 0 &&
		namedSenders.every(
			(s) =>
				s.vendor.toLowerCase().includes(inbox.provider!.toLowerCase()) ||
				inbox.provider!.toLowerCase().includes(s.vendor.toLowerCase()),
		)
	) {
		verdict = "single_stack";
		headline = `${inbox.provider} receives and sends this company’s mail`;
		summary = `Both inbound mailbox routing and outbound sender authorization are consolidated entirely on ${inbox.provider}.`;
	} else if (senders.length >= 1) {
		verdict = "split_stack";
		const nonInboxSenders = senders
			.filter((s) => s.vendor !== inbox.provider)
			.map((s) => s.vendor);
		const senderListStr =
			nonInboxSenders.length > 0
				? nonInboxSenders.join(" and ")
				: senders.map((s) => s.vendor).join(" and ");

		headline = inbox.provider
			? `${inbox.provider} inbox. Mail is sent via ${senderListStr}.`
			: `Mail is sent via ${senderListStr}.`;
		summary = `${senders.length} provider(s) are authorized to send as ${domain}. Inbound mail routing and outbound delivery operate across separate stacks.`;
	} else {
		verdict = "unpublished";
		headline = "No sending policy — we can’t see who is authorized";
		summary = "The SPF record does not specify any authorized sender mechanisms.";
	}

	// Subdomain Note
	let subdomainNote: string | null = null;
	if (dmarcSubdomainPolicy === "none" && dmarcPolicy === "reject") {
		subdomainNote =
			"Note: Root domain has 'p=reject', but subdomains have 'sp=none' and can be spoofed by unauthorized senders.";
	}

	// 8. Dynamic Reloop Next Steps CTA
	const hasReloop = senders.some((s) => s.vendor === "Reloop");
	let nextStep: WhoSendsNextStep;

	if (hasReloop) {
		nextStep = {
			title: "Reloop is authorized",
			body: "Reloop is already configured in your SPF records. Verify and monitor sending reputation in your dashboard.",
			href: "/dashboard",
		};
	} else if (verdict === "wide_open") {
		nextStep = {
			title: "Fix '+all' SPF open door",
			body: "Replace '+all' with '~all' or '-all' and configure a strict DMARC policy to protect your domain from impersonation.",
			href: "/dashboard/signup",
		};
	} else if (verdict === "crowded" || senders.some((s) => s.leftover)) {
		nextStep = {
			title: "Clean up leftover sending vendors",
			body: "Consolidate unused third-party ESP includes into a single Reloop sending record to eliminate SPF lookup limit errors.",
			href: "/dashboard/signup",
		};
	} else if (verdict === "single_stack") {
		nextStep = {
			title: "Send product email with Reloop",
			body: "Keep your Google Workspace / Microsoft 365 inbox for team communication while sending transactional and broadcast emails reliably through Reloop.",
			href: "/dashboard/signup",
		};
	} else {
		nextStep = {
			title: "Consolidate sending infrastructure with Reloop",
			body: "Replace multiple sending vendors with Reloop's developer-first SMTP and API platform for 100% inbox placement.",
			href: "/dashboard/signup",
		};
	}

	return {
		domain,
		resolvedAt,
		responseTimeMs,
		verdict,
		headline,
		summary,
		disclaimer,
		inbox,
		senders,
		unnamed: {
			ip4: spf.ip4,
			ip6: spf.ip6,
			includes: remainingUnknownIncludes,
		},
		spf: {
			published: spf.published,
			qualifier: spf.qualifier,
			lookupCount: spf.lookupCount,
			rawRecord: spf.rawRecord,
		},
		nextStep,
		subdomainNote,
	};
}

export async function checkWhoSends(
	rawInput: string,
	resolver: dns.Resolver = new dns.Resolver(),
): Promise<WhoSendsReport> {
	let input = (rawInput || "").trim();
	if (!input) {
		throw new Error("Please enter a domain name (e.g. stripe.com).");
	}

	if (input.includes("@")) {
		const atIdx = input.lastIndexOf("@");
		input = input.slice(atIdx + 1);
	}

	const domain = cleanDomainInput(input);
	if (!domain || net.isIP(domain)) {
		throw new Error(
			"Enter a valid domain name (e.g. stripe.com). An IP address does not have sender records.",
		);
	}

	const start = Date.now();
	const authReport: DomainAuthReport = await checkDomainAuth(domain);

	// Unroll unmatched includes (depth 2)
	const unmatchedIncludes = authReport.spf.includes.filter(
		(inc) => !mapSpfIncludeToVendor(inc),
	);

	let nestedSpf: Array<{ originalHost: string; nestedHost: string }> = [];
	if (unmatchedIncludes.length > 0) {
		nestedSpf = await resolveNestedSpfIncludes(unmatchedIncludes, resolver);
	}

	const responseTimeMs = Date.now() - start;

	return identifySenders({
		domain,
		inbox: {
			provider: authReport.mx.provider,
			exchanges: authReport.mx.records.map((r) => r.exchange),
		},
		spf: {
			published: authReport.spf.published,
			qualifier: authReport.spf.qualifier,
			lookupCount: authReport.spf.lookupCount,
			includes: authReport.spf.includes,
			ip4: authReport.spf.ip4,
			ip6: authReport.spf.ip6,
			rawRecord: authReport.spf.rawRecord,
		},
		dkim: {
			published: authReport.dkim.published,
			selector: authReport.dkim.selector,
			keyLength: authReport.dkim.keyLength,
			testedSelectors: authReport.dkim.testedSelectors,
		},
		nestedSpf,
		dmarcSubdomainPolicy: authReport.dmarc.subdomainPolicy,
		dmarcPolicy: authReport.dmarc.policy,
		responseTimeMs,
		resolvedAt: new Date().toISOString(),
	});
}
