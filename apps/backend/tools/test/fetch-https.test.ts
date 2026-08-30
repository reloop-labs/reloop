import { describe, expect, test } from "bun:test";
import type { IncomingMessage } from "node:http";
import { Readable } from "node:stream";
import { fetchHttpsText, type HttpsRequester } from "../src/lib/fetch-https";

const MAX_BYTES = 256 * 1024;

function incomingFrom(chunks: Buffer[], statusCode = 200): IncomingMessage {
	const stream = Readable.from(chunks) as IncomingMessage;
	stream.statusCode = statusCode;
	stream.headers = { "content-type": "image/svg+xml" };
	return stream;
}

function mockRequest(
	handler: (opts: {
		hostname?: string;
		servername?: string;
		headers?: IncomingMessage["headers"];
	}) => IncomingMessage,
): HttpsRequester {
	return ((opts: unknown, cb?: (res: IncomingMessage) => void) => {
		const options = opts as {
			hostname?: string;
			servername?: string;
			headers?: IncomingMessage["headers"];
		};
		queueMicrotask(() => cb?.(handler(options)));
		return {
			on() {
				return this;
			},
			end() {
				return this;
			},
			destroy() {
				return this;
			},
		};
	}) as HttpsRequester;
}

describe("fetchHttpsText", () => {
	test("pins the validated address instead of reconnecting by hostname", async () => {
		let connectedHost: string | undefined;
		let tlsName: string | undefined;
		const result = await fetchHttpsText("https://logo.example/bimi.svg", 2, {
			lookup: async () => [{ address: "203.0.113.10", family: 4 }],
			request: mockRequest((opts) => {
				connectedHost = opts.hostname;
				tlsName = opts.servername;
				return incomingFrom([Buffer.from("<svg />")]);
			}),
		});
		expect(result.ok).toBe(true);
		expect(connectedHost).toBe("203.0.113.10");
		expect(tlsName).toBe("logo.example");
	});

	test("cancels the body stream once MAX_BYTES is exceeded", async () => {
		const result = await fetchHttpsText("https://cdn.example/huge.svg", 2, {
			lookup: async () => [{ address: "203.0.113.10", family: 4 }],
			request: mockRequest(() =>
				incomingFrom([
					Buffer.alloc(200 * 1024, 97),
					Buffer.alloc(100 * 1024, 98),
				]),
			),
		});
		expect(result.ok).toBe(false);
		expect(result.error).toBe(`Response exceeded ${MAX_BYTES} bytes.`);
		expect(result.body).toBe("");
	});

	test("rejects a host that resolves privately before connecting", async () => {
		let requested = false;
		const result = await fetchHttpsText(
			"https://internal.example/logo.svg",
			2,
			{
				lookup: async () => [{ address: "10.0.0.5", family: 4 }],
				request: mockRequest(() => {
					requested = true;
					return incomingFrom([Buffer.from("nope")]);
				}),
			},
		);
		expect(result.ok).toBe(false);
		expect(requested).toBe(false);
		expect(result.error).toContain("private");
	});
});
