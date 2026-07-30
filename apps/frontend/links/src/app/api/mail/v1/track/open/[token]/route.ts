import { getMailTrackOpenUrl } from "@reloop/links/lib/mail-api";
import { NextResponse } from "next/server";

/**
 * Transparent 1×1 PNG fallback when the mail service is unreachable.
 * Matches the pixel returned by the mail open-tracking endpoint.
 */
const TRANSPARENT_PIXEL = Uint8Array.from(
	Buffer.from(
		"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
		"base64",
	),
);

const PIXEL_HEADERS = {
	"Content-Type": "image/png",
	"Cache-Control": "no-cache, no-store, must-revalidate",
} as const;

function pixelResponse(body: BodyInit = TRANSPARENT_PIXEL) {
	return new NextResponse(body, { headers: PIXEL_HEADERS });
}

/**
 * Proxies open-tracking pixel requests from custom tracking domains.
 *
 * Customer tracking hosts (e.g. link.example.com) CNAME to link.reloop.sh,
 * so the pixel URL hits this app — not the mail service. We forward to the
 * real open-tracking endpoint on reloop.sh and always return a transparent
 * PNG so email clients never see a broken image.
 */
export async function GET(
	_request: Request,
	context: { params: Promise<{ token: string }> },
) {
	const { token } = await context.params;

	if (!token) {
		return pixelResponse();
	}

	try {
		const res = await fetch(getMailTrackOpenUrl(token), {
			method: "GET",
			cache: "no-store",
			headers: {
				Accept: "image/png,image/*;q=0.8,*/*;q=0.5",
				"User-Agent": "ReloopLinks/1.0",
			},
		});

		if (res.ok) {
			const body = await res.arrayBuffer();
			return new NextResponse(body, {
				headers: {
					"Content-Type":
						res.headers.get("Content-Type") ?? PIXEL_HEADERS["Content-Type"],
					"Cache-Control":
						res.headers.get("Cache-Control") ?? PIXEL_HEADERS["Cache-Control"],
				},
			});
		}
	} catch {
		// Fall through to transparent pixel.
	}

	// Always serve a pixel so open failures never break the email UI.
	return pixelResponse();
}
