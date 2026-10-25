import { getSiteUrl } from "@reloop/web/lib/site";

/** Public API services; each Elysia backend serves its own spec at `/api/<name>/openapi/json`. */
export const PUBLIC_API_SERVICES = [
	{ name: "mail", title: "Send email" },
	{ name: "inbox", title: "Agent inboxes" },
	{ name: "domain", title: "Domains" },
	{ name: "api-key", title: "API keys" },
	{ name: "webhook", title: "Webhooks" },
	{ name: "contacts", title: "Contacts" },
	{ name: "workflow", title: "Automations" },
	{ name: "logs", title: "Logs" },
	{ name: "upload", title: "Uploads" },
	{ name: "template", title: "Templates" },
	{ name: "campaigns", title: "Campaigns" },
	{ name: "tools", title: "Deliverability tools" },
] as const;

export const OPENAPI_CACHE_CONTROL =
	"public, max-age=300, s-maxage=3600, stale-while-revalidate=86400";

export function serviceSpecUrl(name: string, origin = getSiteUrl()): string {
	return `${origin}/api/${name}/openapi/json`;
}

type Spec = {
	info?: { version?: string };
	paths?: Record<string, unknown>;
	tags?: Array<{ name: string }>;
	components?: Record<string, Record<string, unknown>>;
};

/** Backends are reached through the public origin unless an internal one is set. */
function apiOrigin(): string {
	return (process.env.API_INTERNAL_URL ?? getSiteUrl()).replace(/\/$/, "");
}

async function fetchSpec(name: string): Promise<Spec | null> {
	try {
		const res = await fetch(serviceSpecUrl(name, apiOrigin()), {
			headers: { "User-Agent": "reloop-web/openapi-merge" },
			signal: AbortSignal.timeout(5000),
		});
		return res.ok ? ((await res.json()) as Spec) : null;
	} catch {
		return null;
	}
}

/** One OpenAPI document for the whole public API, merged from the per-service specs. */
export async function buildMergedOpenApi() {
	const siteUrl = getSiteUrl();
	const specs = await Promise.all(
		PUBLIC_API_SERVICES.map(async (service) => ({
			service,
			spec: await fetchSpec(service.name),
		})),
	);

	const paths: Record<string, unknown> = {};
	const tags = new Map<string, { name: string }>();
	const components: Record<string, Record<string, unknown>> = {};

	for (const { spec } of specs) {
		if (!spec) continue;
		Object.assign(paths, spec.paths);
		for (const tag of spec.tags ?? []) tags.set(tag.name, tag);
		for (const [kind, entries] of Object.entries(spec.components ?? {})) {
			components[kind] = { ...components[kind], ...entries };
		}
	}

	components.securitySchemes = {
		...components.securitySchemes,
		apiKey: {
			type: "apiKey",
			in: "header",
			name: "x-api-key",
			description:
				"Reloop API key (prefix `rl_`). Create one at https://reloop.sh/dashboard/api-keys.",
		},
		bearer: {
			type: "http",
			scheme: "bearer",
			description:
				"Reloop API key or OAuth access token as `Authorization: Bearer <token>`.",
		},
	};

	return {
		openapi: "3.0.3",
		info: {
			title: "Reloop API",
			version: "1.0.0",
			description:
				"Open-source email infrastructure: send email, manage domains, contacts, templates, webhooks, automations and agent inboxes. Errors are JSON with a `message` field.",
			contact: { name: "Reloop Labs", url: `${siteUrl}/contact` },
			license: { name: "Reloop License", url: `${siteUrl}/license` },
		},
		externalDocs: { description: "Reloop docs", url: `${siteUrl}/docs/api` },
		servers: [{ url: siteUrl, description: "Reloop Cloud" }],
		security: [{ apiKey: [] }, { bearer: [] }],
		tags: [...tags.values()],
		paths,
		components,
	};
}
