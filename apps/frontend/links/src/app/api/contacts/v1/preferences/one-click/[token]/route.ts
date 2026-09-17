import { getContactsOneClickUrl } from "@reloop/links/lib/contacts-api";
import { NextResponse } from "next/server";

/**
 * One-click unsubscribe proxy (RFC 8058) on the tracking domain.
 *
 * Customer hosts (e.g. link.example.com) CNAME to link.reloop.sh, so Gmail's
 * List-Unsubscribe POST lands on the same domain family as the sender instead
 * of a foreign API host. We forward to the contacts service and mirror its
 * status/body. A 502 on upstream failure lets providers retry.
 *
 * GET must not unsubscribe (RFC 8058: scanners may fetch the URI). Send the
 * person to the confirmation page instead.
 */
export async function GET(
	request: Request,
	context: { params: Promise<{ token: string }> },
) {
	const { token } = await context.params;
	if (!token) {
		return NextResponse.json(
			{ message: "Missing unsubscribe token" },
			{ status: 404 },
		);
	}
	const dest = new URL(request.url);
	dest.pathname = `/preferences/unsubscribe/${encodeURIComponent(token)}`;
	dest.search = "";
	dest.hash = "";
	return NextResponse.redirect(dest, 302);
}

export async function POST(
	request: Request,
	context: { params: Promise<{ token: string }> },
) {
	const { token } = await context.params;

	if (!token) {
		return NextResponse.json(
			{ message: "Missing unsubscribe token" },
			{ status: 404 },
		);
	}

	let upstream: Response;
	try {
		const contentType =
			request.headers.get("content-type") ??
			"application/x-www-form-urlencoded";
		const body = await request.arrayBuffer();
		upstream = await fetch(getContactsOneClickUrl(token), {
			method: "POST",
			cache: "no-store",
			headers: {
				"Content-Type": contentType,
				"User-Agent": "ReloopLinks/1.0",
			},
			body: body.byteLength > 0 ? body : undefined,
		});
	} catch {
		return NextResponse.json(
			{ message: "Unsubscribe service unavailable" },
			{ status: 502 },
		);
	}

	let payload: unknown = null;
	try {
		payload = await upstream.json();
	} catch {
		payload = null;
	}

	if (payload !== null) {
		return NextResponse.json(payload, { status: upstream.status });
	}
	return new NextResponse(null, { status: upstream.status });
}
