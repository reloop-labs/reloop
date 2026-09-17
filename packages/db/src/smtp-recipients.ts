/** Strip RFC 5322 display name: `"Name <email>"` → `"email"`. */
export function bareEmail(raw: string): string {
	const angled = raw.match(/<([^<>]+@[^<>]+)>/);
	const source = angled?.[1] ?? raw;
	const match = source.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
	return (match?.[0] ?? "").trim().toLowerCase();
}

/**
 * Split To/Cc/Bcc header blobs and envelope address lists into unique
 * recipients. A comma-separated To header counts as many people, not one.
 */
export function uniqueBareEmails(raw: string[]): string[] {
	const seen = new Set<string>();
	const emails: string[] = [];
	for (const item of raw) {
		for (const part of item.split(/[,;]/)) {
			const email = bareEmail(part);
			if (!email || seen.has(email)) continue;
			seen.add(email);
			emails.push(email);
		}
	}
	return emails;
}
