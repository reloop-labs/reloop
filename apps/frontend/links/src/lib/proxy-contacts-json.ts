import { getContactsPreferencesUrl } from "@reloop/links/lib/contacts-api";
import { NextResponse } from "next/server";

/**
 * Forward a JSON POST from a custom tracking host to the contacts service.
 * Browser calls stay same-origin on link.example.com; this route is the
 * only hop that knows the internal contacts URL.
 */
export async function proxyContactsPreferencePost(
	request: Request,
	path: string,
): Promise<NextResponse> {
	let upstream: Response;
	try {
		const body = await request.arrayBuffer();
		upstream = await fetch(getContactsPreferencesUrl(path), {
			method: "POST",
			cache: "no-store",
			headers: {
				"Content-Type":
					request.headers.get("content-type") ?? "application/json",
				"User-Agent": request.headers.get("user-agent") || "ReloopLinks/1.0",
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
