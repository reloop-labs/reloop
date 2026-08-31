export interface AuthSpfResult {
	status: "pass" | "warn" | "fail" | "info";
	published: boolean;
	rawRecord: string | null;
	qualifier: string | null;
	lookupCount: number;
	mechanisms: string[];
	includes: string[];
	ip4: string[];
	ip6: string[];
	warnings: string[];
}

export interface AuthDkimResult {
	status: "pass" | "warn" | "fail" | "info";
	published: boolean;
	selector: string | null;
	rawRecord: string | null;
	publicKey: string | null;
	keyLength: number | null;
	algorithm: string | null;
	testedSelectors: string[];
	warnings: string[];
}

export interface AuthDmarcResult {
	status: "pass" | "warn" | "fail" | "info";
	published: boolean;
	rawRecord: string | null;
	policy: string | null;
	subdomainPolicy: string | null;
	percentage: number | null;
	rua: string[];
	ruf: string[];
	dkimAlignment: string | null;
	spfAlignment: string | null;
	warnings: string[];
}

export interface AuthMxResult {
	status: "pass" | "warn" | "fail" | "info";
	published: boolean;
	provider: string | null;
	records: Array<{ exchange: string; priority: number }>;
	warnings: string[];
}

export interface AuthBimiResult {
	status: "pass" | "warn" | "fail" | "info";
	published: boolean;
	rawRecord: string | null;
	svgUrl: string | null;
	vmcUrl: string | null;
}

export interface AuthMtaStsResult {
	status: "pass" | "warn" | "fail" | "info";
	published: boolean;
	rawRecord: string | null;
	mode: string | null;
}

export interface AuthDiagnosticCheck {
	id: string;
	name: string;
	category: "spf" | "dkim" | "dmarc" | "mx" | "security";
	status: "pass" | "warn" | "fail" | "info";
	message: string;
	details?: string;
}

export interface DomainAuthReport {
	domain: string;
	resolvedAt: string;
	responseTimeMs: number;
	score: number;
	grade: string;
	verdict: "fully_aligned" | "partially_aligned" | "misconfigured" | "vulnerable";
	verdictLabel: string;
	spf: AuthSpfResult;
	dkim: AuthDkimResult;
	dmarc: AuthDmarcResult;
	mx: AuthMxResult;
	bimi: AuthBimiResult;
	mtaSts: AuthMtaStsResult;
	diagnostics: AuthDiagnosticCheck[];
}

export async function runAuthCheck(
	domain: string,
	selector?: string,
	signal?: AbortSignal,
): Promise<DomainAuthReport> {
	const res = await fetch("/api/tools/v1/auth-checker", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			domain: domain.trim(),
			selector: selector?.trim() || undefined,
		}),
		signal,
	});

	if (!res.ok) {
		const err = await res.json().catch(() => null);
		throw new Error(
			err?.message || `Authentication check failed (HTTP ${res.status}).`,
		);
	}

	return res.json();
}
