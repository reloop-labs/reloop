import { t } from "elysia";

/**
 * Request and response fields for cursor pagination, shared by every list
 * endpoint so the OpenAPI document describes them identically. Pair with
 * the SQL helpers in @reloop/db/pagination.
 */

export const cursorQuery = {
	cursor: t.Optional(
		t.String({
			maxLength: 512,
			description:
				"Opaque cursor from a previous response's `nextCursor`. Returns the page after it; `page` is ignored when set. See https://reloop.sh/docs/api/pagination.",
		}),
	),
};

export const cursorPageFields = {
	hasMore: t.Boolean({
		description: "Whether more results exist after this page.",
	}),
	nextCursor: t.Union([t.String(), t.Null()], {
		description:
			"Pass as `cursor` to fetch the next page. `null` on the last page.",
	}),
};
