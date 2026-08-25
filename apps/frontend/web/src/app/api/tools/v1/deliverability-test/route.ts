export async function POST(req: Request) {
	try {
		const beToolsUrl = process.env.TOOLS_SERVICE_URL || "http://127.0.0.1:8026";
		const clientIp = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";

		const res = await fetch(`${beToolsUrl}/api/tools/v1/deliverability-test`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-Forwarded-For": clientIp,
				"User-Agent": req.headers.get("user-agent") || "ReloopWeb/1.0",
			},
		});

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
