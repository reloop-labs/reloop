import { NextResponse } from "next/server";

export async function GET() {
	try {
		const res = await fetch("https://rybbit.reloop.sh/api/script.js", {
			next: { revalidate: 3600 }, // Revalidate every hour on the server
		});

		if (!res.ok) {
			return new NextResponse("Not found", { status: 404 });
		}

		const text = await res.text();

		return new NextResponse(text, {
			headers: {
				"Content-Type": "application/javascript; charset=utf-8",
				// 1 year cache TTL to satisfy Lighthouse
				"Cache-Control": "public, max-age=31536000, immutable",
			},
		});
	} catch (error) {
		return new NextResponse("Internal Error", { status: 500 });
	}
}
