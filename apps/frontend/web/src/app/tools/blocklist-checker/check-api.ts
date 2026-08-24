export type ListingStatus = "listed" | "not_listed" | "error" | "skipped";
export type BlocklistVerdict = "clean" | "listed" | "inconclusive";

export interface CheckedIp {
	ip: string;
	source: "input" | "spf";
	version: "ipv4" | "ipv6";
}

export interface DnsblCheckItemResult {
	id: string;
	name: string;
	host: string;
	listType: "ip" | "domain";
	category: "reputation" | "spam" | "malware" | "domain";
	impact: "high" | "medium" | "low";
	status: ListingStatus;
	isListed: boolean;
	responseCodes: string[];
	responseTimeMs: number;
	delistUrl: string;
	description: string;
	listedTargets: string[];
	txtRecord?: string;
	error?: string;
}

export interface BlocklistCheckResponse {
	target: string;
	inputType: "domain" | "ip";
	ipVersion: "ipv4" | "ipv6" | null;
	resolvedIp: string | null;
	hostname: string | null;
	checkedIps: CheckedIp[];
	spfIncludes: string[];
	spfRanges: string[];
	ipNote: string | null;
	verdict: BlocklistVerdict;
	isClean: boolean;
	totalChecked: number;
	listedCount: number;
	cleanCount: number;
	errorCount: number;
	skippedCount: number;
	scanDurationMs: number;
	results: DnsblCheckItemResult[];
	recommendations: string[];
}

const BASE_URL = (process.env.NEXT_PUBLIC_URL || "").trim().replace(/\/$/, "");
const BLOCKLIST_CHECK_URL = `${BASE_URL}/api/tools/v1/blocklist-check`;

export class BlocklistRequestError extends Error {
	constructor(
		message: string,
		readonly status?: number,
	) {
		super(message);
		this.name = "BlocklistRequestError";
	}
}

/**
 * Runs a DNSBL lookup against the tools service (via the Next.js BFF).
 */
export async function runBlocklistCheck(
	target: string,
	signal?: AbortSignal,
): Promise<BlocklistCheckResponse> {
	let response: Response;

	try {
		response = await fetch(BLOCKLIST_CHECK_URL, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ target }),
			signal,
		});
	} catch (error) {
		if (error instanceof DOMException && error.name === "AbortError") {
			throw error;
		}
		throw new BlocklistRequestError(
			"Could not reach the blocklist checker. Check your connection and try again.",
		);
	}

	if (response.status === 429) {
		throw new BlocklistRequestError(
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
				error?: string;
			};
			detail = body.why || body.message || body.error;
		} catch {
			// ignore parse failures
		}
		throw new BlocklistRequestError(
			detail || "Something went wrong running that check.",
			response.status,
		);
	}

	return (await response.json()) as BlocklistCheckResponse;
}
