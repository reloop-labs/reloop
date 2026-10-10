import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { connect } from "node:tls";
import { isPublicRoutableHost } from "@better-auth/core/utils/host";
import type { ClientMetadataResourceFetch } from "@better-auth/oauth-provider";

/**
 * Bun-native CIMD metadata transport.
 *
 * Mirrors `@better-auth/cimd/node`'s `fetchClientMetadataResource` contract,
 * which cannot run on Bun (it relies on Node's `https.request` + custom
 * `lookup` pinning):
 *
 * - HTTPS only, `GET`/`HEAD` only.
 * - Resolve the hostname exactly once; **every** DNS answer must be
 *   public-routable (`isPublicRoutableHost`), otherwise fail closed.
 * - Open TLS to the pinned address while keeping the original hostname as
 *   HTTP `Host`, TLS SNI, and certificate-verification identity.
 * - Never follow redirects (single request; redirect responses are returned
 *   as-is for the plugin layer to reject).
 * - Honor the caller's abort signal.
 *
 * The plugin layer enforces its own timeout (~5s), 5 KiB document limit, and
 * 64 KiB JWKS limit while reading the returned stream. This transport adds a
 * generous upper guard (`MAX_BODY_BYTES`) purely as an OOM backstop; anything
 * above the plugin's limits is still rejected by the plugin (fail closed).
 */

const BODYLESS_STATUSES = new Set([204, 205, 304]);
const MAX_HEADER_BLOCK_BYTES = 32 * 1024;
const MAX_BODY_BYTES = 256 * 1024;
const CONNECT_TIMEOUT_MS = 8000;

function abortError(reason: unknown): Error {
	if (reason instanceof Error) return reason;
	try {
		return new DOMException("The operation was aborted.", "AbortError");
	} catch {
		return new Error("The operation was aborted.");
	}
}

interface ParsedHead {
	status: number;
	statusText: string;
	headers: Array<[string, string]>;
	bodyStart: number;
}

/** Parse an HTTP/1.x head block. Returns null when the block is incomplete. */
function parseHead(buffer: Uint8Array): ParsedHead | null {
	let headerEnd = -1;
	for (let i = 0; i + 3 < buffer.length; i++) {
		if (
			buffer[i] === 13 &&
			buffer[i + 1] === 10 &&
			buffer[i + 2] === 13 &&
			buffer[i + 3] === 10
		) {
			headerEnd = i;
			break;
		}
	}
	if (headerEnd < 0) return null;
	const headText = new TextDecoder("ascii").decode(
		buffer.subarray(0, headerEnd),
	);
	const lines = headText.split("\r\n");
	const statusLine = lines[0] ?? "";
	const statusMatch = /^HTTP\/\d(?:\.\d)?\s+(\d{3})(?:\s+(.*))?$/.exec(
		statusLine,
	);
	if (!statusMatch) throw new TypeError("Invalid HTTP response status line");
	const headers: Array<[string, string]> = [];
	for (const line of lines.slice(1)) {
		const colon = line.indexOf(":");
		if (colon <= 0) continue;
		headers.push([line.slice(0, colon).trim(), line.slice(colon + 1).trim()]);
	}
	return {
		status: Number(statusMatch[1]),
		statusText: statusMatch[2] ?? "",
		headers,
		bodyStart: headerEnd + 4,
	};
}

function headerValues(
	headers: Array<[string, string]>,
	name: string,
): string[] {
	const lower = name.toLowerCase();
	return headers
		.filter(([key]) => key.toLowerCase() === lower)
		.map(([, value]) => value);
}

