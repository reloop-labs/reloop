import { type AnyColumn, asc, desc, type SQL, sql } from "drizzle-orm";

/**
 * Cursor (keyset) pagination over `(created_at, id)`, shared by every list
 * endpoint. A cursor is an opaque base64url token naming the last row of the
 * previous page; the next page is every row strictly after it in sort order.
 *
 * Timestamps are compared truncated to milliseconds: Postgres stores
 * microseconds but a JS Date keeps milliseconds, so comparing raw columns
 * against a decoded cursor would skip rows created within the same
 * millisecond as the cursor row.
 */

export type CursorDirection = "asc" | "desc";

export type CursorColumns = { createdAt: AnyColumn; id: AnyColumn };

export type CursorPosition = { createdAt: Date; id: string };

export type CursorPage<T> = {
	items: T[];
	hasMore: boolean;
	nextCursor: string | null;
};

type CursorPayload = { t: string; i: string };

function invalidCursor(): Error {
	const why =
		"The cursor is malformed or was not returned by this endpoint's nextCursor.";
	const fix =
		"Pass the nextCursor value from the previous response unchanged, or omit cursor to start from the first page.";
	return Object.assign(new Error("Invalid cursor"), {
		status: 400,
		data: { status: 400, message: "Invalid cursor", why, fix },
	});
}

export function encodeCursor(row: {
	createdAt: Date | string;
	id: string;
}): string {
	const createdAt = new Date(row.createdAt);
	const payload: CursorPayload = { t: createdAt.toISOString(), i: row.id };
	return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

/** Throws a 400 error for anything encodeCursor did not produce. */
export function decodeCursor(value: string): CursorPosition {
	try {
		const payload = JSON.parse(
			Buffer.from(value, "base64url").toString("utf8"),
		) as Partial<CursorPayload>;
		const createdAt = new Date(payload.t ?? "");
		if (
			typeof payload.i !== "string" ||
			!payload.i ||
			Number.isNaN(createdAt.getTime())
		) {
			throw invalidCursor();
		}
		return { createdAt, id: payload.i };
	} catch {
		throw invalidCursor();
	}
}

const truncated = (column: AnyColumn) =>
	sql`date_trunc('milliseconds', ${column})`;

/** ORDER BY for cursor pagination; use instead of ordering by createdAt alone. */
export function cursorOrderBy(
	columns: CursorColumns,
	direction: CursorDirection = "desc",
): SQL[] {
	const order = direction === "desc" ? desc : asc;
	return [order(truncated(columns.createdAt)), order(columns.id)];
}

/** WHERE condition selecting rows after the cursor in sort order. */
export function afterCursor(
	columns: CursorColumns,
	cursor: CursorPosition,
	direction: CursorDirection = "desc",
): SQL {
	const op = direction === "desc" ? sql`<` : sql`>`;
	// Drizzle reads `timestamp` (no zone) wall time as UTC, so the ISO value
	// must be cast back the same way; `timestamptz` keeps the zone.
	const zoned = (columns.createdAt as { withTimezone?: boolean }).withTimezone;
	const at = zoned
		? sql`${cursor.createdAt.toISOString()}::timestamptz`
		: sql`${cursor.createdAt.toISOString()}::timestamp`;
	return sql`(${truncated(columns.createdAt)}, ${columns.id}) ${op} (${at}, ${cursor.id})`;
}

type CursorRow = { createdAt: Date | string; id: string };

/**
 * Turns `limit + 1` fetched rows into a page: drops the probe row and points
 * `nextCursor` at the last row returned. Pass `key` when the sort column is
 * not `createdAt` (it must be immutable, e.g. `enrolledAt`, for cursors to be
 * stable).
 */
export function toCursorPage<T extends CursorRow>(
	rows: T[],
	limit: number,
): CursorPage<T>;
export function toCursorPage<T>(
	rows: T[],
	limit: number,
	key: (row: T) => CursorRow,
): CursorPage<T>;
export function toCursorPage<T>(
	rows: T[],
	limit: number,
	key: (row: T) => CursorRow = (row) => row as CursorRow,
): CursorPage<T> {
	const hasMore = rows.length > limit;
	const items = hasMore ? rows.slice(0, limit) : rows;
	const last = items.at(-1);
	return {
		items,
		hasMore,
		nextCursor: hasMore && last !== undefined ? encodeCursor(key(last)) : null,
	};
}
