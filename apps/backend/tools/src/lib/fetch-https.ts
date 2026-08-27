export type FetchHttpsResult = {
	ok: boolean;
	status: number;
	contentType: string;
	body: string;
	finalUrl: string;
	error?: string;
};

const MAX_BYTES = 256 * 1024;
const FETCH_TIMEOUT_MS = 4000;
const MAX_REDIRECTS = 2;

import { hostnameResolvesPublic, isBlockedHostname } from "./ssrf";

function isHttpsUrl(value: string): boolean {
	try {
		const url = new URL(value);
		return url.protocol === "https:";
	} catch {
		return false;
	}
}

/**
 * Fetch an HTTPS URL after rejecting private/local hosts. Used for BIMI logos
 * and authority certificates — not a general-purpose HTTP client.
 */
export async function fetchHttpsText(
	rawUrl: string,
	redirectsLeft = MAX_REDIRECTS,
): Promise<FetchHttpsResult> {
	if (!isHttpsUrl(rawUrl)) {
		return {
			ok: false,
			status: 0,
			contentType: "",
			body: "",
			finalUrl: rawUrl,
			error: "URL must use HTTPS.",
		};
	}

	let parsed: URL;
	try {
		parsed = new URL(rawUrl);
	} catch {
		return {
			ok: false,
			status: 0,
			contentType: "",
			body: "",
			finalUrl: rawUrl,
			error: "URL is not valid.",
		};
	}

	if (isBlockedHostname(parsed.hostname)) {
		return {
			ok: false,
			status: 0,
			contentType: "",
			body: "",
			finalUrl: rawUrl,
			error: "That host is not allowed.",
		};
	}

	try {
		const publicOk = await hostnameResolvesPublic(parsed.hostname);
		if (!publicOk) {
			return {
				ok: false,
				status: 0,
				contentType: "",
				body: "",
				finalUrl: rawUrl,
				error: "Host resolved to a private or blocked address.",
			};
		}
	} catch {
		return {
			ok: false,
			status: 0,
			contentType: "",
			body: "",
			finalUrl: rawUrl,
			error: "Could not resolve the hostname.",
		};
	}

	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

	try {
		const response = await fetch(parsed.toString(), {
			method: "GET",
			redirect: "manual",
			signal: controller.signal,
			headers: {
				accept: "image/svg+xml,application/pem-certificate-chain,*/*",
				"user-agent": "Reloop-Tools-BIMI/1.0",
			},
		});

		if ([301, 302, 303, 307, 308].includes(response.status)) {
			const location = response.headers.get("location");
			if (!location || redirectsLeft <= 0) {
				return {
					ok: false,
					status: response.status,
					contentType: "",
					body: "",
					finalUrl: rawUrl,
					error: "Too many redirects or missing Location header.",
				};
			}
			const next = new URL(location, parsed).toString();
			return fetchHttpsText(next, redirectsLeft - 1);
		}

		const contentType = (response.headers.get("content-type") || "")
			.split(";")[0]
			?.trim()
			.toLowerCase();

		const buffer = Buffer.from(await response.arrayBuffer());
		if (buffer.byteLength > MAX_BYTES) {
			return {
				ok: false,
				status: response.status,
				contentType: contentType || "",
				body: "",
				finalUrl: parsed.toString(),
				error: `Response exceeded ${MAX_BYTES} bytes.`,
			};
		}

		return {
			ok: response.ok,
			status: response.status,
			contentType: contentType || "",
			body: buffer.toString("utf8"),
			finalUrl: parsed.toString(),
			error: response.ok ? undefined : `HTTP ${response.status}`,
		};
	} catch (error) {
		const aborted = error instanceof Error && error.name === "AbortError";
		return {
			ok: false,
			status: 0,
			contentType: "",
			body: "",
			finalUrl: rawUrl,
			error: aborted ? "Request timed out." : "Could not fetch URL.",
		};
	} finally {
		clearTimeout(timer);
	}
}
