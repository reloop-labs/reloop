/**
 * spam-check.ts — one outbound spam verdict for every send path.
 *
 * Combines the internal pattern scorer (outbound-abuse.ts) with an Rspamd
 * scan of the outgoing message. Mail API, SMTP (log-incoming) and the admin
 * spam-check endpoint all call checkOutboundSpam, so a message gets the same
 * verdict however it was submitted.
 *
 * Fail-open on Rspamd outages: a down scanner degrades to the internal
 * scorer alone rather than taking down all mail (same contract as
 * reputation-guard.ts).
 */

import { type OutboundAbuseScore, scoreOutboundAbuse } from "./outbound-abuse";

export type SpamVerdict = "allow" | "flag" | "block";

export interface RspamdResult {
	score: number;
	action: string;
	/** Positive-scoring symbols, highest first. */
	symbols: Array<{ name: string; score: number }>;
}

export interface SpamCheckInput {
	organizationId?: string;
	from?: string;
	to?: string | string[];
	cc?: string | string[];
	bcc?: string | string[];
	subject?: string;
	text?: string;
	html?: string;
	/** Full RFC 5322 message (SMTP path). Scanned as-is instead of rebuilt. */
	rawMessage?: string;
}

export interface SpamCheckResult {
	verdict: SpamVerdict;
	/** Bus/Slack severity: block → high, flag → medium. */
	severity: "none" | "medium" | "high";
	reasons: string[];
	internal: OutboundAbuseScore;
	/** null when Rspamd was skipped, disabled, or unreachable. */
	rspamd: RspamdResult | null;
}

export interface SpamCheckDeps {
	fetch?: typeof fetch;
	rspamdUrl?: string | null;
	timeoutMs?: number;
}

export const SPAM_THRESHOLDS = {
	rspamdBlock: Number(process.env.RSPAMD_OUTBOUND_BLOCK_SCORE ?? "15"),
	rspamdFlag: Number(process.env.RSPAMD_OUTBOUND_FLAG_SCORE ?? "6"),
} as const;

const DEFAULT_RSPAMD_URL = "http://reloop-spam:11333/checkv2";
const DEFAULT_TIMEOUT_MS = 1500;
const MAX_SYMBOLS = 10;

/**
 * Outbound scanning is on unless RSPAMD_OUTBOUND_DISABLED=true. Reuses the
 * inbound KUMOMTA_RSPAMD_URL that every install (Coolify, CapRover, compose)
 * already sets for backends, so no new env is needed to turn it on.
 */
export function outboundRspamdUrl(): string | null {
	if (process.env.RSPAMD_OUTBOUND_DISABLED === "true") return null;
	return (
		process.env.RSPAMD_URL ||
		process.env.KUMOMTA_RSPAMD_URL ||
		DEFAULT_RSPAMD_URL
	);
}

function asList(value: string | string[] | undefined): string[] {
	if (!value) return [];
	return (Array.isArray(value) ? value : [value])
		.map((s) => s.trim())
		.filter(Boolean);
}

/** "Acme <billing@acme.com>" → "billing@acme.com" */
function bareAddress(value: string): string {
	const angle = value.match(/<([^>]+)>/);
	return stripHeaderBreaks(angle?.[1] ?? value).trim();
}

function stripHeaderBreaks(value: string): string {
	return value.replace(/[\r\n]+/g, " ");
}

/**
 * Minimal RFC 5322 message for scanning. Date and Message-ID are included so
 * Rspamd does not add MISSING_DATE / MISSING_MID points the real send (which
 * KumoMTA stamps) would never carry. Bcc is never written as a header.
 */
export function buildScanMessage(input: SpamCheckInput): string {
	const boundary = "reloop-spam-scan";
	const headers = [
		`From: ${stripHeaderBreaks(input.from ?? "")}`,
		`To: ${stripHeaderBreaks(asList(input.to).join(", "))}`,
		...(asList(input.cc).length > 0
			? [`Cc: ${stripHeaderBreaks(asList(input.cc).join(", "))}`]
			: []),
		`Subject: ${stripHeaderBreaks(input.subject ?? "")}`,
		`Date: ${new Date().toUTCString()}`,
		`Message-ID: <spam-scan-${Date.now()}@reloop.sh>`,
		"MIME-Version: 1.0",
	];

	const text = input.text ?? "";
	const html = input.html ?? "";
	if (text && html) {
		return [
			...headers,
			`Content-Type: multipart/alternative; boundary="${boundary}"`,
			"",
			`--${boundary}`,
			"Content-Type: text/plain; charset=utf-8",
			"",
			text,
			`--${boundary}`,
			"Content-Type: text/html; charset=utf-8",
			"",
			html,
			`--${boundary}--`,
			"",
		].join("\r\n");
	}
	return [
		...headers,
		`Content-Type: ${html ? "text/html" : "text/plain"}; charset=utf-8`,
		"",
		html || text,
		"",
	].join("\r\n");
}

