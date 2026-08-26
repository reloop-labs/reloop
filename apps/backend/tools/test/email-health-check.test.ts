import { describe, expect, mock, test } from "bun:test";

const sessionStore = new Map<string, string>();
const sessionCounters = new Map<string, number>();

mock.module("@be/tools/utils/loader", () => ({
	redis: {
		set: async (key: string, value: string, _seconds?: number) => {
			sessionStore.set(key, value);
		},
		get: async (key: string): Promise<string | null> => {
			return sessionStore.get(key) ?? null;
		},
		increment: async (key: string): Promise<number> => {
			const next = (sessionCounters.get(key) ?? 0) + 1;
			sessionCounters.set(key, next);
			return next;
		},
		expire: async (_key: string, _seconds: number): Promise<void> => {},
		ttl: async (_key: string): Promise<number> => -1,
		healthCheck: async (): Promise<boolean> => true,
	},
	loader: async () => {},
}));

import {
	parseCsvOrTextContent,
	parseJsonEmailArray,
} from "../src/routes/tools/email-health-check/csv-parser";
import { singleEmailHealthCheckController } from "../src/routes/tools/email-health-check/email-health-check.controllers";
import {
	createBatchJobRecord,
	getBatchJobRecord,
	processBatchJob,
} from "../src/routes/tools/email-health-check/job-processor";

const mxOk =
	(...records: string[]) =>
	async () => ({
		status: "ok" as const,
		records,
	});

const mxEmpty = async () => ({
	status: "empty" as const,
	records: [] as [],
});

describe("singleEmailHealthCheckController", () => {
	test("evaluates deliverable address with pass health status and score 100", async () => {
		const result = await singleEmailHealthCheckController("user@company.com", {
			lookupMx: mxOk("mail.company.com"),
		});

		expect(result.verdict).toBe("deliverable");
		expect(result.health.state).toBe("deliverable");
		expect(result.health.score).toBe(100);
		expect(result.health.reason).toBe("accepted_email");
		expect(result.health.status).toBe("pass");
		expect(result.health.summary).toContain("deliverable");
		expect(result.health.attributes.free).toBe(false);
		expect(result.health.attributes.role).toBe(false);
		expect(result.health.attributes.disposable).toBe(false);
	});

	test("evaluates disposable address with fail health status and score 0", async () => {
		const result = await singleEmailHealthCheckController(
			"test@mailinator.com",
			{ lookupMx: mxOk("mx.mailinator.com") },
		);

		expect(result.verdict).toBe("disposable");
		expect(result.health.state).toBe("undeliverable");
		expect(result.health.score).toBe(0);
		expect(result.health.reason).toBe("disposable_domain");
		expect(result.health.status).toBe("fail");
		expect(result.health.summary).toContain("Disposable");
	});

	test("evaluates role address with warn health status and score 65", async () => {
		const result = await singleEmailHealthCheckController("support@acme.corp", {
			lookupMx: mxOk("mx.acme.corp"),
		});

		expect(result.verdict).toBe("risky");
		expect(result.health.state).toBe("risky");
		expect(result.health.score).toBe(65);
		expect(result.health.reason).toBe("role_based");
		expect(result.health.status).toBe("warn");
		expect(result.health.summary).toContain("Role-based");
	});

	test("evaluates address with no MX records as undeliverable with score 0", async () => {
		const result = await singleEmailHealthCheckController(
			"user@nonexistent-mx-domain-xyz.com",
			{ lookupMx: mxEmpty },
		);

		expect(result.verdict).toBe("invalid");
		expect(result.health.state).toBe("undeliverable");
		expect(result.health.score).toBe(0);
		expect(result.health.reason).toBe("no_mx_records");
		expect(result.health.status).toBe("fail");
		expect(result.health.summary).toContain("no active MX");
	});
});

