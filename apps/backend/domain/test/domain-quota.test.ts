import { describe, expect, test } from "bun:test";
import { DomainErrors } from "../src/error/domain.error-response";
import { decideCustomDomainSlot } from "../src/lib/domain-quota";

describe("decideCustomDomainSlot", () => {
	test("free plan cap of 1 blocks the second domain", () => {
		let used = 0;
		let accepted = 0;
		let denied = 0;

		for (let i = 0; i < 50; i++) {
			const decision = decideCustomDomainSlot({ used, limit: 1 });
			if (decision.ok) {
				used += 1;
				accepted += 1;
			} else {
				denied += 1;
			}
		}

		expect(accepted).toBe(1);
		expect(denied).toBe(49);
		expect(used).toBe(1);
	});

	test("a paid cap of 5 allows five domains then blocks", () => {
		let used = 0;
		let accepted = 0;

		for (let i = 0; i < 20; i++) {
			const decision = decideCustomDomainSlot({ used, limit: 5 });
			if (decision.ok) {
				used += 1;
				accepted += 1;
			}
		}

		expect(accepted).toBe(5);
		expect(used).toBe(5);
	});
});

describe("DomainErrors.domainLimitReached", () => {
	test("returns 402 with used vs plan cap", () => {
		const err = DomainErrors.domainLimitReached({
			used: 1,
			limit: 1,
		}) as Error & { status?: number; why?: string; fix?: string };

		expect(err.status).toBe(402);
		expect(err.message).toBe("Domain limit reached");
		expect(err.why).toContain("1 custom domain");
		expect(err.why).toContain("already have 1");
		expect(err.fix).toContain("upgrade");
	});
});
