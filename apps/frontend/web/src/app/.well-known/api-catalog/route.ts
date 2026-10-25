import {
	OPENAPI_CACHE_CONTROL,
	PUBLIC_API_SERVICES,
	serviceSpecUrl,
} from "@reloop/web/lib/openapi";
import { getSiteUrl } from "@reloop/web/lib/site";

const CONTENT_TYPE =
	'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"';

function linkset() {
	const site = getSiteUrl();
	return {
		linkset: [
			{
				anchor: `${site}/api`,
				"service-desc": [
					{ href: `${site}/openapi.json`, type: "application/json" },
				],
				"service-doc": [{ href: `${site}/docs/api`, type: "text/html" }],
				"service-meta": [{ href: `${site}/llms-docs.txt`, type: "text/plain" }],
			},
			...PUBLIC_API_SERVICES.map((service) => ({
				anchor: `${site}/api/${service.name}`,
				title: service.title,
				"service-desc": [
					{
						href: serviceSpecUrl(service.name, site),
						type: "application/json",
					},
				],
				"service-doc": [
					{ href: `${site}/docs/api/${service.name}`, type: "text/html" },
				],
				status: [
					{
						href: `${site}/api/${service.name}/health`,
						type: "application/json",
					},
				],
			})),
		],
	};
}

const headers = {
	"Content-Type": CONTENT_TYPE,
	"Cache-Control": OPENAPI_CACHE_CONTROL,
	"Access-Control-Allow-Origin": "*",
	Link: '</.well-known/api-catalog>; rel="api-catalog"',
};

/** RFC 9727 API catalog: where agents find the Reloop OpenAPI specs. */
export function GET() {
	return new Response(JSON.stringify(linkset(), null, 2), { headers });
}

export function HEAD() {
	return new Response(null, { headers });
}