/** Decode a chunked body. Returns `complete: false` when more bytes are needed. */
function decodeChunked(body: Uint8Array): {
	bytes: Uint8Array;
	complete: boolean;
} {
	const out: number[] = [];
	let i = 0;
	for (;;) {
		let lineEnd = -1;
		for (let j = i; j + 1 < body.length; j++) {
			if (body[j] === 13 && body[j + 1] === 10) {
				lineEnd = j;
				break;
			}
		}
		if (lineEnd < 0) return { bytes: Uint8Array.from(out), complete: false };
		const sizeText = new TextDecoder("ascii")
			.decode(body.subarray(i, lineEnd))
			.split(";")[0]
			?.trim();
		const size = Number.parseInt(sizeText ?? "", 16);
		if (!Number.isSafeInteger(size) || size < 0)
			throw new TypeError("Invalid chunked transfer encoding");
		const chunkStart = lineEnd + 2;
		if (size === 0) return { bytes: Uint8Array.from(out), complete: true };
		if (chunkStart + size + 2 > body.length)
			return { bytes: Uint8Array.from(out), complete: false };
		for (let k = chunkStart; k < chunkStart + size; k++)
			out.push(body[k] as number);
		i = chunkStart + size + 2;
	}
}

function concatBytes(chunks: Uint8Array[]): Uint8Array {
	const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
	const out = new Uint8Array(total);
	let offset = 0;
	for (const chunk of chunks) {
		out.set(chunk, offset);
		offset += chunk.length;
	}
	return out;
}

