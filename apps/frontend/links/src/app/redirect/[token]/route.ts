import { resolveClickDestination } from "@reloop/links/lib/mail-api";
import { redirectToPath } from "@reloop/links/lib/site";
import { NextResponse } from "next/server";

export async function GET(
	_request: Request,
	context: { params: Promise<{ token: string }> },
) {
	const { token } = await context.params;

	if (!token) {
		return redirectToPath("/");
	}

	const destination = await resolveClickDestination(token);

	if (
		!destination ||
		(!destination.startsWith("http://") && !destination.startsWith("https://"))
	) {
		return redirectToPath("/");
	}

	return NextResponse.redirect(destination, 302);
}
