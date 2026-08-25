export type CheckStatus = "pass" | "warn" | "fail" | "info";

export type CategoryId =
	| "signature"
	| "blacklists"
	| "content"
	| "body"
	| "links";

export interface CheckItem {
	id: string;
	title: string;
	mark: number; // 0 for pass/info, negative number (e.g. -1.0) for penalty
	status: CheckStatus;
	description: string;
	details?: string[];
	recommendations?: string[];
}

export interface CategoryResult {
	id: CategoryId;
	title: string;
	mark: number; // Total mark deduction for category (<= 0)
	status: CheckStatus;
	items: CheckItem[];
}

export interface DeliverabilityReport {
	score: number; // 0.0 to 10.0
	grade: string; // 'A+', 'A', 'B', 'C', 'D', 'F'
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

export interface DeliverabilitySession {
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

export interface GetSessionResponse {
	token: string;
	address: string;
	status: SessionStatus;
	createdAt: string;
	expiresAt: string;
	report?: DeliverabilityReport;
	error?: string;
}
