import { domainToASCII } from "node:url";

export function normalizeDomain(rawInput: string): string {
	let cleaned = (rawInput || "").trim().toLowerCase();
	cleaned = cleaned.replace(/^https?:\/\//i, "");
	const slash = cleaned.search(/[/?#]/);
	if (slash !== -1) cleaned = cleaned.slice(0, slash);
	cleaned = cleaned.replace(/\.$/, "");

	const at = cleaned.lastIndexOf("@");
	if (at !== -1) cleaned = cleaned.slice(at + 1);

	if (/^[a-z0-9.-]+:\d+$/i.test(cleaned) && !cleaned.includes("::")) {
		cleaned = cleaned.replace(/:\d+$/, "");
	}

	try {
		return domainToASCII(cleaned) || cleaned;
	} catch {
		return cleaned;
	}
}

export function isPlausibleDomain(domain: string): boolean {
	if (!domain || domain.length > 253) return false;
	if (/\s/.test(domain)) return false;
	if (domain.startsWith(".") || domain.endsWith(".") || domain.includes("..")) {
		return false;
	}
	const labels = domain.split(".");
	if (labels.length < 2) return false;
	for (const label of labels) {
		if (label.length < 1 || label.length > 63) return false;
		if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(label)) return false;
	}
	return true;
}

export function isPlausibleSelector(selector: string): boolean {
	if (!selector || selector.length > 63) return false;
	return /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(selector);
}
