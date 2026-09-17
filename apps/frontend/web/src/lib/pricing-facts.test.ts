import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { planLimits, pricingPlans } from "@reloop/pricing";
import {
	freeDailyEmails,
	freeMonthlyEmails,
	freePlanSummary,
	hostedPlansSentence,
	pricingSnapshotMarkdown,
} from "./pricing-facts";

const webRoot = join(import.meta.dir, "../..");
const docsRoot = join(webRoot, "../docs");
const read = (path: string) => readFileSync(path, "utf8");

const surfaces = {
	"public/llms.txt": read(join(webRoot, "public/llms.txt")),
	"public/pricing.md": read(join(webRoot, "public/pricing.md")),
	"public/index.md": read(join(webRoot, "public/index.md")),
	"content/agent/home.md": read(join(webRoot, "content/agent/home.md")),
	"docs/guides/pricing.mdx": read(
		join(docsRoot, "content/docs/guides/pricing.mdx"),
	),
};

describe("pricing facts derive from @reloop/pricing", () => {
	test("free plan numbers match the catalog", () => {
		expect(freeMonthlyEmails).toBe(
			planLimits.free.monthlyEmails.toLocaleString("en-US"),
		);
		expect(freeDailyEmails).toBe(String(planLimits.free.dailyEmailLimit));
		expect(freePlanSummary).toBe("3,000 emails/month (100/day)");
	});

	test("the plan sentence names every plan once", () => {
		const sentence = hostedPlansSentence();
		for (const plan of pricingPlans) {
			expect(sentence.split(`${plan.name}`).length).toBe(2);
		}
		expect(sentence).toContain(`${freeDailyEmails}/day`);
		expect(sentence).not.toContain("200/day");
	});
});

describe("machine-readable surfaces agree with the catalog", () => {
	test("llms.txt carries the generated pricing snapshot", () => {
		expect(surfaces["public/llms.txt"]).toContain(pricingSnapshotMarkdown());
	});

	test("pricing.md lists the free daily cap from the catalog", () => {
		expect(surfaces["public/pricing.md"]).toContain(
			`${freeDailyEmails} emails / day`,
		);
	});

	test("agent mirrors state the free daily cap from the catalog", () => {
		for (const name of ["public/index.md", "content/agent/home.md"] as const) {
			expect(surfaces[name]).toContain(`**${freeDailyEmails} / day**`);
		}
	});

	test("docs pricing table matches the catalog", () => {
		const docs = surfaces["docs/guides/pricing.mdx"];
		expect(docs).toContain(
			`| Free | $0 | ${freeMonthlyEmails} emails / month | ${freeDailyEmails} / day |`,
		);
		for (const plan of pricingPlans) {
			if (plan.monthlyPrice === null || plan.monthlyPrice === 0) continue;
			expect(docs).toContain(
				`| ${plan.name} | $${plan.monthlyPrice} / month | ${plan.comparison.monthlyEmails} emails / month | None |`,
			);
		}
	});

	test("no surface states a different free daily cap", () => {
		for (const [name, content] of Object.entries(surfaces)) {
			const caps = [
				...content.matchAll(/\b(\d{2,4}) (?:emails )?\/ day\b/g),
			].map((match) => match[1]);
			for (const cap of caps) {
				expect(`${name}: ${cap}`).toBe(`${name}: ${freeDailyEmails}`);
			}
		}
	});
});
