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

const ERROR_REF = { $ref: "#/components/schemas/Error" };

/**
 * The error body every service returns (`apiErrorsPlugin` in
 * packages/auth/src/middleware/api-errors.ts). Keep the two in sync.
 */
const errorComponents = {
	schemas: {
		Error: {
			type: "object",
			description:
				"Error returned by every Reloop API endpoint. Branch on `code`; show `message`, `why` and `fix` to people. See https://reloop.sh/docs/api/errors.",
			required: ["code", "message", "link"],
			properties: {
				code: {
					type: "string",
					description:
						"Stable machine-readable error code, e.g. `validation_error`, `unauthorized`, `not_found`, `conflict`, `rate_limited`, `internal_error`.",
					example: "validation_error",
				},
				message: {
					type: "string",
					description: "Short summary of what went wrong.",
				},
				why: { type: "string", description: "Why it went wrong." },
				fix: { type: "string", description: "How to fix it." },
				link: {
					type: "string",
					format: "uri",
					description: "Documentation for this error.",
				},
				errors: {
					type: "array",
					description: "Per-field problems. Present on `validation_error`.",
					items: { $ref: "#/components/schemas/FieldError" },
				},
			},
		},
		FieldError: {
			type: "object",
			required: ["path", "message"],
			properties: {
				path: {
					type: "string",
					description: "JSON Pointer to the invalid field, e.g. `/email`.",
				},
				message: { type: "string" },
			},
		},
	},
	responses: {
		ValidationError: {
			description:
				"The request did not match the endpoint's schema (`code: validation_error`).",
			content: { "application/json": { schema: ERROR_REF } },
		},
		RateLimited: {
			description:
				"Too many requests (`code: rate_limited`). Wait for the `Retry-After` delay. See https://reloop.sh/docs/api/usage-limits.",
			content: { "application/json": { schema: ERROR_REF } },
		},
		InternalError: {
			description: "Unexpected server error (`code: internal_error`).",
			content: { "application/json": { schema: ERROR_REF } },
		},
	},
};

type JsonSchema = Record<string, unknown> & {
	properties?: Record<string, Record<string, unknown>>;
};

/**
 * Points an inline error schema at the shared Error. Route-specific message
 * values (const/enum) are kept as a refinement so no detail is lost.
 */
function toErrorSchema(
	schema: JsonSchema | undefined,
): Record<string, unknown> {
	const message = schema?.properties?.message;
	if (message && ("const" in message || "enum" in message)) {
		return {
			allOf: [ERROR_REF, { type: "object", properties: { message } }],
		};
	}
	return ERROR_REF;
}

/** Every 4xx/5xx uses the shared Error; adds the errors any endpoint can return. */
export function addErrorModel(paths: Record<string, unknown>): void {
	for (const item of Object.values(paths)) {
		for (const [method, op] of Object.entries(
			item as Record<string, Operation & { requestBody?: unknown }>,
		)) {
			if (!["get", "post", "put", "patch", "delete"].includes(method)) {
				continue;
			}
			op.responses ??= {};
			for (const [code, response] of Object.entries(op.responses)) {
				if (!/^[45]/.test(code) || "$ref" in response) continue;
				const content = response.content as
					| Record<string, { schema?: JsonSchema }>
					| undefined;
				response.content = {
					"application/json": {
						schema: toErrorSchema(content?.["application/json"]?.schema),
					},
				};
			}
			if (op.requestBody || op.parameters?.length) {
				op.responses["422"] ??= {
					$ref: "#/components/responses/ValidationError",
				};
			}
			op.responses["429"] ??= { $ref: "#/components/responses/RateLimited" };
			op.responses["500"] ??= {
				$ref: "#/components/responses/InternalError",
			};
		}
	}
}

const VERSIONING_POLICY_URL = "https://reloop.sh/docs/api/versioning";

const deprecationComponents = {
	headers: {
		Deprecation: {
			description:
				"Present when the endpoint is deprecated: when it was deprecated, as `@<unix seconds>` (RFC 9745).",
			schema: { type: "string", example: "@1793491200" },
		},
		Sunset: {
			description:
				"Present when the endpoint is deprecated: the date after which it may be removed, as an HTTP-date (RFC 8594).",
			schema: { type: "string", example: "Sat, 01 May 2027 00:00:00 GMT" },
		},
	},
};

/** Documents Deprecation/Sunset on every response of deprecated operations. */
export function addDeprecationHeaders(paths: Record<string, unknown>): void {
	for (const item of Object.values(paths)) {
		for (const op of Object.values(
			item as Record<string, Operation & { deprecated?: boolean }>,
		)) {
			if (!op?.deprecated || !op.responses) continue;
			for (const response of Object.values(op.responses)) {
				if ("$ref" in response) continue;
				response.headers = {
					...(response.headers as Record<string, unknown> | undefined),
					Deprecation: { $ref: "#/components/headers/Deprecation" },
					Sunset: { $ref: "#/components/headers/Sunset" },
				};
			}
		}
	}
}

