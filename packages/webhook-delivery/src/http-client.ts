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
	durationMs: number;
	resolved: ResolvedTarget;
};

export type WebhookHttpError = {
	kind: "ssrf" | "network" | "timeout";
	message: string;
	durationMs: number;
	resolved?: ResolvedTarget;
};

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
}): Promise<WebhookHttpResult> {
	const timeoutMs = input.timeoutMs ?? WEBHOOK_HTTP_TIMEOUT_MS;
	const start = Date.now();

	let parsed: URL;
	try {
		parsed = new URL(input.url);
	} catch {
		throw Object.assign(new Error("Invalid webhook URL"), {
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
			message: "Only HTTPS webhook URLs are allowed",
			durationMs: Date.now() - start,
		};
		throw Object.assign(new Error(err.message), err);
	}

	let resolved: ResolvedTarget;
	try {
		resolved = await resolvePublicTarget(parsed.hostname);
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

	return new Promise<WebhookHttpResult>((resolve, reject) => {
		const req = lib.request(
			{
				protocol: parsed.protocol,
				hostname: resolved.pinnedIp,
				port,
				path: `${parsed.pathname}${parsed.search}`,
				method: "POST",
				headers: {
					...input.headers,
					Host: parsed.host,
					"Content-Length": Buffer.byteLength(input.body),
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
				res.on("data", (chunk: Buffer) => {
					chunks.push(chunk);
				});
				res.on("end", () => {
					const body = Buffer.concat(chunks).toString("utf8");
					const headers: Record<string, string> = {};
					for (const [k, v] of Object.entries(res.headers)) {
						if (v === undefined) continue;
						headers[k] = Array.isArray(v) ? v.join(", ") : v;
					}
					resolve({
						status: res.statusCode ?? 0,
						headers,
						body,
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
				message: `Webhook request timed out after ${timeoutMs}ms`,
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

		req.write(input.body);
		req.end();
	});
}
