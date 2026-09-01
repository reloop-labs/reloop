export interface LookalikeHit {
	name: string;
	unicodeName: string | null;
	trick: "tld" | "affix" | "typo" | "homoglyph";
	registered: boolean;
	mailCapable: boolean;
	mx: boolean;
	spf: boolean;
}

export interface LookalikeWatchReport {
	domain: string;
	registrableDomain: string;
	resolvedAt: string;
	responseTimeMs: number;
	verdict: "mail_twins" | "parked_twins" | "clear_scan";
	headline: string;
	summary: string;
	disclaimer: string;
	scanned: number;
	hits: LookalikeHit[];
	nextStep: {
		title: string;
		body: string;
		href: string;
	};
}

export async function runLookalikeWatch(
	domain: string,
	signal?: AbortSignal,
): Promise<LookalikeWatchReport> {
	const res = await fetch("/api/tools/v1/lookalike-watch", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ domain: domain.trim() }),
		signal,
	});

	if (!res.ok) {
		const err = await res.json().catch(() => null);
		throw new Error(
			err?.message || `Lookalike scan failed with status ${res.status}.`,
		);
	}

	return res.json();
}
