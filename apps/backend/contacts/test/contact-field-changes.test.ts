import { describe, expect, test } from "bun:test";
import {
	attachAuditChanges,
	computeContactFieldChanges,
	getAuditChanges,
} from "../src/utils/contact-field-changes";

describe("computeContactFieldChanges", () => {
	test("detects core field updates", () => {
		const changes = computeContactFieldChanges(
			{
				email: "a@example.com",
				firstName: "Ada",
				lastName: "Lovelace",
				status: "subscribed",
				properties: {},
			},
			{
				firstName: "Grace",
				status: "unsubscribed",
			},
		);

		expect(changes).toEqual([
			{
				field: "firstName",
				from: "Ada",
				to: "Grace",
				label: "First name",
			},
			{
				field: "status",
				from: "subscribed",
				to: "unsubscribed",
				label: "Status",
			},
		]);
	});

	test("ignores unchanged fields", () => {
		const changes = computeContactFieldChanges(
			{ firstName: "Ada", email: "a@example.com" },
			{ firstName: "Ada", email: "a@example.com" },
		);
		expect(changes).toEqual([]);
	});

	test("tracks property changes", () => {
		const changes = computeContactFieldChanges(
			{ properties: { company: "Acme" } },
			{ properties: { company: "Reloop", role: "Engineer" } },
		);
		expect(changes).toContainEqual({
			field: "properties.company",
			from: "Acme",
			to: "Reloop",
			label: "company",
		});
		expect(changes).toContainEqual({
			field: "properties.role",
			from: null,
			to: "Engineer",
			label: "role",
		});
	});
});

describe("attachAuditChanges", () => {
	test("stores changes on response object via WeakMap", () => {
		const response = { id: "con_1" };
		const changes = [
			{ field: "firstName", from: "A", to: "B", label: "First name" },
		];
		attachAuditChanges(response, changes);
		expect(getAuditChanges(response)).toEqual(changes);
	});
});