/**
 * Services whose POST operations accept `Idempotency-Key` (backend
 * `idempotencyPlugin`, or mail send's own handling). Keep in sync with the
 * `.use(idempotencyPlugin(...))` calls in apps/backend/<service>/src/index.ts.
 */
const IDEMPOTENT_SERVICES = [
	"mail",
	"inbox",
	"domain",
	"webhook",
	"contacts",
	"workflow",
	"template",
	"campaigns",
];

/** POSTs excluded there because their responses carry secrets. */
const NON_IDEMPOTENT_PATHS = new Set([
	"/api/webhook/v1/",
	"/api/inbox/v1/webhooks/",
]);

type Operation = {
	parameters?: Array<Record<string, unknown>>;
	responses?: Record<string, Record<string, unknown>>;
};

export function supportsIdempotencyKey(path: string): boolean {
	if (NON_IDEMPOTENT_PATHS.has(path)) return false;
	return IDEMPOTENT_SERVICES.some((name) => path.startsWith(`/api/${name}/`));
}

const idempotencyComponents = {
	parameters: {
		IdempotencyKey: {
			name: "Idempotency-Key",
			in: "header",
			required: false,
			description:
				"Unique key (for example a UUID) that makes retries safe. The first successful response is stored for 24 hours and replayed for retries with the same key and body. See https://reloop.sh/docs/api/idempotency.",
			schema: { type: "string", maxLength: 255 },
		},
	},
	headers: {
		IdempotentReplayed: {
			description:
				"`true` when this response is a replay of an earlier request with the same Idempotency-Key.",
			schema: { type: "string", enum: ["true"] },
		},
	},
	responses: {
		IdempotencyConflict: {
			description:
				"A request with this Idempotency-Key is still in progress (`code: idempotency_in_progress`). Retry after the `Retry-After` delay.",
			content: { "application/json": { schema: ERROR_REF } },
		},
		IdempotencyKeyReused: {
			description:
				"This Idempotency-Key was already used with a different request body or endpoint (`code: idempotency_key_reused`).",
			content: { "application/json": { schema: ERROR_REF } },
		},
	},
};

/** Declares Idempotency-Key, its replay header and its 409/422 on supported POSTs. */
function addIdempotency(paths: Record<string, unknown>): void {
	for (const [path, item] of Object.entries(paths)) {
		const op = (item as { post?: Operation }).post;
		if (!op || !supportsIdempotencyKey(path)) continue;

		op.parameters = [
			...(op.parameters ?? []).filter(
				(p) => String(p.name).toLowerCase() !== "idempotency-key",
			),
			{ $ref: "#/components/parameters/IdempotencyKey" },
		];
		op.responses ??= {};
		for (const [code, response] of Object.entries(op.responses)) {
			if (!code.startsWith("2") || "$ref" in response) continue;
			response.headers = {
				...(response.headers as Record<string, unknown> | undefined),
				"Idempotent-Replayed": {
					$ref: "#/components/headers/IdempotentReplayed",
				},
			};
		}
		op.responses["409"] ??= {
			$ref: "#/components/responses/IdempotencyConflict",
		};
		op.responses["422"] ??= {
			$ref: "#/components/responses/IdempotencyKeyReused",
		};
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

	addErrorModel(paths);
	addIdempotency(paths);
	addDeprecationHeaders(paths);
	for (const extra of [
		errorComponents,
		idempotencyComponents,
		deprecationComponents,
	]) {
		for (const [kind, entries] of Object.entries(extra)) {
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
			description: `Open-source email infrastructure: send email, manage domains, contacts, templates, webhooks, automations and agent inboxes. Every error is JSON matching the \`Error\` schema, with a stable \`code\`. The API is versioned in the URL (\`/v1\`); breaking changes ship as a new version, and deprecated endpoints send \`Deprecation\` and \`Sunset\` headers at least 180 days before removal. Policy: ${VERSIONING_POLICY_URL}`,
			contact: { name: "Reloop Labs", url: `${siteUrl}/contact` },
			license: { name: "Reloop License", url: `${siteUrl}/license` },
		},
		externalDocs: { description: "Reloop docs", url: `${siteUrl}/docs/api` },
		"x-api-lifecycle": {
			versioning: "url",
			currentVersion: "v1",
			deprecationPolicy: VERSIONING_POLICY_URL,
			minimumSunsetNoticeDays: 180,
		},
		servers: [{ url: siteUrl, description: "Reloop Cloud" }],
		security: [{ apiKey: [] }, { bearer: [] }],
		tags: [...tags.values()],
		paths,
		components,
	};
}