/** POST a message to Rspamd /checkv2. Returns null on any failure. */
export async function scanWithRspamd(
	message: string,
	{ organizationId, from }: { organizationId?: string; from?: string },
	deps: SpamCheckDeps = {},
): Promise<RspamdResult | null> {
	const url =
		deps.rspamdUrl === undefined ? outboundRspamdUrl() : deps.rspamdUrl;
	if (!url) return null;
	const doFetch = deps.fetch ?? fetch;

	const headers: Record<string, string> = { "Content-Type": "text/plain" };
	// User marks the message as authenticated submission, so Rspamd skips
	// inbound-only checks (SPF of our own relay IP, greylisting).
	if (organizationId) headers.User = organizationId;
	const envelopeFrom = from ? bareAddress(from) : "";
	if (envelopeFrom) headers.From = envelopeFrom;

	try {
		const res = await doFetch(url, {
			method: "POST",
			headers,
			body: message,
			signal: AbortSignal.timeout(deps.timeoutMs ?? DEFAULT_TIMEOUT_MS),
		});
		if (!res.ok) return null;
		const data = (await res.json()) as {
			score?: unknown;
			action?: unknown;
			symbols?: Record<string, { score?: unknown }>;
		};
		if (typeof data.score !== "number") return null;
		const symbols = Object.entries(data.symbols ?? {})
			.map(([name, s]) => ({ name, score: Number(s?.score ?? 0) }))
			.filter((s) => s.score > 0)
			.sort((a, b) => b.score - a.score)
			.slice(0, MAX_SYMBOLS);
		return {
			score: data.score,
			action: typeof data.action === "string" ? data.action : "no action",
			symbols,
		};
	} catch {
		return null;
	}
}

/** Pure: merge internal + Rspamd signals into one verdict. */
export function combineSpamVerdict(
	internal: OutboundAbuseScore,
	rspamd: RspamdResult | null,
	thresholds: { rspamdBlock: number; rspamdFlag: number } = SPAM_THRESHOLDS,
): Pick<SpamCheckResult, "verdict" | "severity" | "reasons"> {
	const reasons = [...internal.reasons];
	const rspamdScore = rspamd?.score ?? null;
	const rspamdBlocks =
		rspamdScore !== null && rspamdScore >= thresholds.rspamdBlock;
	const rspamdFlags =
		rspamdScore !== null && rspamdScore >= thresholds.rspamdFlag;

	if (rspamd && rspamdFlags) {
		reasons.push(`rspamd_score:${rspamd.score.toFixed(1)}`);
		reasons.push(...rspamd.symbols.slice(0, 5).map((s) => `rspamd:${s.name}`));
	}

	if (internal.severity === "high" || rspamdBlocks) {
		return { verdict: "block", severity: "high", reasons };
	}
	if (internal.severity === "medium" || rspamdFlags) {
		return { verdict: "flag", severity: "medium", reasons };
	}
	return { verdict: "allow", severity: "none", reasons: [] };
}

export async function checkOutboundSpam(
	input: SpamCheckInput,
	deps: SpamCheckDeps = {},
): Promise<SpamCheckResult> {
	const internal = scoreOutboundAbuse(input);
	// Already a hard block — skip the network round-trip.
	if (internal.severity === "high") {
		return {
			...combineSpamVerdict(internal, null),
			internal,
			rspamd: null,
		};
	}

	const rspamd = await scanWithRspamd(
		input.rawMessage || buildScanMessage(input),
		{ organizationId: input.organizationId, from: input.from },
		deps,
	);
	return { ...combineSpamVerdict(internal, rspamd), internal, rspamd };
}
