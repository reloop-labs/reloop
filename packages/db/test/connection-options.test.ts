import { describe, expect, test } from "bun:test";
import { connectionOptions } from "../src/connection-options";

describe("database connection options", () => {
	test("preserves the local database and driver pool defaults when unset", () => {
		expect(connectionOptions({}, {})).toEqual({
			connectionString: "postgresql://reloop:reloop123@localhost:5432/reloop",
			max: undefined,
		});
	});

	test("passes the Supabase URL and TLS parameters unchanged with a bounded pool", () => {
		const url =
			"postgresql://postgres.project:encoded%40password@aws-0-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=verify-full&sslrootcert=%2Frun%2Fsecrets%2Fsupabase.crt";
		expect(connectionOptions({}, { PG_URL: url, PG_POOL_MAX: "2" })).toEqual({
			connectionString: url,
			max: 2,
		});
	});

	test("explicit client options take precedence over environment settings", () => {
		expect(
			connectionOptions(
				{ databaseUrl: "postgresql://custom/db", max: 4 },
				{ PG_URL: "postgresql://environment/db", PG_POOL_MAX: "invalid" },
			),
		).toEqual({
			connectionString: "postgresql://custom/db",
			max: 4,
		});
	});

	test("schema credentials never replace the runtime connection", () => {
		expect(
			connectionOptions(
				{},
				{
					PG_URL: "postgresql://runtime/db",
					PG_MIGRATION_URL: "postgresql://migration/db",
				},
			).connectionString,
		).toBe("postgresql://runtime/db");
	});

	test("rejects invalid pool sizes rather than silently using a larger default", () => {
		for (const value of [
			"0",
			"-1",
			"1.5",
			"2connections",
			"Infinity",
			"99999999999999999999",
			" ",
		]) {
			expect(() => connectionOptions({}, { PG_POOL_MAX: value })).toThrow();
		}
		for (const max of [0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY]) {
			expect(() => connectionOptions({ max }, {})).toThrow();
		}
	});
});
