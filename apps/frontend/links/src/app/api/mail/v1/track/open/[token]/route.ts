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

function getMailOpenTrackingUrl(token: string): string {
	// Prefer a direct internal mail API base (same pattern as preferences → contacts).
	// e.g. http://localhost:8015/api/mail or https://reloop.sh/api/mail
	const internal = process.env.INTERNAL_MAIL_API_URL?.replace(/\/+$/, "");
	if (internal) {
		return `${internal}/v1/track/open/${token}`;
	}

	// Fall back to the public origin; reverse proxy routes /api/mail → mail service.
	// Same approach as /redirect/[token] for click tracking.
	const siteUrl = (
		process.env.NEXT_PUBLIC_URL || "https://local.reloop.sh"
	).replace(/\/+$/, "");
	return `${siteUrl}/api/mail/v1/track/open/${token}`;
}

function pixelResponse(body: BodyInit = TRANSPARENT_PIXEL) {
	return new NextResponse(body, { headers: PIXEL_HEADERS });
}

/**
 * Proxies open-tracking pixel requests from custom tracking domains.
 *
 * Customer tracking hosts (e.g. link.example.com) CNAME to link.reloop.sh,
 * so the pixel URL hits this app — not the mail service. We forward to the
 * real open-tracking endpoint and always return a transparent PNG so email
 * clients never see a broken image.
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
		const res = await fetch(getMailOpenTrackingUrl(token), {
			method: "GET",
			cache: "no-store",
			// Email clients often send image requests without cookies; don't forward auth.
			headers: {
				Accept: "image/png,image/*;q=0.8,*/*;q=0.5",
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
