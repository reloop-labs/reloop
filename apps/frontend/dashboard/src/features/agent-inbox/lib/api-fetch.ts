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
