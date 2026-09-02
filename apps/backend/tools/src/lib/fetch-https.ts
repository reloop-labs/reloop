import dns from "node:dns";
import type { IncomingMessage } from "node:http";
import https from "node:https";
import net from "node:net";
import { isBlockedHostname, isPrivateOrBlockedIP } from "./ssrf";

export type FetchHttpsResult = {
	ok: boolean;
	status: number;
	contentType: string;
	body: string;
	finalUrl: string;
	error?: string;
};

export type AddressLookup = (
	hostname: string,
) => Promise<ReadonlyArray<{ address: string; family: number }>>;

export type HttpsRequester = typeof https.request;

export type FetchHttpsDeps = {
	lookup?: AddressLookup;
	request?: HttpsRequester;
	rejectUnauthorized?: boolean;
};

const MAX_BYTES = 256 * 1024;
const FETCH_TIMEOUT_MS = 4000;
const MAX_REDIRECTS = 2;

function isHttpsUrl(value: string): boolean {
	try {
		const url = new URL(value);
		return url.protocol === "https:";
	} catch {
		return false;
	}
}

export async function defaultAddressLookup(
	hostname: string,
): Promise<dns.LookupAddress[]> {
	return dns.promises.lookup(hostname, { all: true });
}

export async function pinPublicAddress(
	hostname: string,
	lookup: AddressLookup = defaultAddressLookup,
): Promise<string | null> {
	if (net.isIP(hostname)) {
		return isPrivateOrBlockedIP(hostname) ? null : hostname;
	}

	const results = await lookup(hostname);
	if (results.length === 0) return null;
	if (results.some((entry) => isPrivateOrBlockedIP(entry.address))) {
		return null;
	}
	const ipv4 = results.find(
		(entry) => entry.family === 4 || net.isIPv4(entry.address),
	);
	return (ipv4 ?? results[0])?.address ?? null;
}

async function readLimitedBody(
	response: IncomingMessage,
	maxBytes: number,
): Promise<{ ok: true; buffer: Buffer } | { ok: false; error: string }> {
	const declared = Number(response.headers["content-length"]);
	if (Number.isFinite(declared) && declared > maxBytes) {
		response.destroy();
		return { ok: false, error: `Response exceeded ${maxBytes} bytes.` };
	}

	const chunks: Buffer[] = [];
	let total = 0;
	try {
		for await (const chunk of response) {
			const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
			total += buf.byteLength;
			if (total > maxBytes) {
				response.destroy();
				return { ok: false, error: `Response exceeded ${maxBytes} bytes.` };
			}
			chunks.push(buf);
		}
	} catch {
		return { ok: false, error: "Could not fetch URL." };
	}

	return { ok: true, buffer: Buffer.concat(chunks) };
}

function requestPinned(
	parsed: URL,
	ip: string,
	signal: AbortSignal,
	deps: FetchHttpsDeps,
): Promise<IncomingMessage> {
	const request = deps.request ?? https.request;
	const family = net.isIPv6(ip) ? 6 : 4;

	return new Promise((resolve, reject) => {
		if (signal.aborted) {
			const error = new Error("Request timed out.");
			error.name = "AbortError";
			reject(error);
			return;
		}

		const req = request(
			{
				hostname: ip,
				family,
				port: parsed.port || 443,
				path: `${parsed.pathname}${parsed.search}`,
				method: "GET",
				servername: parsed.hostname,
				rejectUnauthorized: deps.rejectUnauthorized ?? true,
				headers: {
					host: parsed.host,
					accept: "image/svg+xml,application/pem-certificate-chain,*/*",
					"user-agent": "Reloop-Tools-BIMI/1.0",
				},
			},
			resolve,
		);

		const onAbort = () => {
			const error = new Error("Request timed out.");
			error.name = "AbortError";
			req.destroy(error);
		};
		signal.addEventListener("abort", onAbort, { once: true });
		req.on("error", reject);
		req.end();
	});
}

function fail(
	rawUrl: string,
	error: string,
	status = 0,
	contentType = "",
): FetchHttpsResult {
	return {
		ok: false,
		status,
		contentType,
		body: "",
		finalUrl: rawUrl,
		error,
	};
}

/**
 * Fetch an HTTPS URL after rejecting private/local hosts. Used for BIMI logos
 * and authority certificates — not a general-purpose HTTP client.
 *
 * The TCP connection is pinned to an address that already passed the public-IP
 * check, while TLS still validates the original hostname.
 */
export async function fetchHttpsText(
	rawUrl: string,
	redirectsLeft = MAX_REDIRECTS,
	deps: FetchHttpsDeps = {},
): Promise<FetchHttpsResult> {
	if (!isHttpsUrl(rawUrl)) {
		return fail(rawUrl, "URL must use HTTPS.");
	}

	let parsed: URL;
	try {
		parsed = new URL(rawUrl);
	} catch {
		return fail(rawUrl, "URL is not valid.");
	}

	if (isBlockedHostname(parsed.hostname)) {
		return fail(rawUrl, "That host is not allowed.");
	}

	const lookup = deps.lookup ?? defaultAddressLookup;
	let pinned: string | null;
	try {
		pinned = await pinPublicAddress(parsed.hostname, lookup);
		if (!pinned) {
			return fail(rawUrl, "Host resolved to a private or blocked address.");
		}
	} catch {
		return fail(rawUrl, "Could not resolve the hostname.");
	}

	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

	try {
		const response = await requestPinned(
			parsed,
			pinned,
			controller.signal,
			deps,
		);

		if ([301, 302, 303, 307, 308].includes(response.statusCode ?? 0)) {
			const location = response.headers.location;
			response.resume();
			if (!location || redirectsLeft <= 0) {
				return fail(
					rawUrl,
					"Too many redirects or missing Location header.",
					response.statusCode ?? 0,
				);
			}
			const next = new URL(location, parsed).toString();
			return fetchHttpsText(next, redirectsLeft - 1, deps);
		}

		const contentType = String(response.headers["content-type"] || "")
			.split(";")[0]
			?.trim()
			.toLowerCase();

		const body = await readLimitedBody(response, MAX_BYTES);
		if (!body.ok) {
			return {
				ok: false,
				status: response.statusCode ?? 0,
				contentType: contentType || "",
				body: "",
				finalUrl: parsed.toString(),
				error: body.error,
			};
		}

		const status = response.statusCode ?? 0;
		const ok = status >= 200 && status < 300;
		return {
			ok,
			status,
			contentType: contentType || "",
			body: body.buffer.toString("utf8"),
			finalUrl: parsed.toString(),
			error: ok ? undefined : `HTTP ${status}`,
		};
	} catch (error) {
		const aborted = error instanceof Error && error.name === "AbortError";
		return fail(
			rawUrl,
			aborted ? "Request timed out." : "Could not fetch URL.",
		);
	} finally {
		clearTimeout(timer);
	}
}
