export interface DnsblCheckItemResult {
	id: string;
	name: string;
	host: string;
	category: "reputation" | "spam" | "phishing" | "malware" | "open_relay";
	isListed: boolean;
	responseCodes: string[];
	responseTimeMs: number;
	delistUrl: string;
	description: string;
	error?: string;
}

export interface BlocklistCheckResponse {
	target: string;
	inputType: "domain" | "ip";
	resolvedIp: string | null;
	hostname: string | null;
	isClean: boolean;
	totalChecked: number;
	listedCount: number;
	cleanCount: number;
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
 * Executes a live DNSBL blocklist scan against the backend tools service.
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
		// Fallback to local Next.js route
		try {
			response = await fetch("/api/tools/v1/blocklist-check", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ target }),
				signal,
			});
		} catch (innerError) {
			if (innerError instanceof DOMException && innerError.name === "AbortError") {
				throw innerError;
			}
			throw new BlocklistRequestError(
				"Could not connect to the blocklist verification service. Check your connection.",
			);
		}
	}

	if (!response.ok) {
		const json = await response.json().catch(() => ({}));
		throw new BlocklistRequestError(
			json.error || `Scan returned status ${response.status}`,
			response.status,
		);
	}

	return (await response.json()) as BlocklistCheckResponse;
}
