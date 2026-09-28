/**
 * undeliverable-recipient-domains.ts
 *
 * Recipient domains that can never receive mail, so accepting a send to them
 * only burns quota/credits and always fails downstream (NXDOMAIN / no MX).
 * Both the HTTP send API and the SMTP log-incoming path reject these with a
 * permanent error before any log, quota, or KumoMTA work happens.
 *
 * RFC 2606 reserves example.com / example.org / example.net plus the
 * .test / .invalid / .example / .localhost TLDs for documentation and
 * testing — they have no MX records by design.
 *
 * Extend with env: UNDELIVERABLE_RECIPIENT_DOMAINS=foo.test,bar.invalid
 */

const DEFAULT_BLOCKED_RECIPIENT_DOMAINS = [
	// RFC 2606 documentation domains — never deliverable.
	"example.com",
	"example.org",
	"example.net",
	"example.edu",
] as const;

const DEFAULT_BLOCKED_RECIPIENT_SUFFIXES = [
	// RFC 2606 reserved TLDs — any domain under these never resolves.
	".test",
	".invalid",
	".example",
	".localhost",
] as const;

function parseExtraDomains(): string[] {
	return (process.env.UNDELIVERABLE_RECIPIENT_DOMAINS ?? "")
		.split(",")
		.map((d) => d.trim().toLowerCase().replace(/^@/, ""))
		.filter(Boolean);
}

/** Exact domains + suffixes, lowercased. Evaluated per call so tests can set env. */
function blockedDomains(): Set<string> {
	return new Set<string>([
		...DEFAULT_BLOCKED_RECIPIENT_DOMAINS,
		...parseExtraDomains(),
	]);
}

function blockedSuffixes(): string[] {
	return [...DEFAULT_BLOCKED_RECIPIENT_SUFFIXES];
}

/** `Name <user@host>` → `host`, lowercased. Empty string when unparseable. */
export function extractRecipientDomain(email: string): string {
	const bare = email.match(/<([^<>]+)>/)?.[1] ?? email;
	const at = bare.lastIndexOf("@");
	if (at < 0) return "";
	return bare
		.slice(at + 1)
		.trim()
		.toLowerCase()
		.replace(/[>,\s;]+$/, "");
}

/** True when the recipient domain can never receive mail. */
export function isUndeliverableRecipientDomain(domain: string): boolean {
	const normalized = domain.trim().toLowerCase();
	if (!normalized) return false;
	if (blockedDomains().has(normalized)) return true;
	return blockedSuffixes().some((suffix) => normalized.endsWith(suffix));
}

/**
 * First blocked recipient email in the list, or null when all deliverable.
 * Comparison is case-insensitive and handles display-name formatting.
 */
export function findUndeliverableRecipient(emails: string[]): string | null {
	for (const email of emails) {
		if (isUndeliverableRecipientDomain(extractRecipientDomain(email))) {
			return email;
		}
	}
	return null;
}
