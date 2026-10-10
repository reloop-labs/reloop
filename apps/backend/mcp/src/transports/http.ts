import {
	createMcpHandler,
	hostHeaderValidationResponse,
	localhostAllowedOrigins,
	originValidationResponse,
} from "@modelcontextprotocol/server";
import {
	extractRequestApiKey,
	isOAuthBearer,
	isPlausibleApiKey,
} from "../auth/api-key";
import { type Config, ConfigError } from "../config/env";
import type { Logger } from "../observability/log";
import { createReloopApi } from "../reloop/api";
import type { FetchLike } from "../reloop/client";
import { createReloopServer } from "../server/create-server";
import { SERVER_NAME, VERSION } from "../version";

export const MCP_PATH = "/mcp";
export const HEALTH_PATH = "/healthz";
export const MCP_HEALTH_PATH = `${MCP_PATH}${HEALTH_PATH}`;
export const PROTECTED_RESOURCE_METADATA_PATH =
	"/.well-known/oauth-protected-resource";

export function protectedResourceMetadataUrl(resource: string): string {
	const url = new URL(resource);
	const path = url.pathname === "/" ? "" : url.pathname;
	return `${url.origin}${PROTECTED_RESOURCE_METADATA_PATH}${path}`;
}

export function wwwAuthenticateChallenge(
	resource: string,
	realm = "reloop",
): string {
	return `Bearer realm="${realm}", resource_metadata="${protectedResourceMetadataUrl(resource)}"`;
}

export function protectedResourceMetadata(config: Config): {
	resource: string;
	authorization_servers: string[];
	scopes_supported: string[];
	bearer_methods_supported: string[];
} {
	return {
		resource: config.resource,
		authorization_servers: [config.authIssuer],
		scopes_supported: ["openid", "profile", "email"],
		bearer_methods_supported: ["header"],
	};
}

function isProtectedResourceMetadataPath(pathname: string): boolean {
	return (
		pathname === PROTECTED_RESOURCE_METADATA_PATH ||
		pathname.startsWith(`${PROTECTED_RESOURCE_METADATA_PATH}/`)
	);
}

export type HttpHandler = {
	fetch(request: Request): Promise<Response>;
	close(): Promise<void>;
};

export type CreateHttpHandlerOptions = {
	config: Config;
	logger: Logger;
	fetch?: FetchLike;
};

export type HttpServerHandle = {
	port: number;
	hostname: string;
	stop(): Promise<void>;
};

const REQUEST_ID_PATTERN = /^[A-Za-z0-9._-]{1,128}$/;
export const MAX_REQUEST_BODY_BYTES = 8 * 1024 * 1024;

function exceedsBodyLimit(request: Request): boolean {
	const raw = request.headers.get("content-length");
	if (raw === null) {
		return false;
	}
	const declared = Number(raw);
	return !Number.isFinite(declared) || declared > MAX_REQUEST_BODY_BYTES;
}
const LOOPBACK_HOSTS = ["127.0.0.1", "localhost", "::1", "[::1]"];
const ANY_HOST = "*";

function isLoopback(host: string): boolean {
	return LOOPBACK_HOSTS.includes(host);
}

function resolveRequestId(request: Request): string {
	const incoming = request.headers.get("x-request-id");
	if (incoming !== null && REQUEST_ID_PATTERN.test(incoming)) {
		return incoming;
	}
	return crypto.randomUUID();
}

function withRequestId(response: Response, requestId: string): Response {
	const headers = new Headers(response.headers);
	headers.set("x-request-id", requestId);
	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers,
	});
}

