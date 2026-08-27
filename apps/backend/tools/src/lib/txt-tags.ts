/** Parse `k=v; k2=v2` DNS TXT tag strings (BIMI, DMARC, DKIM). */
export function parseTxtTags(record: string): Record<string, string> {
	const tags: Record<string, string> = {};
	for (const part of record.split(";")) {
		const trimmed = part.trim();
		if (!trimmed) continue;
		const eq = trimmed.indexOf("=");
		if (eq <= 0) continue;
		const key = trimmed.slice(0, eq).trim().toLowerCase();
		const value = trimmed.slice(eq + 1).trim();
		if (key) tags[key] = value;
	}
	return tags;
}
