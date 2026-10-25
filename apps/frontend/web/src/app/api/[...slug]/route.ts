import { getSiteUrl } from "@reloop/web/lib/site";

/** Unmatched `/api/*` paths answer in JSON, not the HTML 404 page, so API clients can parse them. */
function notFound(request: Request) {
	const site = getSiteUrl();
	const { pathname } = new URL(request.url);
	return Response.json(
		{
			error: "not_found",
			message: `No API endpoint at ${request.method} ${pathname}.`,
			hint: "Check the path and method against the OpenAPI spec.",
			docs: `${site}/docs/api`,
			openapi: `${site}/openapi.json`,
		},
		{ status: 404, headers: { "Cache-Control": "no-store" } },
	);
}

export {
	notFound as DELETE,
	notFound as GET,
	notFound as PATCH,
	notFound as POST,
	notFound as PUT,
};
