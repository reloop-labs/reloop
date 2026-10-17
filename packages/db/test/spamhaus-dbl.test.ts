import { describe, expect, test } from "bun:test";
import {
	applySpamhausDblCheck,
	classifyDblAnswer,
	type DblLookup,
	dblBlockMessage,
	dblQueryNames,
	dblZone,
	lookupSpamhausDbl,
} from "@reloop/db/spamhaus-dbl";

function fakeResolver(answers: Record<string, string[] | Error>) {
	return {
		resolve4: async (name: string) => {
			const answer = answers[name];
			if (answer instanceof Error) throw answer;
			if (!answer) {
				throw Object.assign(new Error("not found"), { code: "ENOTFOUND" });
			}
			return answer;
		},
	};
}

function fakeDb(row: Record<string, unknown> | undefined) {
	const writes: Record<string, unknown>[] = [];
	const database = {
		query: { domain: { findFirst: async () => row } },
		update: () => ({
			set: (values: Record<string, unknown>) => ({
				where: async () => {
					writes.push(values);
				},
			}),
		}),
	};
	// biome-ignore lint/suspicious/noExplicitAny: minimal drizzle stand-in
	return { database: database as any, writes };
}

const phishListing: DblLookup = {
	status: "listed",
	name: "example.com",
	categories: ["phish"],
};

describe("dblQueryNames", () => {
	test("checks the sending name and its registrable domain", () => {
		expect(dblQueryNames("Send.Example.co.uk.")).toEqual([
			"send.example.co.uk",
			"example.co.uk",
		]);
		expect(dblQueryNames("example.com")).toEqual(["example.com"]);
	});
});

describe("dblZone", () => {
	test("uses DQS when a key is configured", () => {
		expect(dblZone("abc123")).toBe("abc123.dbl.dq.spamhaus.net");
		expect(dblZone("")).toBe("dbl.spamhaus.org");
	});
});

describe("classifyDblAnswer", () => {
	test("spam, phish, malware and botnet codes are listings", () => {
		expect(classifyDblAnswer(["127.0.1.2", "127.0.1.4"])).toEqual({
			status: "listed",
			categories: ["spam", "phish"],
		});
	});

	test("abused-legit codes do not block", () => {
		expect(classifyDblAnswer(["127.0.1.104"])).toEqual({ status: "clean" });
	});

	test("refused and error codes are errors, not listings", () => {
		expect(classifyDblAnswer(["127.255.255.254"]).status).toBe("error");
		expect(classifyDblAnswer(["127.0.1.255"]).status).toBe("error");
	});
});

describe("lookupSpamhausDbl", () => {
	test("NXDOMAIN on every name is clean", async () => {
		const result = await lookupSpamhausDbl("send.example.com", {
			resolver: fakeResolver({}),
			zone: "dbl.test",
		});
		expect(result).toEqual({ status: "clean" });
	});

	test("a listed registrable domain blocks its subdomain", async () => {
		const result = await lookupSpamhausDbl("send.example.com", {
			resolver: fakeResolver({ "example.com.dbl.test": ["127.0.1.4"] }),
			zone: "dbl.test",
		});
		expect(result).toEqual(phishListing);
	});

	test("resolver failures are errors", async () => {
		const result = await lookupSpamhausDbl("example.com", {
			resolver: fakeResolver({
				"example.com.dbl.test": Object.assign(new Error("timeout"), {
					code: "ETIMEOUT",
				}),
			}),
			zone: "dbl.test",
		});
		expect(result.status).toBe("error");
	});
});

describe("applySpamhausDblCheck", () => {
	const args = { domainId: "domain_1", domainName: "example.com" };

	test("blocks a listed domain with a delisting message", async () => {
		const { database, writes } = fakeDb({
			sendingBlockedAt: null,
			sendingBlockedMessage: null,
			sendingBlockedSource: null,
		});
		const result = await applySpamhausDblCheck(args, {
			database,
			lookup: async () => phishListing,
		});
		expect(result.outcome).toBe("blocked");
		expect(writes[0]?.sendingBlockedSource).toBe("spamhaus");
		expect(writes[0]?.sendingBlockedMessage).toBe(
			dblBlockMessage(phishListing as Extract<DblLookup, { status: "listed" }>),
		);
	});

	test("never overrides an admin block", async () => {
		const { database, writes } = fakeDb({
			sendingBlockedAt: new Date(),
			sendingBlockedMessage: "Admin review",
			sendingBlockedSource: "admin",
		});
		for (const lookup of [phishListing, { status: "clean" } as DblLookup]) {
			const result = await applySpamhausDblCheck(args, {
				database,
				lookup: async () => lookup,
			});
			expect(result.outcome).toBe("unchanged");
		}
		expect(writes).toEqual([]);
	});

	test("lifts its own block once delisted", async () => {
		const { database, writes } = fakeDb({
			sendingBlockedAt: new Date(),
			sendingBlockedMessage: "old",
			sendingBlockedSource: "spamhaus",
		});
		const result = await applySpamhausDblCheck(args, {
			database,
			lookup: async () => ({ status: "clean" }),
		});
		expect(result.outcome).toBe("unblocked");
		expect(writes[0]).toEqual({
			sendingBlockedAt: null,
			sendingBlockedMessage: null,
			sendingBlockedSource: null,
		});
	});

	test("fails open when the lookup errors", async () => {
		const { database, writes } = fakeDb({
			sendingBlockedAt: new Date(),
			sendingBlockedMessage: "old",
			sendingBlockedSource: "spamhaus",
		});
		const result = await applySpamhausDblCheck(args, {
			database,
			lookup: async () => ({ status: "error", error: "refused" }),
		});
		expect(result.outcome).toBe("lookup_failed");
		expect(writes).toEqual([]);
	});
});
