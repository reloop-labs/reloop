import { expect } from "bun:test";
import {
	Client,
	StreamableHTTPClientTransport,
} from "@modelcontextprotocol/client";
import type { Config } from "../src/config/env";
import { createLogger, type Logger } from "../src/observability/log";
import type { FetchLike } from "../src/reloop/client";
import type { Contact, ContactListResponse } from "../src/reloop/types";
import { type HttpHandler, MCP_PATH } from "../src/transports/http";

export const API_KEY = "rl_prod_testkey1234567890abcdefg";
export const BASE_URL = "http://reloop.test";

export type Route = {
	method: string;
	path: string;
	status?: number;
	body?: unknown;
	rawBody?: string;
	headers?: Record<string, string>;
	delayMs?: number;
	bodyDelayMs?: number;
	once?: boolean;
	error?: string;
};

export type RecordedCall = {
	method: string;
	url: string;
	path: string;
	query: Record<string, string>;
	headers: Record<string, string>;
	body: unknown;
};

function readHeaders(init: RequestInit): Record<string, string> {
	const headers: Record<string, string> = {};
	for (const [key, value] of new Headers(init.headers).entries()) {
		headers[key.toLowerCase()] = value;
	}
	return headers;
}

function readBody(init: RequestInit): unknown {
	if (typeof init.body !== "string") {
		return undefined;
	}
	try {
		return JSON.parse(init.body);
	} catch {
		return init.body;
	}
}

function wait(
	delayMs: number,
	signal: AbortSignal | null | undefined,
): Promise<void> {
	return new Promise((resolve, reject) => {
		const timer = setTimeout(resolve, delayMs);
		signal?.addEventListener("abort", () => {
			clearTimeout(timer);
			reject(new Error("The operation was aborted"));
		});
	});
}

function delayedBody(
	text: string,
	delayMs: number,
	signal: AbortSignal | null | undefined,
): ReadableStream<Uint8Array> {
	return new ReadableStream({
		start(controller) {
			const timer = setTimeout(() => {
				controller.enqueue(new TextEncoder().encode(text));
				controller.close();
			}, delayMs);
			signal?.addEventListener("abort", () => {
				clearTimeout(timer);
				controller.error(new Error("The operation was aborted"));
			});
		},
	});
}

export function mockReloop(routes: Route[]): {
	fetch: FetchLike;
	calls: RecordedCall[];
} {
	const remaining = [...routes];
	const calls: RecordedCall[] = [];

	const fetch: FetchLike = async (url, init) => {
		const parsed = new URL(url);
		const method = (init.method ?? "GET").toUpperCase();
		const query: Record<string, string> = {};
		for (const [key, value] of parsed.searchParams.entries()) {
			query[key] = value;
		}
		calls.push({
			method,
			url,
			path: parsed.pathname,
			query,
			headers: readHeaders(init),
			body: readBody(init),
		});

		const index = remaining.findIndex(
			(route) =>
				route.method.toUpperCase() === method && route.path === parsed.pathname,
		);
		const route = index === -1 ? undefined : remaining[index];
		if (route === undefined) {
			return Response.json(
				{
					message: "Not found",
					why: "No mock route matched",
					fix: "Add a route",
				},
				{ status: 404 },
			);
		}
		if (route.once === true) {
			remaining.splice(index, 1);
		}
		if (route.delayMs !== undefined) {
			await wait(route.delayMs, init.signal);
		}
		if (route.error !== undefined) {
			throw new TypeError(route.error);
		}
		const status = route.status ?? 200;
		if (route.bodyDelayMs !== undefined) {
			return new Response(
				delayedBody(
					JSON.stringify(route.body ?? {}),
					route.bodyDelayMs,
					init.signal,
				),
				{ status, headers: { "content-type": "application/json" } },
			);
		}
		if (route.rawBody !== undefined) {
			return new Response(route.rawBody, {
				status,
				headers: { "content-type": "application/json", ...route.headers },
			});
		}
		if (route.body === undefined) {
			return new Response(null, { status, headers: route.headers });
		}
		return new Response(JSON.stringify(route.body), {
			status,
			headers: { "content-type": "application/json", ...route.headers },
		});
	};

	return { fetch, calls };
}

export function contactFixture(over: Partial<Contact> = {}): Contact {
	return {
		object: "contact",
		id: "con_123",
		email: "luna@example.com",
		firstName: "Luna",
		lastName: null,
		status: "subscribed",
		properties: { company: "Reloop" },
		groups: [{ id: "grp_1", name: "Beta" }],
		channels: [{ id: "chn_1", name: "Product", subscription: "opt_in" }],
		suppressionReason: null,
		suppressedAt: null,
		createdAt: "2026-01-01T00:00:00.000Z",
		updatedAt: "2026-01-02T00:00:00.000Z",
		...over,
	};
}

export function listFixture(
	contacts: Contact[],
	over: Partial<ContactListResponse> = {},
): ContactListResponse {
	return {
		object: "contact",
		contacts,
		total: contacts.length,
		page: 1,
		limit: 20,
		totalContacts: contacts.length,
		subscribedContacts: contacts.length,
		unsubscribedContacts: 0,
		event: "contacts.listed",
		...over,
	};
}

export function silentLogger(): Logger {
	return createLogger({ level: "silent" });
}

export function capturingLogger(): { logger: Logger; lines: string[] } {
	const lines: string[] = [];
	return {
		logger: createLogger({ level: "debug", sink: (line) => lines.push(line) }),
		lines,
	};
}

export function testConfig(over: Partial<Config> = {}): Config {
	return {
		baseUrl: BASE_URL,
		timeoutMs: 5000,
		host: "127.0.0.1",
		port: 0,
		allowedHosts: [],
		allowedOrigins: [],
		logLevel: "silent",
		...over,
	};
}

export async function connectHttpClient(
	handler: HttpHandler,
	options: { apiKey?: string; headers?: Record<string, string> } = {},
): Promise<{ client: Client; close(): Promise<void> }> {
	const transport = new StreamableHTTPClientTransport(
		new URL(`http://127.0.0.1${MCP_PATH}`),
		{
			fetch: (url, init) => handler.fetch(new Request(url, init)),
			requestInit: {
				headers: {
					host: "127.0.0.1",
					authorization: `Bearer ${options.apiKey ?? API_KEY}`,
					...options.headers,
				},
			},
		},
	);
	const client = new Client(
		{ name: "test-harness", version: "1.0.0" },
		{ versionNegotiation: { mode: "auto" } },
	);
	await client.connect(transport);
	return {
		client,
		close: () => client.close(),
	};
}

export function readProperty(source: unknown, key: string): unknown {
	if (typeof source !== "object" || source === null) {
		throw new Error(`expected an object to read "${key}" from`);
	}
	return Reflect.get(source, key);
}

export function structuredContent(result: unknown): unknown {
	return readProperty(result, "structuredContent");
}

export function errorJson(result: unknown): unknown {
	expect(readProperty(result, "isError")).toBe(true);
	expect(readProperty(result, "structuredContent")).toBeUndefined();
	return readProperty(JSON.parse(firstText(result)), "error");
}

export function firstText(result: unknown): string {
	const content = readProperty(result, "content");
	if (!Array.isArray(content)) {
		throw new Error("expected a content array");
	}
	const blocks: unknown[] = content;
	const text = readProperty(blocks[0], "text");
	if (typeof text !== "string") {
		throw new Error("expected a text content block");
	}
	return text;
}
