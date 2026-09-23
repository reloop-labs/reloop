export const FIELD_ERROR_MESSAGE = "Invalid domain.";

function clean(raw: string): string {
	let value = raw.trim().toLowerCase();
	value = value.replace(/^mailto:/i, "").trim();
	value = value.replace(/^https?:\/\//i, "").trim();
	// Take host before any path, query, hash, port, or userinfo.
	value = value.split(/[\s/?#@]/)[0] ?? "";
	value = value.split(":")[0] ?? "";
	if (value.endsWith(".")) value = value.slice(0, -1);
	return value;
}

const DOMAIN_LABEL = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
const IDN_LABEL = /^(?:[\p{L}\p{N}])(?:[\p{L}\p{N}-]*[\p{L}\p{N}])?$/u;
const TLD = /^(?:[a-z]{2,}|xn--[a-z0-9-]{2,}|[\p{L}]{2,})$/u;

export type CheckerInputValidity = { ok: true } | { ok: false };

export function validateCheckerInput(raw: string): CheckerInputValidity {
	const domain = clean(raw);
	if (!domain || domain.length > 253) return { ok: false };
	if (/[/:?#\s]/.test(domain)) return { ok: false };
	const labels = domain.split(".");
	if (labels.length < 2) return { ok: false };
	for (const label of labels) {
		if (!label || label.length > 63) return { ok: false };
		if (label.startsWith("-") || label.endsWith("-")) return { ok: false };
		if (!DOMAIN_LABEL.test(label) && !IDN_LABEL.test(label)) {
			return { ok: false };
		}
	}
	const tld = labels[labels.length - 1];
	if (!tld || !TLD.test(tld)) return { ok: false };
	return { ok: true };
}

export function normalizeDomainInput(raw: string): string {
	return clean(raw);
}
