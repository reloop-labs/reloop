export async function POST(req: Request) {
	try {
		const body = await req.json();
		const beToolsUrl = process.env.TOOLS_SERVICE_URL || "http://127.0.0.1:8026";

		const res = await fetch(`${beToolsUrl}/api/tools/v1/blocklist-check`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});

		const data = await res.json();
		return Response.json(data, { status: res.status });
	} catch (err) {
		return Response.json(
			{
				message: (err as Error).message || "Failed to reach tools service.",
				why: "The Next.js proxy could not contact the tools service.",
			},
			{ status: 500 },
		);
	}
}

export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const target = searchParams.get("target") || "";
		const beToolsUrl = process.env.TOOLS_SERVICE_URL || "http://127.0.0.1:8026";

		const res = await fetch(
			`${beToolsUrl}/api/tools/v1/blocklist-check?target=${encodeURIComponent(target)}`,
			{
				method: "GET",
			},
		);

		const data = await res.json();
		return Response.json(data, { status: res.status });
	} catch (err) {
		return Response.json(
			{
				message: (err as Error).message || "Failed to reach tools service.",
				why: "The Next.js proxy could not contact the tools service.",
			},
			{ status: 500 },
		);
	}
}
