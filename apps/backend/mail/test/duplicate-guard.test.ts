import { beforeEach, describe, expect, test } from "bun:test";
import {
	assertNotDuplicateBurst,
	buildDuplicateFingerprint,
} from "../src/lib/duplicate-guard";

function memoryRedis() {
	const counts = new Map<string, number>();
	return {
		counts,
		async increment(key: string) {
			const next = (counts.get(key) ?? 0) + 1;
			counts.set(key, next);
			return next;
		},
		async expire(_key: string, _seconds: number) {
			return 1;
		},
	};
}

const base = {
	organizationId: "org_123",
	from: "news@acme.com",
	to: "victim@example.com",
	subject: "Hello",
	html: "<p>Hi</p>",
	text: "Hi",
};

describe("buildDuplicateFingerprint", () => {
	test("is stable for identical sends", () => {
		expect(buildDuplicateFingerprint(base)).toBe(
			buildDuplicateFingerprint(base),
		);
	});

	test("changes when content changes", () => {
		expect(buildDuplicateFingerprint({ ...base, subject: "Other" })).not.toBe(
			buildDuplicateFingerprint(base),
		);
	});

	test("normalizes display-name + case in addresses", () => {
		const a = buildDuplicateFingerprint(base);
		const b = buildDuplicateFingerprint({
			...base,
			from: "News <NEWS@acme.com>",
			to: "Victim <VICTIM@example.com>",
		});
		expect(a).toBe(b);
	});
});

describe("assertNotDuplicateBurst", () => {
	let redis: ReturnType<typeof memoryRedis>;

	beforeEach(() => {
		redis = memoryRedis();
	});

	test("allows the first send", async () => {
		await assertNotDuplicateBurst(redis, base);
	});

	test("blocks an identical immediate re-send with 429", async () => {
		await assertNotDuplicateBurst(redis, base);
		const err = await assertNotDuplicateBurst(redis, base).catch((e) => e);
		expect(err.status).toBe(429);
		expect(err.message).toBe("Duplicate send blocked");
	});

	test("blocks recipient velocity even with mutated content", async () => {
		for (let i = 0; i < 3; i++) {
			await assertNotDuplicateBurst(redis, { ...base, subject: `Ping ${i}` });
		}
		const err = await assertNotDuplicateBurst(redis, {
			...base,
			subject: "Ping 3",
		}).catch((e) => e);
		expect(err.status).toBe(429);
		expect(err.message).toBe("Recipient velocity limit reached");
	});

	test("different orgs do not share fingerprint state", async () => {
		await assertNotDuplicateBurst(redis, base);
		await assertNotDuplicateBurst(redis, {
			...base,
			organizationId: "org_other",
		});
	});

	test("skips empty-To sends without throwing", async () => {
		await assertNotDuplicateBurst(redis, { ...base, to: [] as string[] });
	});
});
