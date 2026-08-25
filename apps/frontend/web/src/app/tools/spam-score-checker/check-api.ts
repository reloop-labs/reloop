export type TriggerCategory =
	| "urgency"
	| "shady"
	| "overpromise"
	| "money"
	| "outreach";

export interface DetectedTrigger {
	word: string;
	originalMatch: string;
	category: TriggerCategory;
	categoryLabel: string;
	severity: "high" | "medium" | "low";
	startIndex: number;
	endIndex: number;
	context: "subject" | "body";
}

export interface SpamIssue {
	category: "trigger_word" | "subject" | "link" | "formatting" | "compliance";
	severity: "high" | "medium" | "low";
	title: string;
	detail: string;
	recommendation?: string;
}

export interface SpamCheckResponse {
	score: number;
	grade: string;
	verdict: "inbox_ready" | "needs_review" | "high_risk";
	verdictLabel: string;
	breakdown: {
		subjectScore: number;
		contentScore: number;
		linkScore: number;
		formattingScore: number;
	};
	metrics: {
		wordCount: number;
		charCount: number;
		subjectLength: number;
		linkCount: number;
		triggerWordCount: number;
		capsPercentage: number;
		readingTimeSec: number;
	};
	categoryCounts: Record<TriggerCategory, number>;
	detectedTriggers: DetectedTrigger[];
	issues: SpamIssue[];
	recommendations: string[];
}

export const CATEGORY_META: Record<
	TriggerCategory,
	{ label: string; icon: string }
> = {
	urgency: { label: "Urgency", icon: "alert-triangle" },
	shady: { label: "Shady", icon: "shield-cross" },
	overpromise: { label: "Overpromise", icon: "sparkles" },
	money: { label: "Financial & Money", icon: "lock" },
	outreach: { label: "Cold Outreach", icon: "user-circle" },
};

const getApiUrl = (path: string) => {
	if (typeof window !== "undefined") {
		return path;
	}
	const base = (process.env.NEXT_PUBLIC_URL || "").trim().replace(/\/$/, "");
	return `${base}${path}`;
};

const SPAM_CHECK_URL = getApiUrl("/api/tools/v1/spam-check");
const SPAM_REWRITE_URL = getApiUrl("/api/tools/v1/spam-check/rewrite");

export const INITIAL_EMPTY_RESPONSE: SpamCheckResponse = {
	score: 100,
	grade: "A+",
	verdict: "inbox_ready",
	verdictLabel: "Inbox Ready",
	breakdown: {
		subjectScore: 25,
		contentScore: 35,
		linkScore: 20,
		formattingScore: 20,
	},
	metrics: {
		wordCount: 0,
		charCount: 0,
		subjectLength: 0,
		linkCount: 0,
		triggerWordCount: 0,
		capsPercentage: 0,
		readingTimeSec: 0,
	},
	categoryCounts: {
		urgency: 0,
		shady: 0,
		overpromise: 0,
		money: 0,
		outreach: 0,
	},
	detectedTriggers: [],
	issues: [],
	recommendations: [
		"Type or paste your subject and email copy to check your spam score.",
	],
};

export class SpamCheckRequestError extends Error {
	constructor(
		message: string,
		readonly status?: number,
		readonly why?: string,
	) {
		super(message);
		this.name = "SpamCheckRequestError";
	}
}

/**
 * Runs spam check against backend API.
 */
export async function runSpamCheck(
	subject: string,
	body: string,
	signal?: AbortSignal,
): Promise<SpamCheckResponse> {
	const trimmedSubject = (subject || "").trim();
	const trimmedBody = (body || "").trim();

	if (!trimmedSubject && !trimmedBody) {
		return INITIAL_EMPTY_RESPONSE;
	}

	try {
		const res = await fetch(SPAM_CHECK_URL, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				subject: trimmedSubject,
				body: trimmedBody,
			}),
			signal,
		});

		if (!res.ok) {
			let detail: string | undefined;
			try {
				const errorData = await res.json();
				detail = errorData.why || errorData.message;
			} catch {}
			throw new SpamCheckRequestError(
				detail || `Backend returned status ${res.status}`,
				res.status,
				detail,
			);
		}

		return (await res.json()) as SpamCheckResponse;
	} catch (err: unknown) {
		if (err instanceof DOMException && err.name === "AbortError") {
			throw err;
		}
		if (err instanceof SpamCheckRequestError) {
			throw err;
		}
		throw new SpamCheckRequestError(
			"Could not reach spam check API. Please check your connection and try again.",
		);
	}
}

/**
 * Calls backend AI rewrite endpoint.
 */
export async function rewriteSpamWithAi(
	subject: string,
	body: string,
): Promise<{ subject: string; body: string }> {
	const res = await fetch(SPAM_REWRITE_URL, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			subject: (subject || "").trim(),
			body: (body || "").trim(),
		}),
	});

	if (!res.ok) {
		let detail: string | undefined;
		try {
			const errorData = await res.json();
			detail = errorData.why || errorData.message;
		} catch {}
		throw new Error(
			detail || "AI rewrite failed. Please check the service and try again.",
		);
	}

	const data = (await res.json()) as {
		subject?: string;
		body?: string;
	};

	return {
		subject: data.subject || subject,
		body: data.body || body,
	};
}
