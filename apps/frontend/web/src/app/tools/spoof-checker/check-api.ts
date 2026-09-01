export interface SpoofReason {
	id: string;
	severity: "critical" | "warning" | "info" | "success";
	title: string;
	detail: string;
}

export interface SpoofNextStep {
	title: string;
	body: string;
	href: string;
}

export interface SpoofCheckResult {
	domain: string;
	resolvedAt: string;
	responseTimeMs: number;
	spoofable: boolean;
	verdict: "spoofable" | "partially_protected" | "protected";
	headline: string;
	summary: string;
	inboxOutcome: "delivered" | "spam" | "rejected";
	dmarc: {
		published: boolean;
		policy: string | null;
		subdomainPolicy: string | null;
		percentage: number | null;
		rawRecord: string | null;
	};
	spf: {
		published: boolean;
		qualifier: string | null;
		lookupCount: number;
		rawRecord: string | null;
	};
	dkim: {
		published: boolean;
		selector: string | null;
		keyLength: number | null;
	};
	mx: {
		published: boolean;
		provider: string | null;
	};
	reasons: SpoofReason[];
	nextStep: SpoofNextStep;
	subdomainNote?: string | null;
}

export async function runSpoofCheck(
	domain: string,
	signal?: AbortSignal,
): Promise<SpoofCheckResult> {
	const res = await fetch("/api/tools/v1/spoof-checker", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ domain: domain.trim() }),
		signal,
	});

	if (!res.ok) {
		const err = await res.json().catch(() => null);
		throw new Error(
			err?.message || `Spoof check failed with status ${res.status}.`,
		);
	}

	return res.json();
}
