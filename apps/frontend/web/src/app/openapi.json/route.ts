import {
	buildMergedOpenApi,
	OPENAPI_CACHE_CONTROL,
} from "@reloop/web/lib/openapi";

/** The whole public Reloop API as one OpenAPI document. */
export async function GET() {
	return Response.json(await buildMergedOpenApi(), {
		headers: {
			"Cache-Control": OPENAPI_CACHE_CONTROL,
			"Access-Control-Allow-Origin": "*",
		},
	});
}
