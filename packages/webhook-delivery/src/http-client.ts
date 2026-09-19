import http from "node:http";
import https from "node:https";
import { URL } from "node:url";
import { WEBHOOK_HTTP_TIMEOUT_MS } from "./constants";
import {
	type ResolvedTarget,
	resolvePublicTarget,
	SsrfBlockedError,
} from "./ssrf";

export type WebhookHttpResult = {
	status: number;
	headers: Record<string, string>;
	body: string;
	bodyBuffer: Buffer;
	durationMs: number;
	resolved: ResolvedTarget;
};

export type WebhookHttpError = {
	kind: "ssrf" | "network" | "timeout";
	message: string;
	durationMs: number;
	resolved?: ResolvedTarget;
};

export type PinnedRequestInput = {
	url: string;
	method?: "GET" | "HEAD" | "POST";
	headers?: Record<string, string>;
	body?: string;
	timeoutMs?: number;
	allowHttp?: boolean;
	allowPrivate?: boolean;
	maxBytes?: number;
};

export type PinnedTransport = (
	input: PinnedRequestInput,
) => Promise<WebhookHttpResult>;

export async function requestPinned(
	input: PinnedRequestInput,
): Promise<WebhookHttpResult> {
	const timeoutMs = input.timeoutMs ?? WEBHOOK_HTTP_TIMEOUT_MS;
	const method = input.method ?? "GET";
	const start = Date.now();

	let parsed: URL;
	try {
		parsed = new URL(input.url);
	} catch {
		throw Object.assign(new Error("Invalid URL"), {
			kind: "network" as const,
			durationMs: Date.now() - start,
		});
	}

	if (
		parsed.protocol !== "https:" &&
		!(input.allowHttp && parsed.protocol === "http:")
	) {
		const err: WebhookHttpError = {
			kind: "ssrf",
			message: "Only HTTPS URLs are allowed",
			durationMs: Date.now() - start,
		};
		throw Object.assign(new Error(err.message), err);
	}

	let resolved: ResolvedTarget;
	try {
		resolved = await resolvePublicTarget(parsed.hostname, {
			allowPrivate: input.allowPrivate,
		});
	} catch (e) {
		const message =
			e instanceof SsrfBlockedError
				? e.message
				: e instanceof Error
					? e.message
					: String(e);
		const err: WebhookHttpError = {
			kind: "ssrf",
			message,
			durationMs: Date.now() - start,
		};
		throw Object.assign(new Error(message), err);
	}

	const lib = parsed.protocol === "https:" ? https : http;
	const port =
		parsed.port !== ""
			? Number(parsed.port)
			: parsed.protocol === "https:"
				? 443
				: 80;
	const body = input.body ?? "";

	return new Promise<WebhookHttpResult>((resolve, reject) => {
		const req = lib.request(
			{
				protocol: parsed.protocol,
				hostname: resolved.pinnedIp,
				port,
				path: `${parsed.pathname}${parsed.search}`,
				method,
				headers: {
					...input.headers,
					Host: parsed.host,
					...(method === "POST"
						? { "Content-Length": Buffer.byteLength(body) }
						: {}),
				},
				// Pin DNS to the IP we already validated (anti rebinding).
				lookup: (_hostname, _options, callback) => {
					callback(null, resolved.pinnedIp, resolved.family);
				},
				// TLS SNI must be the original hostname, not the IP.
				servername: parsed.hostname,
				timeout: timeoutMs,
			},
			(res) => {
				const chunks: Buffer[] = [];
				let total = 0;
				res.on("data", (chunk: Buffer) => {
					total += chunk.byteLength;
					if (input.maxBytes !== undefined && total > input.maxBytes) {
						const err: WebhookHttpError = {
							kind: "network",
							message: `Response exceeds ${input.maxBytes} bytes`,
							durationMs: Date.now() - start,
							resolved,
						};
						reject(Object.assign(new Error(err.message), err));
						res.destroy();
						return;
					}
					chunks.push(chunk);
				});
				res.on("end", () => {
					const bodyBuffer = Buffer.concat(chunks);
					const headers: Record<string, string> = {};
					for (const [k, v] of Object.entries(res.headers)) {
						if (v === undefined) continue;
						headers[k] = Array.isArray(v) ? v.join(", ") : v;
					}
					resolve({
						status: res.statusCode ?? 0,
						headers,
						body: bodyBuffer.toString("utf8"),
						bodyBuffer,
						durationMs: Date.now() - start,
						resolved,
					});
				});
			},
		);

		req.on("timeout", () => {
			req.destroy();
			const err: WebhookHttpError = {
				kind: "timeout",
				message: `Request timed out after ${timeoutMs}ms`,
				durationMs: Date.now() - start,
				resolved,
			};
			reject(Object.assign(new Error(err.message), err));
		});

		req.on("error", (e) => {
			const err: WebhookHttpError = {
				kind: "network",
				message: e.message,
				durationMs: Date.now() - start,
				resolved,
			};
			reject(Object.assign(new Error(err.message), err));
		});

		if (method === "POST") req.write(body);
		req.end();
	});
}

/**
 * POST JSON to a customer webhook URL with DNS resolution pinned to a
 * pre-validated public IP (mitigates DNS rebinding TOCTOU).
 */
export async function postWebhook(input: {
	url: string;
	headers: Record<string, string>;
	body: string;
	timeoutMs?: number;
	/** When false (default), only https: is allowed. */
	allowHttp?: boolean;
	allowPrivate?: boolean;
}): Promise<WebhookHttpResult> {
	try {
		return await requestPinned({ ...input, method: "POST" });
	} catch (e) {
		if (e instanceof Error && e.message === "Only HTTPS URLs are allowed") {
			e.message = "Only HTTPS webhook URLs are allowed";
		}
		throw e;
	}
}
