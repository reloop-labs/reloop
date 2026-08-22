import { createError } from "evlog";
import { useLogger } from "evlog/elysia";
import { inboxConfig } from "../../inbox.config";

interface ProxyWebhookRequest {
	method: string;
	path: string;
	query?: string;
	body?: unknown;
	apiKey?: string;
	cookie?: string;
}

function getLog() {
	try {
		return useLogger();
	} catch {
		return {
			info: (msg: string) => console.log(msg),
			error: (msg: string) => console.error(msg),
		};
	}
}

/**
 * Proxies an authenticated request to the webhook service.
 *
 * Security: callers must have already passed authMiddleware (`auth: true`),
 * so a logged-in user (session or API key) is guaranteed. The user's own
 * credentials are forwarded downstream — internal-secret fallback is NOT
 * accepted because the webhook service's `auth` macro is session-or-API-key
 * only and enforces organization scoping on the forwarded credential.
 */
export async function proxyToWebhookService({
	method,
	path,
	query,
	body,
	apiKey,
	cookie,
}: ProxyWebhookRequest): Promise<unknown> {
	const log = getLog();

	if (!apiKey && !cookie) {
		throw createError({
			status: 401,
			message: "Authentication required",
			why: "A signed-in user session or API key is required to manage webhooks",
			fix: "Sign in or provide a valid x-api-key header",
		});
	}

	const url = `${inboxConfig.BASE_URL}/api/webhook${path}${query ? `?${query}` : ""}`;
	log.info(`[INBOX] Proxying webhook management call to ${method} ${url}`);

	const headers: Record<string, string> = {
		"Content-Type": "application/json",
		// Webhook service requires a non-empty User-Agent (requireUserAgentPlugin).
		"User-Agent": "ReloopInbox/1.0",
	};

	if (apiKey) {
		headers["x-api-key"] = apiKey;
	}

	if (cookie) {
		headers.cookie = cookie;
	}

	const response = await fetch(url, {
		method,
		headers,
		body: body === undefined ? undefined : JSON.stringify(body),
	});

	const text = await response.text();

	if (!response.ok) {
		log.error(`[INBOX] Webhook service error: ${response.status} ${text}`);
		let why = `Webhook service returned ${response.status}`;
		try {
			const parsed = JSON.parse(text) as { message?: string; why?: string };
			why = parsed.why || parsed.message || why;
		} catch {
			if (text) why = text.slice(0, 500);
		}
		throw createError({
			status: response.status as 500,
			message: why,
			why,
			fix: "Check webhook service logs for details",
		});
	}

	if (!text) return {};

	try {
		return JSON.parse(text);
	} catch {
		log.error(
			`[INBOX] Webhook service returned invalid JSON: ${text.slice(0, 200)}`,
		);
		throw createError({
			status: 502,
			message: "Invalid response from webhook service",
			why: "The webhook service returned malformed JSON",
			fix: "Retry the request",
		});
	}
}
