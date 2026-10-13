import { describe, expect, test } from "bun:test";
import { readOAuthClaims } from "../src/auth/oauth-claims";
import { createLogger } from "../src/observability/log";
import {
	createOtlpExporter,
	parseOtlpHeaders,
} from "../src/observability/otlp";
import { createHttpHandler } from "../src/transports/http";
import {
	API_KEY,
	capturingLogger,
	connectHttpClient,
	mockReloop,
	testConfig,
} from "./helpers";

function jwt(claims: Record<string, unknown>): string {
	const encode = (value: object) =>
		Buffer.from(JSON.stringify(value)).toString("base64url");
	return `${encode({ alg: "EdDSA" })}.${encode(claims)}.c2lnbmF0dXJl`;
}

function mcpRequest(headers: Record<string, string>, body: string) {
	return new Request("http://127.0.0.1/mcp", {
		method: "POST",
		headers: {
			host: "127.0.0.1",
			"content-type": "application/json",
			accept: "application/json, text/event-stream",
			"user-agent": "Claude-User",
			...headers,
		},
		body,
	});
}

function records(lines: string[]): Record<string, unknown>[] {
	return lines.map((line) => JSON.parse(line) as Record<string, unknown>);
}

describe("oauth claims", () => {
	test("reads identity claims without the signature", () => {
		const claims = readOAuthClaims(
			jwt({
				sub: "user-1",
				org_id: "org-1",
				azp: "client-1",
				aud: ["https://reloop.sh/mcp"],
				exp: 2000000000,
			}),
		);
		expect(claims).toEqual({
			userId: "user-1",
			orgId: "org-1",
			clientId: "client-1",
			audience: ["https://reloop.sh/mcp"],
			expiresAt: 2000000000,
		});
	});

	test("returns undefined for a payload that is not JSON", () => {
		expect(readOAuthClaims("a.bm90LWpzb24.c")).toBeUndefined();
	});
});

describe("expired oauth tokens", () => {
	test("get a 401 invalid_token challenge so clients refresh", async () => {
		const { logger, lines } = capturingLogger();
		const handler = createHttpHandler({
			config: testConfig(),
			logger,
			fetch: mockReloop([]).fetch,
		});
		const token = jwt({ sub: "user-1", org_id: "org-1", exp: 1 });
		const response = await handler.fetch(
			mcpRequest(
				{ authorization: `Bearer ${token}` },
				'{"jsonrpc":"2.0","id":1,"method":"tools/list"}',
			),
		);
		expect(response.status).toBe(401);
		const challenge = response.headers.get("www-authenticate") ?? "";
		expect(challenge).toContain('error="invalid_token"');
		expect(challenge).toContain("resource_metadata=");

		const request = records(lines).find((r) => r.msg === "http request");
		expect(request).toMatchObject({
			level: "warn",
			status: 401,
			auth: "oauth",
			userId: "user-1",
			orgId: "org-1",
			tokenExpired: true,
			rpcMethod: "tools/list",
			userAgent: "Claude-User",
		});
		expect(lines.join("\n")).not.toContain(token);
		await handler.close();
	});
});

describe("request and tool logs", () => {
	test("log the tool, its outcome and the upstream failure under one request id", async () => {
		const { logger, lines } = capturingLogger();
		const mock = mockReloop([
			{
				method: "GET",
				path: "/api/domain/v1/list",
				status: 401,
				body: { message: "Invalid token", why: "expired", fix: "sign in" },
			},
		]);
		const handler = createHttpHandler({
			config: testConfig(),
			logger,
			fetch: mock.fetch,
		});
		const { client, close } = await connectHttpClient(handler);
		await client
			.callTool({ name: "list_group_contacts", arguments: {} })
			.catch(() => {});
		await client.callTool({ name: "get_reloop_status", arguments: {} });
		await close();
		await handler.close();

		const all = records(lines);
		const tool = all.find(
			(r) => r.msg === "tool call" && r.tool === "get_reloop_status",
		);
		expect(tool).toMatchObject({ level: "warn", ok: false, errorStatus: 401 });
		const upstream = all.find((r) => r.msg === "reloop request");
		expect(upstream).toMatchObject({ level: "warn", status: 401 });
		expect(upstream?.requestId).toBe(tool?.requestId);
		const request = all.find(
			(r) => r.msg === "http request" && r.tool === "get_reloop_status",
		);
		expect(request).toMatchObject({ auth: "api_key", rpcMethod: "tools/call" });
		expect(request?.requestId).toBe(tool?.requestId);
		// Tool names skip API-key redaction; the key itself never appears.
		expect(lines.join("\n")).toContain("list_group_contacts");
		expect(lines.join("\n")).not.toContain(API_KEY);
	});
});

describe("otlp exporter", () => {
	test("batches redacted records as wide events with build metadata", async () => {
		const sent: unknown[][] = [];
		const exporter = createOtlpExporter({
			endpoint: "https://signoz.example/otlp",
			service: "mcp",
			environment: "production",
			version: "0.2.0",
			commit: "abc123",
			maxBatch: 2,
			send: async (events) => {
				sent.push(events);
			},
		});
		const logger = createLogger({
			level: "info",
			sink: () => {},
			exporter: exporter.export,
		});
		logger.info("http request", { status: 200, auth: `Bearer ${API_KEY}` });
		logger.warn("tool call", { tool: "list_domains" });
		await exporter.flush();

		expect(sent).toHaveLength(1);
		const [first, second] = sent[0] as Record<string, unknown>[];
		expect(first).toMatchObject({
			msg: "http request",
			level: "info",
			service: "mcp",
			environment: "production",
			version: "0.2.0",
			commitHash: "abc123",
			status: 200,
		});
		expect(typeof first?.timestamp).toBe("string");
		expect(JSON.stringify(first)).not.toContain(API_KEY);
		expect(second).toMatchObject({ level: "warn", tool: "list_domains" });
	});

	test("reports an export outage once and never throws", async () => {
		const errors: unknown[] = [];
		const exporter = createOtlpExporter({
			endpoint: "https://signoz.example/otlp",
			service: "mcp",
			environment: "production",
			version: "0.2.0",
			commit: "abc123",
			send: async () => {
				throw new Error("connection refused");
			},
			onError: (cause) => errors.push(cause),
		});
		exporter.export({ msg: "one", level: "info" });
		await exporter.flush();
		exporter.export({ msg: "two", level: "info" });
		await exporter.flush();
		expect(errors).toHaveLength(1);
	});

	test("parses OTEL_EXPORTER_OTLP_HEADERS", () => {
		expect(parseOtlpHeaders("signoz-ingestion-key=abc%3D,x-team=mail")).toEqual(
			{ "signoz-ingestion-key": "abc=", "x-team": "mail" },
		);
		expect(parseOtlpHeaders(undefined)).toBeUndefined();
	});
});
