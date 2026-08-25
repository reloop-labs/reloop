export async function GET(
	req: Request,
	{ params }: { params: Promise<{ token: string }> },
) {
	try {
		const { token } = await params;
		const beToolsUrl = process.env.TOOLS_SERVICE_URL || "http://127.0.0.1:8026";

		const res = await fetch(
			`${beToolsUrl}/api/tools/v1/deliverability-test/${encodeURIComponent(token)}`,
			{
				method: "GET",
				headers: {
					Accept: "application/json",
					"User-Agent": req.headers.get("user-agent") || "ReloopWeb/1.0",
				},
				cache: "no-store",
			},
		);

		const data = await res.json();
		return Response.json(data, { status: res.status });
	} catch (err) {
		return Response.json(
			{
				message: (err as Error).message || "Failed to reach tools service.",
				why: "The Next.js proxy could not contact the tools backend.",
			},
			{ status: 500 },
		);
	}
}
