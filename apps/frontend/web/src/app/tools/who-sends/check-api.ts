export interface SenderEvidence {
	type:
		| "spf_include"
		| "nested_spf_include"
		| "dkim_selector"
		| "mx_host"
		| "ip4"
		| "ip6";
	value: string;
}

export interface SenderItem {
	vendor: string;
	role: "inbox_and_send" | "inbox_only" | "send" | "dkim_only";
	confidence: "high" | "medium" | "low";
	leftover: boolean;
	evidence: SenderEvidence[];
}

export interface InboxInfo {
	provider: string | null;
	exchanges: string[];
}

export interface UnnamedSenders {
	ip4: string[];
	ip6: string[];
	includes: string[];
}

export interface WhoSendsNextStep {
	title: string;
	body: string;
	href: string;
}

export interface WhoSendsReport {
	domain: string;
	resolvedAt: string;
	responseTimeMs: number;
	verdict:
		| "single_stack"
		| "split_stack"
		| "crowded"
		| "send_only"
		| "opaque"
		| "unpublished"
		| "wide_open";
	headline: string;
	summary: string;
	disclaimer: string;
	inbox: InboxInfo;
	senders: SenderItem[];
	unnamed: UnnamedSenders;
	spf: {
		published: boolean;
		qualifier: string | null;
		lookupCount: number;
		rawRecord: string | null;
	};
	nextStep: WhoSendsNextStep;
	subdomainNote?: string | null;
}

export async function runWhoSends(
	domain: string,
	signal?: AbortSignal,
): Promise<WhoSendsReport> {
	const res = await fetch("/api/tools/v1/who-sends", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ domain: domain.trim() }),
		signal,
	});

	if (!res.ok) {
		const err = await res.json().catch(() => null);
		throw new Error(
			err?.message || `Sender fingerprint failed with status ${res.status}.`,
		);
	}

	return res.json();
}
