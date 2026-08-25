export type CheckStatus = "pass" | "warn" | "fail" | "info";

export interface CheckItem {
	id: string;
	title: string;
	mark: number;
	status: CheckStatus;
	description: string;
	details?: string[];
	recommendations?: string[];
}

export interface CategoryResult {
	id: "signature" | "blacklists" | "content" | "body" | "links";
	title: string;
	mark: number;
	status: CheckStatus;
	items: CheckItem[];
}

export interface DeliverabilityReport {
	score: number;
	grade: string;
	verdict: "inbox_ready" | "needs_review" | "high_risk";
	verdictLabel: string;
	summary: string;
	receivedAt: string;
	from: {
		address: string;
		name?: string;
		domain: string;
	};
	to: {
		address: string;
		name?: string;
	};
	subject: string;
	messageId: string | null;
	connectingIp: string | null;
	headers: Record<string, string>;
	categories: {
		signature: CategoryResult;
		blacklists: CategoryResult;
		content: CategoryResult;
		body: CategoryResult;
		links: CategoryResult;
	};
	preview?: {
		text?: string;
		htmlSnippet?: string;
		hasHtml: boolean;
		hasText: boolean;
		hasAttachments: boolean;
		attachmentCount: number;
	};
}

export type SessionStatus = "pending" | "received" | "expired" | "error";

export interface DeliverabilitySessionResponse {
	token: string;
	address: string;
	status: SessionStatus;
	createdAt: string;
	expiresAt: string;
	report?: DeliverabilityReport;
	error?: string;
}

export interface CreateSessionResponse {
	token: string;
	address: string;
	expiresAt: string;
	pollUrl: string;
}

const BASE_URL = (process.env.NEXT_PUBLIC_URL || "").trim().replace(/\/$/, "");
const DELIVERABILITY_TEST_URL = `${BASE_URL}/api/tools/v1/deliverability-test`;

export async function createDeliverabilitySession(): Promise<CreateSessionResponse> {
	const resp = await fetch(DELIVERABILITY_TEST_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (!resp.ok) {
		const err = await resp.json().catch(() => ({}));
		throw new Error(
			err.message || `Failed to create test session (HTTP ${resp.status})`,
		);
	}

	return await resp.json();
}

export async function pollDeliverabilitySession(
	token: string,
): Promise<DeliverabilitySessionResponse> {
	const resp = await fetch(
		`${DELIVERABILITY_TEST_URL}/${encodeURIComponent(token)}`,
		{
			headers: {
				Accept: "application/json",
			},
			cache: "no-store",
		},
	);

	if (!resp.ok) {
		const err = await resp.json().catch(() => ({}));
		throw new Error(
			err.message || `Failed to check test session (HTTP ${resp.status})`,
		);
	}

	return await resp.json();
}

export async function injectTestMime(
	rawMime: string,
): Promise<{ success: boolean; token?: string; error?: string }> {
	const resp = await fetch(`${DELIVERABILITY_TEST_URL}/inject`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ rawMime }),
	});

	return await resp.json();
}
