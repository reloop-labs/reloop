const BASE_URL = (process.env.NEXT_PUBLIC_URL || "").trim().replace(/\/$/, "");

export class ToolsRequestError extends Error {
	constructor(
		message: string,
		readonly status?: number,
	) {
		super(message);
		this.name = "ToolsRequestError";
	}
}

export async function postToolsJson<T>(
	path: string,
	body: unknown,
	signal?: AbortSignal,
): Promise<T> {
	let response: Response;

	try {
		response = await fetch(`${BASE_URL}${path}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
			signal,
		});
	} catch (error) {
		if (error instanceof DOMException && error.name === "AbortError") {
			throw error;
		}
		throw new ToolsRequestError(
			"Could not reach the tools API. Check your connection and try again.",
		);
	}

	if (response.status === 429) {
		throw new ToolsRequestError(
			"Too many requests from this network. Wait a moment and try again.",
			429,
		);
	}

	if (!response.ok) {
		let detail: string | undefined;
		try {
			const payload = (await response.json()) as {
				why?: string;
				message?: string;
			};
			detail = payload.why || payload.message;
		} catch {
			// ignore
		}
		throw new ToolsRequestError(
			detail || "Something went wrong generating that record.",
			response.status,
		);
	}

	return (await response.json()) as T;
}
