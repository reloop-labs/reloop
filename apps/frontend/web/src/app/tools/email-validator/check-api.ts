export type HealthSignalStatus = "pass" | "fail" | "warn" | "neutral";

export type HealthVerdict = "invalid" | "disposable" | "risky" | "deliverable";

export type EmailHealthState =
	| "deliverable"
	| "undeliverable"
	| "risky"
	| "unknown";

export type EmailHealthReason =
	| "accepted_email"
	| "rejected_email"
	| "no_mx_records"
	| "disposable_domain"
	| "invalid_syntax"
	| "role_based"
	| "low_deliverability";

export type EmailHealthAttributes = {
	free: boolean;
	role: boolean;
	disposable: boolean;
	acceptAll: boolean;
	tag: boolean;
	numericalCharacters: number;
	alphabeticalCharacters: number;
	unicodeSymbols: number;
	mailboxFull: boolean;
	noReply: boolean;
	secureEmailGateway: boolean;
};

export type EmailHealthMailServer = {
	smtpProvider: string | null;
	mxRecord: string | null;
	mxRecords: string[];
	implicitMxRecord: boolean;
	hasMx: boolean;
};

export type HealthPresentation = {
	status: "pass" | "fail" | "warn";
	summary: string;
	state: EmailHealthState;
	score: number;
	reason: EmailHealthReason;
	user: string;
	domain: string | null;
	tag: string | null;
	attributes: EmailHealthAttributes;
	mailServer: EmailHealthMailServer;
};

export type EmailHealthCheckResponse = {
	input: string;
	kind: "email" | "domain" | null;
	domain: string | null;
	unicodeDomain: string | null;
	verdict: HealthVerdict;
	isValidSyntax: boolean;
	syntaxFailure: string | null;
	isDisposable: boolean;
	disposableMatch: {
		kind: "exact" | "wildcard";
		domain: string;
		pattern?: string;
	} | null;
	isAllowlisted: boolean;
	isRoleAddress: boolean;
	isFreeProvider: boolean;
	signals: {
		syntax: HealthSignalStatus;
		disposable: HealthSignalStatus;
		role: HealthSignalStatus;
		freeProvider: HealthSignalStatus;
	};
	mxRecords: string[];
	confidence: number;
	riskScore: number;
	flags: string[];
	health: HealthPresentation;
};

export type BatchRowResult = {
	email: string;
	rowNumber: number;
	domain: string | null;
	verdict: HealthVerdict;
	isValidSyntax: boolean;
	isDisposable: boolean;
	isRoleAddress: boolean;
	isFreeProvider: boolean;
	mxRecords: string[];
	confidence: number;
	riskScore: number;
	flags: string[];
	health: HealthPresentation;
};

export type BatchSummary = {
	totalUploaded: number;
	totalUnique: number;
	duplicatesRemoved: number;
	deliverableCount: number;
	riskyCount: number;
	disposableCount: number;
	invalidCount: number;
	noMxCount: number;
	avgRiskScore: number;
	healthyPct: number;
};

export type BatchPollResponse = {
	token: string;
	status: "queued" | "running" | "done" | "failed";
	createdAt: string;
	completedAt: string | null;
	totalUploaded: number;
	totalUnique: number;
	duplicatesRemoved: number;
	results: BatchRowResult[];
	summary: BatchSummary | null;
	error: string | null;
};

const BASE_URL = (process.env.NEXT_PUBLIC_URL || "").trim().replace(/\/$/, "");
const SINGLE_URL = `${BASE_URL}/api/tools/v1/email-health-check`;
const BATCH_URL = `${BASE_URL}/api/tools/v1/email-health-check/batch`;

export class HealthCheckRequestError extends Error {
	constructor(
		message: string,
		readonly status?: number,
		readonly why?: string,
		readonly fix?: string,
	) {
		super(message);
		this.name = "HealthCheckRequestError";
	}
}

export async function runSingleHealthCheck(
	email: string,
	signal?: AbortSignal,
): Promise<EmailHealthCheckResponse> {
	let response: Response;
	try {
		response = await fetch(SINGLE_URL, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ email: email.trim() }),
			signal,
		});
	} catch (error) {
		if (error instanceof DOMException && error.name === "AbortError")
			throw error;
		throw new HealthCheckRequestError(
			"Could not connect to the health checker. Check your connection.",
		);
	}

	if (response.status === 429) {
		throw new HealthCheckRequestError(
			"Rate limit exceeded",
			429,
			"You have submitted too many requests in a short window.",
			"Wait a moment before submitting again.",
		);
	}

	if (!response.ok) {
		let why: string | undefined;
		let message = "Failed to evaluate email address.";
		let fix: string | undefined;
		try {
			const body = await response.json();
			why = body.why;
			message = body.message || message;
			fix = body.fix;
		} catch {}
		throw new HealthCheckRequestError(message, response.status, why, fix);
	}

	return (await response.json()) as EmailHealthCheckResponse;
}

export async function submitBatchHealthCheck(
	payload: { emails?: string[]; file?: File },
	signal?: AbortSignal,
): Promise<{ token: string; status: "queued"; pollUrl: string }> {
	let response: Response;

	try {
		if (payload.file) {
			const formData = new FormData();
			formData.append("file", payload.file);
			response = await fetch(BATCH_URL, {
				method: "POST",
				body: formData,
				signal,
			});
		} else {
			response = await fetch(BATCH_URL, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ emails: payload.emails || [] }),
				signal,
			});
		}
	} catch (error) {
		if (error instanceof DOMException && error.name === "AbortError")
			throw error;
		throw new HealthCheckRequestError(
			"Could not upload batch request. Check your connection.",
		);
	}

	if (response.status === 429) {
		throw new HealthCheckRequestError(
			"Batch rate limit exceeded",
			429,
			"You have reached the hourly batch limit (5 batch jobs per hour).",
			"Wait before submitting another batch file.",
		);
	}

	if (!response.ok) {
		let why: string | undefined;
		let message = "Failed to submit batch check.";
		let fix: string | undefined;
		try {
			const body = await response.json();
			why = body.why;
			message = body.message || message;
			fix = body.fix;
		} catch {}
		throw new HealthCheckRequestError(message, response.status, why, fix);
	}

	return (await response.json()) as {
		token: string;
		status: "queued";
		pollUrl: string;
	};
}

export async function pollBatchHealthCheck(
	token: string,
	signal?: AbortSignal,
): Promise<BatchPollResponse> {
	let response: Response;
	try {
		response = await fetch(`${BATCH_URL}/${encodeURIComponent(token)}`, {
			method: "GET",
			signal,
		});
	} catch (error) {
		if (error instanceof DOMException && error.name === "AbortError")
			throw error;
		throw new HealthCheckRequestError("Could not poll batch job status.");
	}

	if (!response.ok) {
		let message = "Batch job not found or expired.";
		try {
			const body = await response.json();
			message = body.message || message;
		} catch {}
		throw new HealthCheckRequestError(message, response.status);
	}

	return (await response.json()) as BatchPollResponse;
}
