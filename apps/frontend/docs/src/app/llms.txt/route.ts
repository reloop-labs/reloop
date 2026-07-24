import { readFileSync } from "node:fs";
import { join } from "node:path";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest) {
	// Kept outside `public/` so it doesn't conflict with this App Router route.
	const filePath = join(process.cwd(), "llms.txt");

	try {
		const content = readFileSync(filePath, "utf-8");
		return new NextResponse(content, {
			status: 200,
			headers: {
				"Content-Type": "text/plain; charset=utf-8",
				"Cache-Control": "public, max-age=3600, s-maxage=86400",
				"Content-Signal": "ai-train=yes, search=yes, ai-input=yes",
			},
		});
	} catch {
		return new NextResponse("llms.txt not found", { status: 404 });
	}
}
