import { describe, expect, test } from "vitest";
import { mergeOrganizationsWithPlans } from "./organizations-query";

describe("mergeOrganizationsWithPlans", () => {
	test("attaches plan ids before the org list is shown", () => {
		expect(
			mergeOrganizationsWithPlans(
				[
					{ id: "org_1", name: "Acme", slug: "acme" },
					{ id: "org_2", name: "Beta", slug: "beta" },
				],
				[{ organizationId: "org_2", planId: "individual" }],
			),
		).toEqual([
			{ id: "org_1", name: "Acme", slug: "acme", logo: undefined, planId: "free" },
			{
				id: "org_2",
				name: "Beta",
				slug: "beta",
				logo: undefined,
				planId: "individual",
			},
		]);
	});
});
