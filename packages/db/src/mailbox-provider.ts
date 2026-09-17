import type { MailboxProvider } from "./schema/sending-ip";

const GMAIL_DOMAINS = new Set(["gmail.com", "googlemail.com", "google.com"]);

const MICROSOFT_DOMAINS = new Set([
	"outlook.com",
	"outlook.co.uk",
	"outlook.fr",
	"outlook.de",
	"outlook.es",
	"outlook.it",
	"outlook.jp",
	"hotmail.com",
	"hotmail.co.uk",
	"hotmail.fr",
	"hotmail.de",
	"hotmail.es",
	"hotmail.it",
	"hotmail.co.jp",
	"live.com",
	"live.co.uk",
	"live.fr",
	"live.de",
	"msn.com",
	"passport.com",
	"windowslive.com",
]);

const YAHOO_DOMAINS = new Set([
	"yahoo.com",
	"yahoo.co.uk",
	"yahoo.co.jp",
	"yahoo.fr",
	"yahoo.de",
	"yahoo.es",
	"yahoo.it",
	"yahoo.ca",
	"yahoo.com.au",
	"yahoo.com.br",
	"yahoo.co.in",
	"ymail.com",
	"rocketmail.com",
	"aol.com",
	"aim.com",
	"wow.com",
	"verizon.net",
]);

const APPLE_DOMAINS = new Set([
	"icloud.com",
	"me.com",
	"mac.com",
	"privaterelay.appleid.com",
]);

const DOMAIN_TO_PROVIDER = new Map<string, MailboxProvider>([
	...[...GMAIL_DOMAINS].map((d) => [d, "gmail"] as const),
	...[...MICROSOFT_DOMAINS].map((d) => [d, "microsoft"] as const),
	...[...YAHOO_DOMAINS].map((d) => [d, "yahoo"] as const),
	...[...APPLE_DOMAINS].map((d) => [d, "apple"] as const),
]);

export function recipientDomain(emailOrDomain: string): string | null {
	const raw = emailOrDomain.trim().toLowerCase();
	if (!raw) return null;
	const at = raw.lastIndexOf("@");
	const domain = (at >= 0 ? raw.slice(at + 1) : raw).replace(/\.+$/, "");
	if (!domain || !domain.includes(".")) return null;
	return domain;
}

/**
 * Map a recipient address or domain onto the mailbox provider that
 * scores the sending IP. Consumer domains only — Google Workspace and
 * Microsoft 365 on custom domains classify as `other` until MX lookup
 * is wired at send time.
 */
export function classifyMailboxProvider(
	emailOrDomain: string,
): MailboxProvider {
	const domain = recipientDomain(emailOrDomain);
	if (!domain) return "other";
	return DOMAIN_TO_PROVIDER.get(domain) ?? "other";
}
