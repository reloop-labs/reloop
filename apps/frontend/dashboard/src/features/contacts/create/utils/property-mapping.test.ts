import { describe, expect, it } from "vitest";
import {
	countCustomPropertyMappings,
	fuzzyMatchHeaderToProperty,
	getAvailableCsvHeaders,
	getAvailableIdentityTargets,
	getAvailableProperties,
	hasEmailMapping,
	isRowComplete,
	type PropertyMappingRow,
	rowsToColumnMappings,
	seedRowsFromDetectedMappings,
	slugifyPropertyName,
	suggestPropertyRows,
	toPropertyTarget,
	validatePropertyName,
} from "./property-mapping";

describe("slugifyPropertyName", () => {
	it("lowercases and replaces spaces", () => {
		expect(slugifyPropertyName("Company Plan")).toBe("company_plan");
	});

	it("strips invalid characters", () => {
		expect(slugifyPropertyName("Job-Title!")).toBe("jobtitle");
	});
});

describe("validatePropertyName", () => {
	it("allows empty while typing", () => {
		expect(validatePropertyName("")).toBe("");
	});

	it("accepts mixed case before slugify (draft input)", () => {
		expect(validatePropertyName("Company")).toBe("");
	});

	it("accepts valid snake_case", () => {
		expect(validatePropertyName("company_plan")).toBe("");
	});

	it("rejects invalid characters", () => {
		expect(validatePropertyName("job-title")).toContain("Only letters");
	});
});

describe("isRowComplete", () => {
	it("requires both sides", () => {
		expect(isRowComplete({ id: "1", csvHeader: null, target: "email" })).toBe(
			false,
		);
		expect(isRowComplete({ id: "1", csvHeader: "email", target: null })).toBe(
			false,
		);
		expect(
			isRowComplete({ id: "1", csvHeader: "email", target: "email" }),
		).toBe(true);
	});
});

describe("getAvailableCsvHeaders", () => {
	it("excludes already-used headers", () => {
		const rows: PropertyMappingRow[] = [
			{ id: "a", csvHeader: "email", target: "email" },
			{ id: "b", csvHeader: null, target: null },
		];
		const available = getAvailableCsvHeaders(
			["email", "company", "role"],
			rows,
			"b",
		);
		expect(available).toEqual(["company", "role"]);
	});
});

describe("getAvailableIdentityTargets", () => {
	it("excludes identity targets used on other rows", () => {
		const rows: PropertyMappingRow[] = [
			{ id: "a", csvHeader: "email", target: "email" },
			{ id: "b", csvHeader: null, target: null },
		];
		expect(getAvailableIdentityTargets(rows, "b")).toEqual([
			"firstName",
			"lastName",
		]);
	});
});

describe("getAvailableProperties", () => {
	it("excludes properties used on other rows", () => {
		const rows: PropertyMappingRow[] = [
			{
				id: "a",
				csvHeader: "company",
				target: toPropertyTarget("company"),
			},
			{ id: "b", csvHeader: null, target: null },
		];
		const available = getAvailableProperties(
			[
				{ propertyName: "company" },
				{ propertyName: "role" },
				{ propertyName: "score" },
			],
			rows,
			"b",
		);
		expect(available.map((p) => p.propertyName)).toEqual(["role", "score"]);
	});
});

describe("fuzzyMatchHeaderToProperty", () => {
	const props = [
		{ propertyName: "company" },
		{ propertyName: "job_title" },
		{ propertyName: "years_of_experience" },
	];

	it("matches exact slug", () => {
		expect(fuzzyMatchHeaderToProperty("company", props)).toBe("company");
	});

	it("matches spaced headers to snake_case", () => {
		expect(fuzzyMatchHeaderToProperty("Job Title", props)).toBe("job_title");
	});

	it("returns null when no match", () => {
		expect(fuzzyMatchHeaderToProperty("department", props)).toBeNull();
	});
});

describe("seedRowsFromDetectedMappings", () => {
	it("keeps identity only, drops invented property targets", () => {
		const rows = seedRowsFromDetectedMappings([
			{ csvHeader: "email", target: "email" },
			{ csvHeader: "first_name", target: "firstName" },
			{ csvHeader: "company", target: "property:company" },
		]);
		expect(rows).toHaveLength(2);
		expect(rows.map((r) => r.target)).toEqual(["email", "firstName"]);
	});
});

describe("suggestPropertyRows", () => {
	it("only suggests high-confidence matches for free headers", () => {
		const existing: PropertyMappingRow[] = [
			{ id: "1", csvHeader: "email", target: "email" },
		];
		const rows = suggestPropertyRows(
			["email", "company", "mystery"],
			existing,
			[{ propertyName: "company" }, { propertyName: "role" }],
		);
		expect(rows).toHaveLength(1);
		expect(rows[0]?.csvHeader).toBe("company");
		expect(rows[0]?.target).toBe("property:company");
	});
});

describe("rowsToColumnMappings", () => {
	it("converts complete rows only (identity + custom)", () => {
		const mappings = rowsToColumnMappings([
			{ id: "1", csvHeader: "email", target: "email" },
			{ id: "2", csvHeader: "first_name", target: "firstName" },
			{ id: "3", csvHeader: "company", target: "property:company" },
			{ id: "4", csvHeader: "role", target: null },
		]);

		expect(mappings).toEqual([
			{ csvHeader: "email", target: "email" },
			{ csvHeader: "first_name", target: "firstName" },
			{ csvHeader: "company", target: "property:company" },
		]);
	});
});

describe("hasEmailMapping / countCustomPropertyMappings", () => {
	it("detects email and counts custom properties", () => {
		const rows: PropertyMappingRow[] = [
			{ id: "1", csvHeader: "email", target: "email" },
			{ id: "2", csvHeader: "company", target: "property:company" },
			{ id: "3", csvHeader: "role", target: "property:role" },
		];
		expect(hasEmailMapping(rows)).toBe(true);
		expect(countCustomPropertyMappings(rows)).toBe(2);
	});
});
