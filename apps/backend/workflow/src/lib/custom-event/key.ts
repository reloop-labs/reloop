/** Machine-safe event keys: trigger.signed_up, trigger.order_completed */
const KEY_RE = /^[a-z][a-z0-9_.-]{0,127}$/;

export const TRIGGER_PREFIX = "trigger.";

export function isValidEventKey(key: string): boolean {
	return KEY_RE.test(key);
}

export function normalizeEventKey(raw: string): string {
	return raw.trim().toLowerCase();
}

export function ensureTriggerPrefix(key: string): string {
	const normalized = normalizeEventKey(key);
	if (normalized.startsWith(TRIGGER_PREFIX)) return normalized.slice(0, 128);
	// strip leading dots/underscores from suffix before prefixing
	const suffix = normalized.replace(/^[._-]+/, "");
	if (!suffix) return `${TRIGGER_PREFIX}event`;
	return `${TRIGGER_PREFIX}${suffix}`.slice(0, 128);
}

export function slugifyEventKeyFromName(name: string): string {
	const base = name
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, ".")
		.replace(/^\.+|\.+$/g, "")
		.slice(0, 128);
	const slug = base || "event";
	if (slug.startsWith(TRIGGER_PREFIX)) return slug.slice(0, 128);
	// avoid double prefix if name already started with trigger
	const cleaned = slug.replace(/^\.+/, "");
	return `${TRIGGER_PREFIX}${cleaned}`.slice(0, 128);
}
