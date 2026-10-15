/**
 * Same-origin API fetch that always sends session cookies.
 * Plain `fetch()` defaults can drop auth on some inbox mutations and
 * surface `{ message: "Authentication required" }` from be-inbox.
 */
export function apiFetch(
	input: RequestInfo | URL,
	init?: RequestInit,
): Promise<Response> {
	return fetch(input, {
		...init,
		credentials: init?.credentials ?? "include",
	});
}

/**
 * Build a readable Error from a failed response. API errors are JSON
 * (`{ message, why, fix }`); never surface that raw body to users.
 */
export async function responseError(
	res: Response,
	fallback: string,
): Promise<Error> {
	const body = await res.text().catch(() => "");
	if (!body) return new Error(fallback);
	try {
		const parsed = JSON.parse(body) as {
			message?: unknown;
			why?: unknown;
			error?: { message?: unknown; why?: unknown } | unknown;
		};
		const nested =
			parsed.error && typeof parsed.error === "object"
				? (parsed.error as { message?: unknown; why?: unknown })
				: undefined;
		const pick = [parsed.why, parsed.message, nested?.why, nested?.message];
		const text = pick.find(
			(v): v is string => typeof v === "string" && v.trim().length > 0,
		);
		return new Error(text ?? fallback);
	} catch {
		// Plain-text bodies are fine to show; HTML error pages are not.
		return new Error(body.trimStart().startsWith("<") ? fallback : body);
	}
}
