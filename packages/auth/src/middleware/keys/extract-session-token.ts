export function extractSessionToken(cookie: string | null): string | null {
	if (!cookie) return null;
	const match = cookie.match(/(?:^|;\s*)reloop\.session_token=([^;]+)/);
	if (!match?.[1]) return null;
	const raw = decodeURIComponent(match[1]);

	const token = raw.split(".")[0];
	return token || null;
}
