import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import {
	afterCursor,
	type CursorDirection,
	cursorOrderBy,
	decodeCursor,
	encodeCursor,
	toCursorPage,
} from "@reloop/db/pagination";
import { sql } from "drizzle-orm";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

describe("cursor encoding", () => {
	test("round-trips createdAt and id", () => {
		const createdAt = new Date("2026-10-25T10:00:00.123Z");
		expect(decodeCursor(encodeCursor({ createdAt, id: "con_1" }))).toEqual({
			createdAt,
			id: "con_1",
		});
	});

	test("rejects tampered cursors with a 400", () => {
		for (const bad of ["", "not-base64", btoa('{"t":"nope","i":"x"}')]) {
			try {
				decodeCursor(bad);
				throw new Error("expected decodeCursor to throw");
			} catch (error) {
				expect((error as { status?: number }).status).toBe(400);
				expect((error as Error).message).toBe("Invalid cursor");
			}
		}
	});

	test("toCursorPage drops the probe row and points at the last item", () => {
		const rows = [1, 2, 3].map((n) => ({
			id: `r${n}`,
			createdAt: new Date(Date.UTC(2026, 0, n)),
		}));
		const page = toCursorPage(rows, 2);
		expect(page.items.map((r) => r.id)).toEqual(["r1", "r2"]);
		expect(page.hasMore).toBe(true);
		expect(decodeCursor(page.nextCursor ?? "").id).toBe("r2");
		expect(toCursorPage(rows, 3)).toMatchObject({
			hasMore: false,
			nextCursor: null,
		});
	});
});

const plain = pgTable("cursor_test_plain", {
	id: text("id").primaryKey(),
	createdAt: timestamp("created_at", { precision: 6 }).notNull(),
});
const zoned = pgTable("cursor_test_zoned", {
	id: text("id").primaryKey(),
	createdAt: timestamp("created_at", {
		precision: 6,
		withTimezone: true,
	}).notNull(),
});

let db: NodePgDatabase | null = null;

beforeAll(async () => {
	const candidate = drizzle({
		connection: {
			connectionString:
				process.env.PG_URL ||
				"postgresql://reloop:reloop123@localhost:5432/reloop",
			max: 1,
			connectionTimeoutMillis: 1000,
		},
	});
	try {
		await candidate.execute(sql`select 1`);
	} catch {
		return;
	}
	await candidate.execute(sql`set time zone 'Asia/Kolkata'`);
	for (const name of ["cursor_test_plain", "cursor_test_zoned"]) {
		const type =
			name === "cursor_test_zoned" ? sql`timestamptz(6)` : sql`timestamp(6)`;
		await candidate.execute(
			sql`create temp table ${sql.identifier(name)} (id text primary key, created_at ${type} not null)`,
		);
		// Three rows share one millisecond; ids are deliberately unordered.
		await candidate.execute(sql`insert into ${sql.identifier(name)} values
			('m', '2026-10-25 10:00:00.123456'), ('c', '2026-10-25 10:00:00.123100'),
			('x', '2026-10-25 10:00:00.123900'), ('a', '2026-10-25 10:00:01'),
			('z', '2026-10-25 09:59:59'), ('b', '2026-10-25 10:00:02.5'),
			('q', '2026-10-25 10:00:00.124')`);
	}
	db = candidate;
});

afterAll(async () => {
	await (db?.$client as { end?: () => Promise<void> } | undefined)?.end?.();
});

async function walk(
	table: typeof plain | typeof zoned,
	direction: CursorDirection,
	limit: number,
): Promise<string[]> {
	const seen: string[] = [];
	let cursor: string | null = null;
	for (let i = 0; i < 20; i++) {
		const rows = await (db as NodePgDatabase)
			.select()
			.from(table)
			.where(
				cursor
					? afterCursor(table, decodeCursor(cursor), direction)
					: undefined,
			)
			.orderBy(...cursorOrderBy(table, direction))
			.limit(limit + 1);
		const page = toCursorPage(rows, limit);
		seen.push(...page.items.map((r) => r.id));
		if (!page.hasMore) return seen;
		cursor = page.nextCursor;
	}
	throw new Error("pagination did not terminate");
}

describe("cursor pagination against Postgres", () => {
	for (const [label, table] of [
		["timestamp", plain],
		["timestamptz", zoned],
	] as const) {
		for (const direction of ["desc", "asc"] as const) {
			for (const limit of [1, 2, 3]) {
				test(`${label} ${direction} limit ${limit} visits every row once`, async () => {
					if (!db) return;
					const all = await db
						.select({ id: table.id })
						.from(table)
						.orderBy(...cursorOrderBy(table, direction));
					const ids = await walk(table, direction, limit);
					expect(ids).toEqual(all.map((r) => r.id));
					expect(new Set(ids).size).toBe(7);
				});
			}
		}
	}
});

describe("toCursorPage with a custom key", () => {
	test("encodes the given sort column", () => {
		const rows = [1, 2].map((n) => ({
			id: `e${n}`,
			enrolledAt: new Date(Date.UTC(2026, 0, n)),
		}));
		const page = toCursorPage(rows, 1, (row) => ({
			createdAt: row.enrolledAt,
			id: row.id,
		}));
		expect(decodeCursor(page.nextCursor ?? "")).toEqual({
			createdAt: new Date(Date.UTC(2026, 0, 1)),
			id: "e1",
		});
	});
});
