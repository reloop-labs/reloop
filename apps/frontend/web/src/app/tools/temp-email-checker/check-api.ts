export type ApiSignalStatus = "pass" | "fail" | "warn" | "neutral";

export type ApiVerdict = "invalid" | "disposable" | "risky" | "deliverable";

export type ApiCheckResponse = {
	input: string;
	kind: "email" | "domain" | null;
	domain: string | null;
	unicodeDomain: string | null;
	verdict: ApiVerdict;
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
		syntax: ApiSignalStatus;
		disposable: ApiSignalStatus;
		role: ApiSignalStatus;
		freeProvider: ApiSignalStatus;
	};
};

const CHECK_URL = `${(process.env.NEXT_PUBLIC_URL || "").trim().replace(/\/$/, "")}/api/tool/v1/check`;

export class CheckRequestError extends Error {
	constructor(
		message: string,
		readonly status?: number,
	) {
		super(message);
		this.name = "CheckRequestError";
	}
}

export async function runCheck(
	input: string,
	signal?: AbortSignal,
): Promise<ApiCheckResponse> {
	let response: Response;

	try {
		response = await fetch(CHECK_URL, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ email: input }),
			signal,
		});
	} catch (error) {
		if (error instanceof DOMException && error.name === "AbortError")
			throw error;
		throw new CheckRequestError(
			"Could not reach the checker. Check your connection and try again.",
		);
	}

	if (response.status === 429) {
		throw new CheckRequestError(
			"You have run a lot of checks in a short window. Wait a moment and try again.",
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
		} catch {}
		throw new CheckRequestError(
			detail || "Something went wrong running that check.",
			response.status,
		);
	}

	return (await response.json()) as ApiCheckResponse;
}
