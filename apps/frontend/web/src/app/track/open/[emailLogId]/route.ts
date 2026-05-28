import { type NextRequest, NextResponse } from "next/server";

const TRANSPARENT_PIXEL = Buffer.from(
	"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
	"base64",
);

interface OpenRouteContext {
	params: Promise<{ emailLogId: string }>;
}

export async function GET(request: NextRequest, context: OpenRouteContext) {
	const { emailLogId } = await context.params;
	const { searchParams } = new URL(request.url);
	const sig = searchParams.get("sig");

	if (!sig) {
		return new NextResponse(TRANSPARENT_PIXEL, {
			headers: {
				"Content-Type": "image/png",
				"Cache-Control": "no-cache, no-store, must-revalidate",
			},
		});
	}

	const apiBaseUrl =
		process.env.NEXT_PUBLIC_API_URL || "https://local.reloop.sh/api";
	const trackingEndpoint = `${apiBaseUrl}/mail/v1/track/open/${emailLogId}?sig=${sig}`;

	try {
		// Forward request to backend to register the open event
		await fetch(trackingEndpoint, {
			method: "GET",
			cache: "no-store",
		});
	} catch (error) {
		console.error("Failed to track open event:", error);
	}

	// Always return the transparent 1x1 pixel image
	return new NextResponse(TRANSPARENT_PIXEL, {
		headers: {
			"Content-Type": "image/png",
			"Cache-Control": "no-cache, no-store, must-revalidate",
		},
	});
}
