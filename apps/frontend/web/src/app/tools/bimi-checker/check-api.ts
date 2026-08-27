export type CheckStatus = "pass" | "warn" | "fail";

export type BimiCheckItem = {
	id: string;
	label: string;
	status: CheckStatus;
	detail: string;
	record?: string;
	fix?: string;
};

export type BimiCheckResponse = {
	domain: string;
	queryName: string;
	verdict: CheckStatus;
	bimiRecord: string | null;
	logoUrl: string | null;
	authorityUrl: string | null;
	dmarcRecord: string | null;
	dmarcPolicy: string | null;
	dmarcPct: number | null;
	dmarcEnforced: boolean;
	logo: {
		fetched: boolean;
		contentType: string | null;
		tinyPsOk: boolean | null;
		issues: { status: CheckStatus; detail: string; fix?: string }[];
	};
	checks: BimiCheckItem[];
	recommendations: string[];
};

const BASE_URL = (process.env.NEXT_PUBLIC_URL || "").trim().replace(/\/$/, "");
const BIMI_CHECK_URL = `${BASE_URL}/api/tools/v1/bimi-check`;

export class BimiRequestError extends Error {
	constructor(
		message: string,
		readonly status?: number,
	) {
		super(message);
		this.name = "BimiRequestError";
	}
}

export async function runBimiCheck(
	domain: string,
	signal?: AbortSignal,
): Promise<BimiCheckResponse> {
	let response: Response;

	try {
		response = await fetch(BIMI_CHECK_URL, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ domain }),
			signal,
		});
	} catch (error) {
		if (error instanceof DOMException && error.name === "AbortError") {
			throw error;
		}
		throw new BimiRequestError(
			"Could not reach the BIMI checker. Check your connection and try again.",
		);
	}

	if (response.status === 429) {
		throw new BimiRequestError(
			"Too many checks from this network. Wait a moment and try again.",
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
		throw new BimiRequestError(
			detail || "Something went wrong running that check.",
			response.status,
		);
	}

	return (await response.json()) as BimiCheckResponse;
}
