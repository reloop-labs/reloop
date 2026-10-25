import { Elysia } from "elysia";

export const DEPRECATION_POLICY_URL = "https://reloop.sh/docs/api/versioning";

/** Minimum notice between deprecating an endpoint and removing it. */
export const MIN_SUNSET_NOTICE_DAYS = 180;

export type DeprecationOptions = {
	/** When the endpoint was deprecated, as an ISO date (e.g. "2026-11-01"). */
	since: string;
	/**
	 * When the endpoint may be removed, as an ISO date. Must be at least
	 * MIN_SUNSET_NOTICE_DAYS after `since`.
	 */
	sunset: string;
	/** Path or URL of the replacement endpoint, if there is one. */
	successor?: string;
};

function parseDate(value: string, field: string): Date {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		throw new Error(`deprecated.${field} is not a valid date: ${value}`);
	}
	return date;
}

/**
 * Response headers for a deprecated endpoint: `Deprecation` (RFC 9745,
 * `@<unix seconds>`), `Sunset` (RFC 8594, HTTP-date) and `Link` to the
 * policy and the successor. Throws on dates that break the notice policy,
 * so a bad annotation fails at startup, not in front of clients.
 */
export function buildDeprecationHeaders(
	opts: DeprecationOptions,
): Record<string, string> {
	const since = parseDate(opts.since, "since");
	const sunset = parseDate(opts.sunset, "sunset");
	const noticeDays = (sunset.getTime() - since.getTime()) / 86_400_000;
	if (noticeDays < MIN_SUNSET_NOTICE_DAYS) {
		throw new Error(
			`deprecated.sunset must be at least ${MIN_SUNSET_NOTICE_DAYS} days after since (got ${Math.floor(noticeDays)})`,
		);
	}

	const links = [`<${DEPRECATION_POLICY_URL}>; rel="deprecation"`];
	if (opts.successor) {
		links.push(`<${opts.successor}>; rel="successor-version"`);
	}
	return {
		deprecation: `@${Math.floor(since.getTime() / 1000)}`,
		sunset: sunset.toUTCString(),
		link: links.join(", "),
	};
}

/**
 * Adds a `deprecated` route option. Use it in the route module:
 *
 *   new Elysia().use(deprecationPlugin).get("/old", handler, {
 *     deprecated: { since: "2026-11-01", sunset: "2027-05-01", successor: "/api/x/v1/new" },
 *   })
 *
 * Every response from the route (including errors) carries the headers, and
 * the OpenAPI operation is marked `deprecated` with `x-sunset`.
 */
export const deprecationPlugin = new Elysia({
	name: "reloop-deprecation",
}).macro({
	deprecated(opts: DeprecationOptions) {
		const headers = buildDeprecationHeaders(opts);
		return {
			detail: {
				deprecated: true,
				"x-sunset": new Date(opts.sunset).toISOString().slice(0, 10),
				...(opts.successor ? { "x-successor": opts.successor } : {}),
			},
			// Runs before body validation, so 422s carry the headers too.
			transform({ set }) {
				for (const [key, value] of Object.entries(headers)) {
					const existing = set.headers[key];
					set.headers[key] =
						key === "link" && typeof existing === "string" && existing
							? `${existing}, ${value}`
							: value;
				}
			},
		};
	},
});
