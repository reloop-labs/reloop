/**
 * Liveness/readiness probe used by the Dockerfile HEALTHCHECK and Coolify.
 * Coolify only performs a rolling update (start new container → wait for
 * healthy → stop old container) when the health check passes, so this must
 * stay cheap, dependency-free and always return 200 once the server is up.
 */
export function GET() {
	return Response.json(
		{ status: "ok" },
		{ headers: { "Cache-Control": "no-store" } },
	);
}
