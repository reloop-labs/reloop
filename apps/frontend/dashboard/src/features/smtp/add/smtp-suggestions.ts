import type { Suggestion } from "./autocomplete-input";

const TLDS = [
	"com",
	"io",
	"co",
	"dev",
	"app",
	"ai",
	"net",
	"org",
	"xyz",
	"so",
	"sh",
	"me",
	"co.uk",
	"in",
	"de",
] as const;

export type SmtpProviderPreset = {
	name: string;
	host: string;
	port: number;
	/** Fixed SMTP login for providers that use one (e.g. SendGrid's `apikey`). */
	username?: string;
};

export const SMTP_PRESETS: SmtpProviderPreset[] = [
	{
		name: "SendGrid",
		host: "smtp.sendgrid.net",
		port: 587,
		username: "apikey",
	},
	{ name: "Postmark", host: "smtp.postmarkapp.com", port: 587 },
	{ name: "Mailgun", host: "smtp.mailgun.org", port: 587 },
	{
		name: "Amazon SES (us-east-1)",
		host: "email-smtp.us-east-1.amazonaws.com",
		port: 587,
	},
	{
		name: "Amazon SES (eu-west-1)",
		host: "email-smtp.eu-west-1.amazonaws.com",
		port: 587,
	},
	{ name: "Google Workspace / Gmail", host: "smtp.gmail.com", port: 587 },
	{ name: "Microsoft 365 / Outlook", host: "smtp.office365.com", port: 587 },
	{ name: "Brevo", host: "smtp-relay.brevo.com", port: 587 },
	{ name: "Resend", host: "smtp.resend.com", port: 587, username: "resend" },
	{ name: "Mailjet", host: "in-v3.mailjet.com", port: 587 },
	{
		name: "SparkPost",
		host: "smtp.sparkpostmail.com",
		port: 587,
		username: "SMTP_Injection",
	},
	{ name: "Mandrill", host: "smtp.mandrillapp.com", port: 587 },
	{ name: "Zoho Mail", host: "smtp.zoho.com", port: 587 },
	{ name: "Fastmail", host: "smtp.fastmail.com", port: 587 },
	{ name: "iCloud Mail", host: "smtp.mail.me.com", port: 587 },
	{ name: "Yahoo Mail", host: "smtp.mail.yahoo.com", port: 587 },
];

/**
 * Domain typeahead: the org's existing domains first, then TLD completions.
 * "acme" → acme.com, acme.io…; "acme.c" → acme.com, acme.co, acme.co.uk.
 */
export function domainSuggestions(
	input: string,
	existing: string[],
): Suggestion[] {
	const q = input
		.trim()
		.toLowerCase()
		.replace(/^https?:\/\//, "")
		.replace(/^www\./, "");
	const mine = existing
		.filter((d) => !q || d.includes(q))
		.slice(0, 4)
		.map((d) => ({ value: d, group: "Your domains" }));

	if (!q || /[^a-z0-9.-]/.test(q)) return mine;

	// "acme.c" completes the TLD; "send.acme" (no TLD prefix) appends one.
	const dot = q.lastIndexOf(".");
	const tail = dot === -1 ? "" : q.slice(dot + 1);
	const completesTld = dot !== -1 && TLDS.some((t) => t.startsWith(tail));
	const base = completesTld ? q.slice(0, dot) : q.replace(/\.+$/, "");
	const partialTld = completesTld ? tail : "";
	if (!base) return mine;

	const taken = new Set(mine.map((m) => m.value));
	const completions = TLDS.filter((tld) => tld.startsWith(partialTld))
		.map((tld) => `${base}.${tld}`)
		.filter((d) => !taken.has(d))
		.slice(0, 6)
		.map((d) => ({ value: d, group: mine.length ? "Suggestions" : undefined }));

	return [...mine, ...completions];
}

/** Host typeahead: the domain's own mail host guesses, then known providers. */
export function hostSuggestions(input: string, domain: string): Suggestion[] {
	const q = input.trim().toLowerCase();
	const own: Suggestion[] = domain
		? [`smtp.${domain}`, `mail.${domain}`]
				.filter((h) => !q || h.includes(q))
				.map((h) => ({
					value: h,
					label: h,
					hint: "Your server",
					group: "Your domain",
				}))
		: [];
	const providers = SMTP_PRESETS.filter(
		(p) => !q || p.name.toLowerCase().includes(q) || p.host.includes(q),
	).map((p) => ({
		value: p.host,
		label: p.name,
		hint: p.host,
		group: own.length ? "Providers" : undefined,
	}));
	return [...own, ...providers].slice(0, 10);
}

export function presetForHost(host: string): SmtpProviderPreset | undefined {
	return SMTP_PRESETS.find((p) => p.host === host.trim().toLowerCase());
}