export const fetchClientMetadataResourceBun: ClientMetadataResourceFetch =
	async (input, init) => {
		const webRequest = new Request(input, init);
		const url = new URL(webRequest.url);
		if (url.protocol !== "https:")
			throw new TypeError("CIMD Bun transport requires an HTTPS URL");
		if (webRequest.method !== "GET" && webRequest.method !== "HEAD")
			throw new TypeError("CIMD Bun transport supports only GET and HEAD");

		const signal = init?.signal ?? webRequest.signal;

		// Resolve once. Every answer must be public-routable or we fail
		// closed (no "first good answer" fallback that enables rebinding).
		const hostname = url.hostname.replace(/^\[|\]$/g, "");
		const answers = await lookup(hostname, { all: true, verbatim: true });
		if (answers.length === 0)
			throw new TypeError("metadata hostname returned no DNS addresses");
		for (const answer of answers) {
			if (!isPublicRoutableHost(answer.address))
				throw new TypeError(
					"metadata hostname must resolve only to public-routable addresses",
				);
		}
		const pinned = answers[0];
		if (!pinned) throw new TypeError("metadata hostname resolution failed");

		const port = url.port ? Number(url.port) : 443;
		const hostIsIpLiteral = isIP(hostname) !== 0;

		const chunks: Uint8Array[] = [];
		let buffered = 0;
		let head: ParsedHead | null = null;

		const result = await new Promise<{
			head: ParsedHead;
			body: Uint8Array | null;
		}>((resolve, reject) => {
			let settled = false;

			const socket = connect({
				host: pinned.address,
				port,
				// Preserve TLS identity for the original host while the TCP
				// connection goes to the pinned address.
				servername: hostIsIpLiteral ? undefined : url.hostname,
				ALPNProtocols: ["http/1.1"],
				timeout: CONNECT_TIMEOUT_MS,
			});

			const cleanup = () => {
				signal?.removeEventListener("abort", onAbort);
				socket.removeAllListeners();
				if (!socket.destroyed) socket.destroy();
			};
			const finish = (body: Uint8Array | null) => {
				if (settled || !head) return;
				settled = true;
				const done = { head, body };
				cleanup();
				resolve(done);
			};
			const fail = (error: unknown) => {
				if (settled) return;
				settled = true;
				cleanup();
				reject(error instanceof Error ? error : new Error(String(error)));
			};
			const onAbort = () => {
				fail(abortError(signal?.reason));
			};
			if (signal?.aborted) {
				fail(abortError(signal.reason));
				return;
			}
			signal?.addEventListener("abort", onAbort, { once: true });

			socket.once("error", fail);
			socket.once("timeout", () =>
				fail(new TypeError("metadata transport connect timed out")),
			);

			/** Attempt to complete from buffered bytes. Returns true if settled. */
			const tryFinish = (): boolean => {
				if (!head) return false;
				const raw = concatBytes(chunks).subarray(head.bodyStart);
				if (
					webRequest.method === "HEAD" ||
					BODYLESS_STATUSES.has(head.status)
				) {
					finish(null);
					return true;
				}
				const transferEncodings = headerValues(
					head.headers,
					"transfer-encoding",
				);
				const isChunked = transferEncodings.some((value) =>
					value
						.toLowerCase()
						.split(",")
						.map((part) => part.trim())
						.includes("chunked"),
				);
				if (isChunked) {
					let decoded: Uint8Array;
					try {
						const decodedResult = decodeChunked(raw);
						if (!decodedResult.complete) return false;
						decoded = decodedResult.bytes;
					} catch (error) {
						fail(error);
						return true;
					}
					if (decoded.length > MAX_BODY_BYTES) {
						fail(new TypeError("metadata response body exceeds size limit"));
						return true;
					}
					finish(decoded);
					return true;
				}
				const lengths = headerValues(head.headers, "content-length");
				if (lengths.length > 0) {
					const expected = Number(lengths[lengths.length - 1]);
					if (!Number.isSafeInteger(expected) || expected < 0) {
						fail(new TypeError("Invalid Content-Length"));
						return true;
					}
					if (expected > MAX_BODY_BYTES) {
						fail(new TypeError("metadata response body exceeds size limit"));
						return true;
					}
					if (raw.length < expected) return false;
					finish(raw.slice(0, expected));
					return true;
				}
				// No framing headers: body runs until connection close. Cannot
				// finish until `end`; guard size meanwhile.
				return false;
			};

			socket.on("data", (data: Buffer) => {
				if (settled) return;
				const bytes = new Uint8Array(
					data.buffer,
					data.byteOffset,
					data.byteLength,
				);
				chunks.push(bytes);
				buffered += bytes.length;
				if (buffered > MAX_HEADER_BLOCK_BYTES + MAX_BODY_BYTES) {
					fail(
						new TypeError(
							!head
								? "metadata response head exceeds size limit"
								: "metadata response body exceeds size limit",
						),
					);
					return;
				}
				if (!head) {
					try {
						head = parseHead(concatBytes(chunks));
					} catch (error) {
						fail(error);
						return;
					}
					if (!head) return;
				}
				tryFinish();
			});
			const onEnd = () => {
				if (settled) return;
				if (!head) {
					try {
						head = parseHead(concatBytes(chunks));
					} catch (error) {
						fail(error);
						return;
					}
					if (!head) {
						fail(new TypeError("Truncated HTTP response"));
						return;
					}
				}
				if (!tryFinish()) {
					// Close-delimited body: whatever arrived is the body.
					const raw = concatBytes(chunks).subarray(head.bodyStart);
					if (raw.length > MAX_BODY_BYTES) {
						fail(new TypeError("metadata response body exceeds size limit"));
						return;
					}
					finish(raw);
				}
			};
			socket.once("end", onEnd);
			socket.once("close", (hadError: boolean) => {
				if (settled) return;
				if (hadError) {
					fail(new TypeError("metadata transport socket closed with error"));
					return;
				}
				onEnd();
			});

			socket.on("secureConnect", () => {
				const requestHeaders: Array<[string, string]> = [];
				const seen = new Set<string>();
				for (const [key, value] of webRequest.headers.entries()) {
					const lower = key.toLowerCase();
					if (
						lower === "host" ||
						lower === "connection" ||
						lower === "content-length"
					)
						continue;
					seen.add(lower);
					requestHeaders.push([key, value]);
				}
				if (!seen.has("user-agent"))
					requestHeaders.push(["User-Agent", "reloop-cimd/1"]);
				const lines = [
					`${webRequest.method} ${url.pathname}${url.search} HTTP/1.1`,
					`Host: ${url.host}`,
					"Connection: close",
				];
				for (const [key, value] of requestHeaders)
					lines.push(`${key}: ${value}`);
				socket.write(`${lines.join("\r\n")}\r\n\r\n`, "ascii", (error) => {
					if (error) fail(error);
				});
			});
		});

		const headers = new Headers();
		for (const [key, value] of result.head.headers) {
			try {
				headers.append(key, value);
			} catch {
				// Skip response headers that the Headers implementation rejects.
			}
		}
		// Copy into a fresh ArrayBuffer-backed view: the pooled socket buffers
		// must not escape, and DOM Response typing requires ArrayBuffer.
		const body = result.body ? new Uint8Array(result.body) : null;
		return new Response(body, {
			status: result.head.status,
			statusText: result.head.statusText,
			headers,
		});
	};
