export type CheckStatus = "pass" | "warn" | "fail" | "info";
export type ReputationGrade = "A+" | "A" | "B" | "C" | "D" | "F";
export type ReputationVerdict = "excellent" | "good" | "fair" | "poor" | "critical";

export type CategoryResult = {
	score: number;
	weight: number;
	status: "pass" | "warn" | "fail";
	summary: string;
};

export type ReputationCheck = {
	id: string;
	category: "authentication" | "blocklist" | "domain_age" | "dns_health";
	label: string;
	status: CheckStatus;
	detail: string;
	record?: string;
};

export type DomainReputationResponse = {
	domain: string;
	resolvedAt: string;
	responseTimeMs: number;
	score: number;
	grade: ReputationGrade;
	verdict: ReputationVerdict;
	verdictLabel: string;
	breakdown: {
		authentication: CategoryResult;
		blocklist: CategoryResult;
		domainAge: CategoryResult;
		dnsHealth: CategoryResult;
	};
	details: {
		authentication: {
			spf: { exists: boolean; record?: string; qualifier?: string; status: "pass" | "warn" | "fail"; detail: string };
			dkim: { detected: boolean; selector?: string; record?: string; status: "pass" | "warn" | "fail"; detail: string };
			dmarc: { exists: boolean; record?: string; policy?: string; pct?: number; status: "pass" | "warn" | "fail"; detail: string };
		};
		blocklist: {
			cleanCount: number;
			listedCount: number;
			totalChecked: number;
			listings: Array<{ zone: string; name: string; listed: boolean; returnCode?: string }>;
		};
		domainAge: {
			ageDays?: number;
			createdDate?: string;
			expiryDate?: string;
			registrar?: string;
			tier: "mature" | "established" | "warming" | "young" | "new" | "unknown";
			detail: string;
		};
		dnsHealth: {
			mxRecords: Array<{ exchange: string; priority: number }>;
			aRecords: string[];
			nsRecords: string[];
			hasPtr: boolean;
			sslValid: boolean;
			sslDaysRemaining?: number;
			sslIssuer?: string;
		};
	};
	checks: ReputationCheck[];
	recommendations: string[];
};

const BASE_URL = (process.env.NEXT_PUBLIC_URL || "").trim().replace(/\/$/, "");
const REPUTATION_CHECK_URL = `${BASE_URL}/api/tools/v1/domain-reputation`;

export class ReputationRequestError extends Error {
	constructor(
		message: string,
		readonly status?: number,
	) {
		super(message);
		this.name = "ReputationRequestError";
	}
}

export async function runDomainReputationCheck(
	domain: string,
	signal?: AbortSignal,
): Promise<DomainReputationResponse> {
	let response: Response;

	try {
		response = await fetch(REPUTATION_CHECK_URL, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ domain }),
			signal,
		});
	} catch (error) {
		if (error instanceof DOMException && error.name === "AbortError") {
			throw error;
		}
		throw new ReputationRequestError(
			"Could not connect to the reputation service. Check your connection and try again.",
		);
	}

	if (response.status === 429) {
		throw new ReputationRequestError(
			"Rate limit exceeded. Please wait a moment before querying another domain.",
			429,
		);
	}

	if (!response.ok) {
		let detail: string | undefined;
		try {
			const body = (await response.json()) as {
				why?: string;
				message?: string;
			};
			detail = body.why || body.message;
		} catch {
			// ignore
		}
		throw new ReputationRequestError(
			detail || "Failed to inspect domain reputation.",
			response.status,
		);
	}

	return (await response.json()) as DomainReputationResponse;
}