describe("csv-parser", () => {
	test("parses CSV with header and trims whitespace", () => {
		const csv =
			"email,name\njohn@example.com,John\n  jane@example.com  ,Jane\n";
		const parsed = parseCsvOrTextContent(csv);

		expect(parsed.totalUploaded).toBe(2);
		expect(parsed.totalUnique).toBe(2);
		expect(parsed.duplicatesRemoved).toBe(0);
		expect(parsed.emails).toEqual(["john@example.com", "jane@example.com"]);
	});

	test("parses CSV without header using first column", () => {
		const csv = "alice@domain.com,Alice\nbob@domain.com,Bob";
		const parsed = parseCsvOrTextContent(csv);

		expect(parsed.totalUploaded).toBe(2);
		expect(parsed.totalUnique).toBe(2);
		expect(parsed.emails).toEqual(["alice@domain.com", "bob@domain.com"]);
	});

	test("deduplicates case-insensitively and tracks duplicatesRemoved", () => {
		const csv =
			"email\nuser@gmail.com\nUSER@gmail.com\nuser@gmail.com\nother@gmail.com";
		const parsed = parseCsvOrTextContent(csv);

		expect(parsed.totalUploaded).toBe(4);
		expect(parsed.totalUnique).toBe(2);
		expect(parsed.duplicatesRemoved).toBe(2);
		expect(parsed.emails).toEqual(["user@gmail.com", "other@gmail.com"]);
	});

	test("parses plain text list with mixed line breaks", () => {
		const txt = "one@test.com\r\ntwo@test.com\nthree@test.com\n";
		const parsed = parseCsvOrTextContent(txt);

		expect(parsed.totalUnique).toBe(3);
		expect(parsed.emails).toEqual([
			"one@test.com",
			"two@test.com",
			"three@test.com",
		]);
	});

	test("throws on empty content", () => {
		expect(() => parseCsvOrTextContent("")).toThrow("Empty file");
		expect(() => parseCsvOrTextContent("   \n\r\n  ")).toThrow("Empty file");
	});

	test("parseJsonEmailArray handles JSON string array and deduplication", () => {
		const array = ["a@test.com", "b@test.com", "A@test.com"];
		const parsed = parseJsonEmailArray(array);

		expect(parsed.totalUploaded).toBe(3);
		expect(parsed.totalUnique).toBe(2);
		expect(parsed.duplicatesRemoved).toBe(1);
		expect(parsed.emails).toEqual(["a@test.com", "b@test.com"]);
	});
});

describe("batch job processor & domain MX cache", () => {
	test("executes batch job, caches MX per domain, and computes summary", async () => {
		const token = `test-job-token-${Date.now()}`;
		const emails = [
			"alice@google.com",
			"bob@google.com",
			"charlie@google.com",
			"support@acme.corp",
			"fake@mailinator.com",
			"bad-syntax@",
		];

		await createBatchJobRecord(token, 6, 6, 0);

		let mxLookupCalls = 0;
		const mockLookupMx = async (domain: string) => {
			mxLookupCalls++;
			if (domain === "mailinator.com") {
				return { status: "ok" as const, records: ["mx.mailinator.com"] };
			}
			if (domain === "google.com") {
				return { status: "ok" as const, records: ["aspmx.l.google.com"] };
			}
			if (domain === "acme.corp") {
				return { status: "ok" as const, records: ["mail.acme.corp"] };
			}
			return { status: "empty" as const, records: [] as [] };
		};

		await processBatchJob(token, emails, { lookupMx: mockLookupMx });

		expect(mxLookupCalls).toBe(3);

		const job = await getBatchJobRecord(token);
		expect(job).not.toBeNull();
		expect(job?.status).toBe("done");
		expect(job?.results.length).toBe(6);

		expect(job?.summary).toEqual({
			totalUploaded: 6,
			totalUnique: 6,
			duplicatesRemoved: 0,
			deliverableCount: 3, // alice, bob, charlie @ google.com
			riskyCount: 1, // support@acme.corp
			disposableCount: 1, // fake@mailinator.com
			invalidCount: 1, // bad-syntax@
			noMxCount: 1, // bad-syntax@
			avgRiskScore: expect.any(Number),
			healthyPct: 50, // 3 deliverable / 6 total = 50%
		});
	});
});
