import { describe, expect, test } from "bun:test";
import { plansForMemberships } from "../src/routes/credits/list-org-plans/list-org-plans.controllers";

describe("plansForMemberships", () => {
	test("defaults missing plan rows to free", () => {
		expect(
			plansForMemberships(
				["org_1", "org_2"],
				[{ organizationId: "org_2", planId: "startup" }],
			),
		).toEqual([
			{ organizationId: "org_1", planId: "free" },
			{ organizationId: "org_2", planId: "startup" },
		]);
	});
});
