import { resolveClickDestination } from "@reloop/links/lib/mail-api";
import { NextResponse } from "next/server";

/**
 * Email click entrypoint on the tracking host.
 *
 * Injected links look like:
 *   https://link.customer.com/redirect/{token}
 * (customer CNAME → link.reloop.sh → this app)
 *
 * Records the click via `${NEXT_PUBLIC_URL}/api/mail/v1/track/click/{token}`
 * (Next API → mail service) and returns a real HTTP 302.
 */
export async function GET(
	_request: Request,
	context: { params: Promise<{ token: string }> },
) {
	const { token } = await context.params;

	if (!token) {
		return NextResponse.redirect(new URL("/", _request.url), 302);
	}

	const destination = await resolveClickDestination(token);

	if (
		!destination ||
		(!destination.startsWith("http://") && !destination.startsWith("https://"))
	) {
		return NextResponse.redirect(new URL("/", _request.url), 302);
	}

	return NextResponse.redirect(destination, 302);
}
