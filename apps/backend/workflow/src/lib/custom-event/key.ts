/** Machine-safe event keys: user.signed_up, order_completed, plan-upgraded */
const KEY_RE = /^[a-z][a-z0-9_.-]{0,127}$/;

export function isValidEventKey(key: string): boolean {
	return KEY_RE.test(key);
}

export function normalizeEventKey(raw: string): string {
	return raw.trim().toLowerCase();
}

export function slugifyEventKeyFromName(name: string): string {
	const base = name
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, ".")
		.replace(/^\.+|\.+$/g, "")
		.slice(0, 128);
	return base || "event";
}
