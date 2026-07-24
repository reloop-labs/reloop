import { describe, expect, it } from "vitest";
import { parseCsvContent } from "./csv-parser";

describe("parseCsvContent", () => {
	it("parses valid CSV content with standard columns", () => {
		const csv = `email,first_name,last_name\nalice@example.com,Alice,Smith\nbob@example.com,Bob,Jones`;
		const result = parseCsvContent(csv);

		expect(result.validCount).toBe(2);
		expect(result.totalRows).toBe(2);
		expect(result.invalidCount).toBe(0);
		expect(result.duplicateCount).toBe(0);
		expect(result.emailHeader).toBe("email");
		expect(result.firstNameHeader).toBe("first_name");
		expect(result.lastNameHeader).toBe("last_name");

		expect(result.contacts).toEqual([
			{ email: "alice@example.com", firstName: "Alice", lastName: "Smith" },
			{ email: "bob@example.com", firstName: "Bob", lastName: "Jones" },
		]);
	});

	it("handles custom property columns", () => {
		const csv = `Email,First Name,Company,Score\njane@acme.com,Jane,Acme Inc,100`;
		const result = parseCsvContent(csv);

		expect(result.validCount).toBe(1);
		expect(result.customHeaders).toEqual(["Company", "Score"]);
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
