import { toWebMcpText as toText, type WebMcpTool } from "@reloop/webmcp";

/**
 * Free, read-only deliverability tools exposed to in-browser agents via
 * WebMCP. Names match the hosted Reloop MCP server where a tool exists in
 * both, so agents see one vocabulary. Each `execute` lazy-loads the same
 * client the tool page uses, so registering on every page costs no bundle.
 */

const readOnly = { readOnlyHint: true } as const;

const domainInput = (description: string) => ({
	type: "object",
	properties: {
		domain: { type: "string", description },
	},
	required: ["domain"],
});

type DomainInput = { domain: string };

export const publicWebMcpTools: WebMcpTool[] = [
	{
		name: "check_email_auth",
		description:
			"Audit a domain's email authentication: SPF, DKIM, DMARC, MX, BIMI and MTA-STS. Returns a score, grade, verdict and per-record warnings.",
		inputSchema: {
			type: "object",
			properties: {
				domain: {
					type: "string",
					description: "Domain to audit, e.g. example.com",
				},
				selector: {
					type: "string",
					description:
						"Optional DKIM selector. Common selectors are tried when omitted.",
				},
			},
			required: ["domain"],
		},
		annotations: readOnly,
		execute: async (input, { signal }) => {
			const { domain, selector } = input as DomainInput & { selector?: string };
			const { runAuthCheck } = await import(
				"@reloop/web/app/tools/auth-checker/check-api"
			);
			return toText(await runAuthCheck(domain, selector, signal));
		},
	},
	{
		name: "check_bimi",
		description:
			"Check a domain's BIMI record, logo SVG and VMC certificate, and whether inbox providers will show the brand logo.",
		inputSchema: domainInput("Domain to check, e.g. example.com"),
		annotations: readOnly,
		execute: async (input, { signal }) => {
			const { runBimiCheck } = await import(
				"@reloop/web/app/tools/bimi-checker/check-api"
			);
			return toText(await runBimiCheck((input as DomainInput).domain, signal));
		},
	},
	{
		name: "check_blocklist",
		description:
			"Check whether a domain or IP address is listed on major email DNS blocklists (DNSBLs).",
		inputSchema: {
			type: "object",
			properties: {
				target: { type: "string", description: "Domain or IPv4/IPv6 address" },
			},
			required: ["target"],
		},
		annotations: readOnly,
		execute: async (input, { signal }) => {
			const { runBlocklistCheck } = await import(
				"@reloop/web/app/tools/blocklist-checker/check-api"
			);
			return toText(
				await runBlocklistCheck((input as { target: string }).target, signal),
			);
		},
	},
	{
		name: "dns_lookup",
		description:
			"Look up DNS records for a domain. Returns formatted records plus an email summary (MX, SPF, DMARC).",
		inputSchema: {
			type: "object",
			properties: {
				domain: {
					type: "string",
					description: "Domain to query, e.g. example.com",
				},
				recordType: {
					type: "string",
					enum: [
						"ANY",
						"A",
						"AAAA",
						"MX",
						"TXT",
						"CNAME",
						"NS",
						"SOA",
						"CAA",
						"PTR",
						"SRV",
					],
					description: "Record type. Defaults to all common types.",
				},
			},
			required: ["domain"],
		},
		annotations: readOnly,
		execute: async (input, { signal }) => {
			const { domain, recordType } = input as DomainInput & {
				recordType?: import("@reloop/web/app/tools/dns-lookup/check-api").DnsRecordType;
			};
			const { runDnsLookup } = await import(
				"@reloop/web/app/tools/dns-lookup/check-api"
			);
			return toText(await runDnsLookup(domain, recordType, signal));
		},
	},
	{
		name: "check_domain_age",
		description:
			"Look up when a domain was registered, its registrar and expiry. Young domains have lower sender reputation.",
		inputSchema: domainInput("Domain to check, e.g. example.com"),
		annotations: readOnly,
		execute: async (input, { signal }) => {
			const { runDomainAge } = await import(
				"@reloop/web/app/tools/domain-age/check-api"
			);
			return toText(await runDomainAge((input as DomainInput).domain, signal));
		},
	},
	{
		name: "check_domain_reputation",
		description:
			"Score a domain's sending reputation from blocklists, authentication, age and infrastructure signals, with suggested fixes.",
		inputSchema: domainInput("Domain to check, e.g. example.com"),
		annotations: readOnly,
		execute: async (input, { signal }) => {
			const { runDomainReputationCheck } = await import(
				"@reloop/web/app/tools/domain-reputation-checker/check-api"
			);
			return toText(
				await runDomainReputationCheck((input as DomainInput).domain, signal),
			);
		},
	},
	{
		name: "check_lookalike_domains",
		description:
			"Find registered lookalike (typosquat/homoglyph) domains that could be used to phish a brand's customers.",
		inputSchema: domainInput("Brand domain to watch, e.g. example.com"),
		annotations: { ...readOnly, untrustedContentHint: true },
		execute: async (input, { signal }) => {
			const { runLookalikeWatch } = await import(
				"@reloop/web/app/tools/lookalike-watch/check-api"
			);
			return toText(
				await runLookalikeWatch((input as DomainInput).domain, signal),
			);
		},
	},
	{
		name: "validate_email",
		description:
			"Validate a single email address: syntax, MX, disposable/role detection and deliverability risk.",
		inputSchema: {
			type: "object",
			properties: {
				email: { type: "string", description: "Email address to validate" },
			},
			required: ["email"],
		},
		annotations: readOnly,
		execute: async (input, { signal }) => {
			const { runSingleHealthCheck } = await import(
				"@reloop/web/app/tools/email-validator/check-api"
			);
			return toText(
				await runSingleHealthCheck((input as { email: string }).email, signal),
			);
		},
	},
	{
		name: "check_spam_words",
		description:
			"Score an email subject and body for spam-trigger words and phrasing, with issues and rewrite recommendations.",
		inputSchema: {
			type: "object",
			properties: {
				subject: { type: "string", description: "Email subject line" },
				body: { type: "string", description: "Email body text" },
			},
		},
		annotations: readOnly,
		execute: async (input, { signal }) => {
			const { subject = "", body = "" } = input as {
				subject?: string;
				body?: string;
			};
			const { runSpamCheck } = await import(
				"@reloop/web/app/tools/email-spam-words-checker/check-api"
			);
			return toText(await runSpamCheck(subject, body, signal));
		},
	},
	{
		name: "check_spoofing",
		description:
			"Check whether attackers could send email that spoofs a domain, based on its SPF and DMARC enforcement.",
		inputSchema: domainInput("Domain to check, e.g. example.com"),
		annotations: readOnly,
		execute: async (input, { signal }) => {
			const { runSpoofCheck } = await import(
				"@reloop/web/app/tools/spoof-checker/check-api"
			);
			return toText(await runSpoofCheck((input as DomainInput).domain, signal));
		},
	},
	{
		name: "who_sends",
		description:
			"Identify which email providers and services are authorized to send mail for a domain.",
		inputSchema: domainInput("Domain to inspect, e.g. example.com"),
		annotations: readOnly,
		execute: async (input, { signal }) => {
			const { runWhoSends } = await import(
				"@reloop/web/app/tools/who-sends/check-api"
			);
			return toText(await runWhoSends((input as DomainInput).domain, signal));
		},
	},
	{
		name: "check_temp_email",
		description:
			"Check whether an email address or domain belongs to a temporary/disposable email provider.",
		inputSchema: {
			type: "object",
			properties: {
				email: { type: "string", description: "Email address or bare domain" },
			},
			required: ["email"],
		},
		annotations: readOnly,
		execute: async (input, { signal }) => {
			const { runCheck } = await import(
				"@reloop/web/app/tools/temp-email-checker/check-api"
			);
			return toText(await runCheck((input as { email: string }).email, signal));
		},
	},
];
