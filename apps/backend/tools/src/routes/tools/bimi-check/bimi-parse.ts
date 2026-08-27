import { parseTxtTags } from "@be/tools/lib/txt-tags";

export type CheckStatus = "pass" | "warn" | "fail";

export type BimiCheckItem = {
	id: string;
	label: string;
	status: CheckStatus;
	detail: string;
	record?: string;
	fix?: string;
};

export type BimiParsed = {
	raw: string;
	version: string | null;
	logoUrl: string | null;
	authorityUrl: string | null;
	isDecline: boolean;
};

export type DmarcForBimi = {
	present: boolean;
	record: string | null;
	policy: string | null;
	pct: number | null;
	enforced: boolean;
};

export function parseBimiRecord(raw: string): BimiParsed {
	const tags = parseTxtTags(raw);
	const version = tags.v ?? null;
	const logoUrl = Object.hasOwn(tags, "l") ? tags.l || "" : null;
	const authorityUrl = Object.hasOwn(tags, "a") ? tags.a || "" : null;

	return {
		raw,
		version,
		logoUrl,
		authorityUrl,
		isDecline: logoUrl === "",
	};
}

export function evaluateDmarcForBimi(record: string | null): DmarcForBimi {
	if (!record) {
		return {
			present: false,
			record: null,
			policy: null,
			pct: null,
			enforced: false,
		};
	}

	const tags = parseTxtTags(record);
	const policy = (tags.p || "").toLowerCase();
	const pct = tags.pct === undefined ? 100 : Number.parseInt(tags.pct, 10);
	const pctOk = Number.isFinite(pct) && pct === 100;
	const policyOk = policy === "quarantine" || policy === "reject";

	return {
		present: true,
		record,
		policy: policy || null,
		pct: Number.isFinite(pct) ? pct : null,
		enforced: policyOk && pctOk,
	};
}

export function httpsUrlIssue(
	url: string | null,
	label: string,
): { ok: boolean; detail: string; fix?: string } {
	if (!url) {
		return {
			ok: false,
			detail: `No ${label} URL is published.`,
			fix: `Add ${label === "logo" ? "l=" : "a="} with an HTTPS URL.`,
		};
	}

	let parsed: URL;
	try {
		parsed = new URL(url);
	} catch {
		return {
			ok: false,
			detail: `${label} URL is not a valid URL.`,
			fix: "Publish an absolute HTTPS URL.",
		};
	}

	if (parsed.protocol !== "https:") {
		return {
			ok: false,
			detail: `${label} URL must use HTTPS (got ${parsed.protocol}).`,
			fix: "Serve the file over HTTPS with a valid certificate.",
		};
	}

	return { ok: true, detail: `${label} URL is HTTPS.` };
}

export function overallVerdict(items: BimiCheckItem[]): CheckStatus {
	if (items.some((item) => item.status === "fail")) return "fail";
	if (items.some((item) => item.status === "warn")) return "warn";
	return "pass";
}
