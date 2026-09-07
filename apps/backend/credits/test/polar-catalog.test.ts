import { describe, expect, test } from "bun:test";
import {
	buildPolarPlanCatalog,
	matchReloopPlanId,
} from "../src/lib/polar-catalog";

describe("matchReloopPlanId", () => {
	test("uses Polar metadata plan_id", () => {
		expect(
			matchReloopPlanId({
				name: "Whatever",
				metadata: { plan_id: "startup" },
			}),
		).toBe("startup");
	});

	test("matches Reloop plan display names", () => {
		expect(matchReloopPlanId({ name: "Individual" })).toBe("individual");
		expect(matchReloopPlanId({ name: "Startup" })).toBe("startup");
		expect(matchReloopPlanId({ name: "Free" })).toBe("free");
	});

	test("matches plan ids in the product name", () => {
		expect(matchReloopPlanId({ name: "individual" })).toBe("individual");
	});

	test("ignores unrelated Polar products", () => {
		expect(matchReloopPlanId({ name: "Credits pack" })).toBeNull();
	});
});

describe("buildPolarPlanCatalog", () => {
	test("indexes Polar products by Reloop plan", () => {
		const catalog = buildPolarPlanCatalog([
			{ id: "prod_ind", name: "Individual", metadata: {} },
			{
				id: "prod_start",
				name: "Cloud Startup",
				metadata: { plan_id: "startup" },
			},
		]);
		expect(catalog.byPlanId.individual).toBe("prod_ind");
		expect(catalog.byPlanId.startup).toBe("prod_start");
		expect(catalog.byProductId.prod_start).toBe("startup");
	});
});
