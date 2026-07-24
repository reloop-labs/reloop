import { describe, expect, it } from "vitest";
import {
	buildContactsFromMapping,
	detectInitialMappings,
	parseCsvContent,
	type ColumnMapping,
} from "./csv-parser";
import {
	rowsToColumnMappings,
	seedRowsFromDetectedMappings,
	suggestPropertyRows,
	type PropertyMappingRow,
} from "./property-mapping";

describe("parseCsvContent", () => {
	it("parses valid CSV content with standard columns", () => {
		const csv = `email,first_name,last_name\nalice@example.com,Alice,Smith\nbob@example.com,Bob,Jones`;
		const result = parseCsvContent(csv);

		expect(result.validCount).toBe(2);
		expect(result.totalRows).toBe(2);
		expect(result.invalidCount).toBe(0);
		expect(result.duplicateCount).toBe(0);
		expect(result.mappings.find((m) => m.target === "email")?.csvHeader).toBe(
			"email",
		);
		expect(
			result.mappings.find((m) => m.target === "firstName")?.csvHeader,
		).toBe("first_name");
		expect(
			result.mappings.find((m) => m.target === "lastName")?.csvHeader,
		).toBe("last_name");

		expect(result.contacts).toEqual([
			{ email: "alice@example.com", firstName: "Alice", lastName: "Smith" },
			{ email: "bob@example.com", firstName: "Bob", lastName: "Jones" },
		]);
	});

	it("maps unmatched headers to property targets by default detect", () => {
		const csv = `Email,First Name,Company,Score\njane@acme.com,Jane,Acme Inc,100`;
		const result = parseCsvContent(csv);

		expect(result.validCount).toBe(1);
		expect(result.contacts[0]).toEqual({
			email: "jane@acme.com",
			firstName: "Jane",
			properties: {
				Company: "Acme Inc",
				Score: 100,
			},
		});
	});

	it("deduplicates emails and filters out invalid email formats", () => {
		const csv = `email,first_name\nalice@example.com,Alice\ninvalid-email,Bad\nalice@example.com,DuplicateAlice\nbob@example.com,Bob`;
		const result = parseCsvContent(csv);

		expect(result.totalRows).toBe(4);
		expect(result.validCount).toBe(2);
		expect(result.invalidCount).toBe(1);
		expect(result.duplicateCount).toBe(1);
		expect(result.contacts.map((c) => c.email)).toEqual([
			"alice@example.com",
			"bob@example.com",
		]);
	});

	it("handles quoted fields and semicolon delimiters", () => {
		const csv = `"E-mail";"First Name"\n"charlie@test.org";"Charlie, Jr."`;
		const result = parseCsvContent(csv);

		expect(result.validCount).toBe(1);
		expect(result.contacts[0]).toEqual({
			email: "charlie@test.org",
			firstName: "Charlie, Jr.",
		});
	});

	it("returns error if no email header is present", () => {
		const csv = `name,phone\nJohn,123456`;
		const result = parseCsvContent(csv);

		expect(result.validCount).toBe(0);
		expect(result.errors.length).toBeGreaterThan(0);
	});
});

describe("unified mapping rows → contacts", () => {
	it("writes identity + multiple custom properties", () => {
		const headers = ["email", "first_name", "company", "role", "notes"];
		const rawRows = [
			["alice@example.com", "Alice", "Acme", "Engineer", "VIP"],
			["bob@example.com", "Bob", "Globex", "Designer", ""],
		];

		const rows: PropertyMappingRow[] = [
			{ id: "1", csvHeader: "email", target: "email" },
			{ id: "2", csvHeader: "first_name", target: "firstName" },
			{ id: "3", csvHeader: "company", target: "property:company_name" },
			{ id: "4", csvHeader: "role", target: "property:job_title" },
			// notes intentionally incomplete / unmapped
		];

		const built = buildContactsFromMapping(
			headers,
			rawRows,
			rowsToColumnMappings(rows),
		);

		expect(built.validCount).toBe(2);
		expect(built.contacts[0]).toEqual({
			email: "alice@example.com",
			firstName: "Alice",
			properties: {
				company_name: "Acme",
				job_title: "Engineer",
			},
		});
		expect(built.contacts[1].properties).toEqual({
			company_name: "Globex",
			job_title: "Designer",
		});
	});

	it("skips headers not present in complete rows", () => {
		const headers = ["email", "company", "role"];
		const rawRows = [["alice@example.com", "Acme", "Engineer"]];
		const mappings: ColumnMapping[] = [
			{ csvHeader: "email", target: "email" },
		];

		const built = buildContactsFromMapping(headers, rawRows, mappings);
		expect(built.contacts[0].properties).toBeUndefined();
	});

	it("seeds identity then suggests properties", () => {
		const headers = ["email", "first_name", "company"];
		const detected = detectInitialMappings(headers);
		const identityRows = seedRowsFromDetectedMappings(detected);
		const suggested = suggestPropertyRows(headers, identityRows, [
			{ propertyName: "company" },
		]);
		const allRows = [...identityRows, ...suggested];

		const built = buildContactsFromMapping(
			headers,
			[["alice@example.com", "Alice", "Acme"]],
			rowsToColumnMappings(allRows),
		);

		expect(built.contacts[0]).toEqual({
			email: "alice@example.com",
			firstName: "Alice",
			properties: { company: "Acme" },
		});
	});
});
