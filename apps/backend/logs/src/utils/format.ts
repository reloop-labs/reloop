export function safeJsonParse(value: unknown, fallback: unknown): unknown {
	if (value !== null && typeof value === "object") {
		return value;
	}
	if (typeof value !== "string") {
		return fallback;
	}
	try {
		return JSON.parse(value);
	} catch {
		return fallback;
	}
}

export function formatLogDate(date: Date | string | null | undefined): string {
	if (!date) return new Date().toISOString();
	if (date instanceof Date) return date.toISOString();
	const parsed = new Date(date);
	if (Number.isNaN(parsed.getTime())) return new Date().toISOString();
	return parsed.toISOString();
}
