import { getMailTrackClickUrl } from "@reloop/links/lib/mail-api";
import { redirectToPath } from "@reloop/links/lib/site";
import { NextResponse } from "next/server";

/**
 * Proxies click-tracking from custom tracking domains to the mail service.
 *
 * Customer hosts (e.g. link.example.com) CNAME to link.reloop.sh, so the
 * browser hits this app. We forward to reloop.sh (or INTERNAL_MAIL_API_URL)
 * so the click is recorded, then return the same 302 Location.
 */
export async function GET(
	_request: Request,
	context: { params: Promise<{ token: string }> },
) {
	const { token } = await context.params;

	if (!token) {
		return redirectToPath("/");
	}

	let destination: string | null = null;

	try {
		const res = await fetch(getMailTrackClickUrl(token), {
			method: "GET",
			redirect: "manual",
			cache: "no-store",
			headers: {
				"User-Agent": "ReloopLinks/1.0",
				Accept: "text/html,application/xhtml+xml,*/*",
			},
		});

		const isRedirect = res.status >= 300 && res.status < 400;
		if (res.ok || isRedirect) {
			const location = res.headers.get("location");
			if (location) {
				destination = location;
			}
		}
	} catch {
		return redirectToPath("/");
	}

	if (!destination) {
		return redirectToPath("/");
	}

	// Absolute external destinations only; never open-redirect to relative paths
	// that could bounce around the tracking host.
	if (
		!destination.startsWith("http://") &&
		!destination.startsWith("https://")
	) {
		return redirectToPath("/");
	}

	return NextResponse.redirect(destination, 302);
}
