import { Elysia, ValidationError } from "elysia";
import { log, parseError } from "evlog";

/**
 * The one error shape every Reloop API service returns. `code` is a stable,
 * machine-readable identifier derived from the status (see API_ERROR_CODES);
 * `message`, `why` and `fix` are for people; `link` points at docs.
 */
export type ApiError = {
	code: string;
	message: string;
	why?: string;
	fix?: string;
	link: string;
	/** Per-field problems, on validation errors only. */
	errors?: ApiFieldError[];
};

export type ApiFieldError = { path: string; message: string };

export const API_ERRORS_DOCS_URL = "https://reloop.sh/docs/api/errors";

/** Stable `code` per HTTP status. Documented at /docs/api/errors. */
export const API_ERROR_CODES: Record<number, string> = {
	400: "bad_request",
	401: "unauthorized",
	402: "payment_required",
	403: "forbidden",
	404: "not_found",
	405: "method_not_allowed",
	409: "conflict",
	410: "gone",
	413: "payload_too_large",
	415: "unsupported_media_type",
	422: "validation_error",
	429: "rate_limited",
	500: "internal_error",
	502: "bad_gateway",
	503: "service_unavailable",
	504: "gateway_timeout",
};

export function apiErrorCode(status: number): string {
	return (
		API_ERROR_CODES[status] ??
		(status >= 500 ? "internal_error" : "bad_request")
	);
}

/** Builds an ApiError body, filling `code` and `link` when not given. */
export function apiError(
	status: number,
	body: Omit<ApiError, "code" | "link"> & { code?: string; link?: string },
): ApiError {
	return {
		...body,
		code: body.code ?? apiErrorCode(status),
		link: body.link ?? API_ERRORS_DOCS_URL,
	};
}

function pathnameOf(request: Request): string {
	try {
		return new URL(request.url).pathname;
	} catch {
		return request.url;
	}
}

/** Better Auth and TypeBox sometimes put a JSON document in `message`. */
function readableMessage(message: string): string {
	if (!message.trim().startsWith("{")) return message;
	try {
		const json = JSON.parse(message) as {
			summary?: unknown;
			message?: unknown;
			errors?: Array<{ summary?: unknown }>;
		};
		if (typeof json.summary === "string") return json.summary;
		if (typeof json.errors?.[0]?.summary === "string") {
			return json.errors[0].summary;
		}
		if (typeof json.message === "string" && !json.message.startsWith("{")) {
			return json.message;
		}
	} catch {}
	return "Request failed";
}

function validationErrors(error: ValidationError): ApiFieldError[] {
	try {
		return error.all
			.filter((e): e is typeof e & { path: string; summary: string } =>
				Boolean(e.summary && "path" in e),
			)
			.slice(0, 20)
			.map((e) => ({ path: e.path || "/", message: e.summary }));
	} catch {
		return [];
	}
}

/** Maps any thrown error to a status and ApiError body. Exported for tests. */
export function toApiError(
	code: string | number,
	error: unknown,
	request: Request,
): { status: number; body: ApiError } {
	if (code === "VALIDATION" && error instanceof ValidationError) {
		const on = error.type || "request";
		return {
			status: 422,
			body: apiError(422, {
				message: "Invalid request",
				why: `The ${on} did not match the schema for this endpoint.`,
				fix: "Fix the fields listed in `errors` and retry. Schemas are in the OpenAPI document at https://reloop.sh/openapi.json.",
				errors: validationErrors(error),
			}),
		};
	}
	if (code === "NOT_FOUND") {
		return {
			status: 404,
			body: apiError(404, {
				message: "Not found",
				why: `No endpoint matches ${request.method} ${pathnameOf(request)}.`,
				fix: "Check the method and path against the OpenAPI document at https://reloop.sh/openapi.json.",
			}),
		};
	}
	if (code === "PARSE") {
		return {
			status: 400,
			body: apiError(400, {
				message: "Malformed request body",
				why: "The request body could not be parsed.",
				fix: "Send valid JSON with `Content-Type: application/json`.",
			}),
		};
	}

	const parsed = parseError(error);
	const status =
		Number.isInteger(parsed.status) &&
		parsed.status >= 400 &&
		parsed.status < 600
			? parsed.status
			: 500;
	// Errors created on purpose (createError, status()) carry `data`; any other
	// 5xx is unexpected and its message may expose internals such as SQL.
	const deliberate = Boolean(
		error && typeof error === "object" && "data" in error,
	);
	if (status >= 500 && !deliberate) {
		log.error({
			message: "Unhandled API error",
			error: parsed.message,
			path: pathnameOf(request),
		});
		return {
			status,
			body: apiError(status, {
				message: "Internal server error",
				why: "Something went wrong on our side.",
				fix: "Retry the request. If it keeps failing, contact support@reloop.sh.",
			}),
		};
	}
	return {
		status,
		body: apiError(status, {
			message: readableMessage(parsed.message),
			why: parsed.why,
			fix: parsed.fix,
			link: parsed.link,
		}),
	};
}

type StatusResponse = { code: number; response: unknown };

function isStatusResponse(value: unknown): value is StatusResponse {
	return (
		!!value &&
		typeof value === "object" &&
		typeof (value as { code?: unknown }).code === "number" &&
		"response" in value
	);
}

function isErrorBody(value: unknown): value is Record<string, unknown> {
	return (
		!!value &&
		typeof value === "object" &&
		!Array.isArray(value) &&
		typeof (value as { message?: unknown }).message === "string"
	);
}

const json = (status: number, body: unknown) =>
	new Response(JSON.stringify(body), {
		status,
		headers: { "content-type": "application/json" },
	});

/**
 * Shared error handling for every API service: maps thrown errors (including
 * validation, unknown routes and malformed JSON) to ApiError, and adds `code`
 * and `link` to error bodies that routes return directly. Replaces per-service
 * `.onError(...)`. Apply once on the root app, before routes.
 */
export function apiErrorsPlugin() {
	return (
		new Elysia({ name: "reloop-api-errors" })
			.onError(({ code, error, set, request }) => {
				const result = toApiError(code, error, request);
				set.status = result.status;
				return result.body;
			})
			// Raw Responses skip route response schemas, which may forbid `code`.
			.onAfterHandle(({ responseValue, set }) => {
				if (isStatusResponse(responseValue)) {
					const { code: status, response } = responseValue;
					if (status < 400 || !isErrorBody(response) || "code" in response) {
						return;
					}
					return json(status, apiError(status, response as ApiError));
				}
				const status = typeof set.status === "number" ? set.status : 200;
				if (status < 400 || !isErrorBody(responseValue)) return;
				if ("code" in responseValue) return;
				return json(status, apiError(status, responseValue as ApiError));
			})
			.as("global")
	);
}