export function createHttpHandler(
	options: CreateHttpHandlerOptions,
): HttpHandler {
	const { config, logger } = options;

	if (config.apiKey !== undefined) {
		logger.warn(
			"RELOOP_API_KEY is ignored by the HTTP transport; each client authenticates with its own key per request",
		);
	}

	const mcp = createMcpHandler(
		({ authInfo }) => {
			if (authInfo === undefined) {
				throw new Error(
					"authInfo missing: the API key gate must run before the MCP handler",
				);
			}
			const api = createReloopApi({
				baseUrl: config.baseUrl,
				apiKey: authInfo.token,
				timeoutMs: config.timeoutMs,
				fetch: options.fetch,
				logger,
			});
			return createReloopServer({ api });
		},
		{ legacy: "stateless" },
	);

	const allowedHosts = config.allowedHosts.includes(ANY_HOST)
		? []
		: config.allowedHosts;
	const allowedOrigins =
		config.allowedOrigins.length > 0
			? config.allowedOrigins
			: isLoopback(config.host)
				? localhostAllowedOrigins()
				: [];

	const serve = async (request: Request, url: URL): Promise<Response> => {
		if (
			request.method === "GET" &&
			(url.pathname === HEALTH_PATH || url.pathname === MCP_HEALTH_PATH)
		) {
			return Response.json({
				status: "ok",
				name: SERVER_NAME,
				version: VERSION,
			});
		}
		if (
			request.method === "GET" &&
			isProtectedResourceMetadataPath(url.pathname)
		) {
			return Response.json(protectedResourceMetadata(config));
		}
		if (url.pathname !== MCP_PATH) {
			return Response.json(
				{ error: "not_found", message: `MCP endpoint is ${MCP_PATH}` },
				{ status: 404 },
			);
		}

		const hostRejection =
			allowedHosts.length > 0
				? hostHeaderValidationResponse(request, allowedHosts)
				: undefined;
		if (hostRejection !== undefined) {
			return hostRejection;
		}
		const originRejection = originValidationResponse(request, allowedOrigins);
		if (originRejection !== undefined) {
			return originRejection;
		}

		if (exceedsBodyLimit(request)) {
			return Response.json(
				{
					error: "payload_too_large",
					message: `Request body must be at most ${MAX_REQUEST_BODY_BYTES} bytes`,
				},
				{ status: 413 },
			);
		}

		const token = extractRequestApiKey(request);
		if (token !== undefined && isOAuthBearer(token)) {
			return mcp.fetch(request, {
				authInfo: { token, clientId: "reloop-oauth", scopes: [] },
			});
		}
		if (token === undefined || !isPlausibleApiKey(token)) {
			return Response.json(
				{
					error: "unauthorized",
					message:
						"Connect with Better Auth OAuth or provide a Reloop API key as 'Authorization: Bearer <key>' or an 'x-api-key' header.",
				},
				{
					status: 401,
					headers: {
						"www-authenticate": wwwAuthenticateChallenge(config.resource),
					},
				},
			);
		}

		return mcp.fetch(request, {
			authInfo: { token, clientId: "reloop-api-key", scopes: [] },
		});
	};

	const serveSafely = async (request: Request, url: URL): Promise<Response> => {
		try {
			return await serve(request, url);
		} catch (cause) {
			logger.error("http request failed", { path: url.pathname, cause });
			return Response.json({ error: "internal_error" }, { status: 500 });
		}
	};

	return {
		async fetch(request) {
			const requestId = resolveRequestId(request);
			const url = new URL(request.url);
			const startedAt = Date.now();
			const response = withRequestId(
				await serveSafely(request, url),
				requestId,
			);
			logger.info("http request", {
				requestId,
				method: request.method,
				path: url.pathname,
				status: response.status,
				durationMs: Date.now() - startedAt,
				mcpMethod: request.headers.get("mcp-method") ?? undefined,
			});
			return response;
		},
		close() {
			return mcp.close();
		},
	};
}

export function startHttp(options: CreateHttpHandlerOptions): HttpServerHandle {
	if (typeof Bun === "undefined") {
		throw new ConfigError(
			"The standalone HTTP server requires Bun",
			"Run it with bunx reloop-mcp --transport http, use the Docker image, or mount the exported fetch handler in your own server.",
		);
	}
	const { config, logger } = options;
	const handler = createHttpHandler(options);
	const server = Bun.serve({
		hostname: config.host,
		port: config.port,
		maxRequestBodySize: MAX_REQUEST_BODY_BYTES,
		fetch: handler.fetch,
	});
	const hostname = server.hostname ?? config.host;
	const port = server.port ?? config.port;
	logger.info("reloop mcp listening", {
		url: `http://${hostname}:${port}${MCP_PATH}`,
		baseUrl: config.baseUrl,
	});
	return {
		port,
		hostname,
		async stop() {
			await server.stop();
			await handler.close();
		},
	};
}
