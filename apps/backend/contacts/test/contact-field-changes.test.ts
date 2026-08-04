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

	test("skips empty change lists (idempotent no-ops)", () => {
		const response = { id: "con_1" };
		attachAuditChanges(response, []);
		expect(getAuditChanges(response)).toBeNull();
	});
});

describe("relationship audit transitions", () => {
	test("group membership: only real add attaches audit", () => {
		const existingMembership = { id: "cg_1" };
		const added = existingMembership ? null : { group: "General" };
		// Simulate controller: no changes when membership already exists
		const response = { id: "con_1", groupName: "General" };
		if (added) {
			attachAuditChanges(response, [
				{ field: "group", from: null, to: "General", label: "Group" },
			]);
		}
		expect(getAuditChanges(response)).toBeNull();
	});

	test("group membership: real add attaches audit", () => {
		const response = { id: "con_1", groupName: "General" };
		attachAuditChanges(response, [
			{ field: "group", from: null, to: "General", label: "Group" },
		]);
		expect(getAuditChanges(response)).toEqual([
			{ field: "group", from: null, to: "General", label: "Group" },
		]);
	});

	test("channel subscription: status change records previous status", () => {
		const response = { id: "con_1", channelName: "Marketing" };
		attachAuditChanges(response, [
			{
				field: "channel_subscription",
				from: "enrolled",
				to: "opt_out",
				label: "Subscription",
			},
		]);
		const changes = getAuditChanges(response);
		expect(changes?.[0]?.from).toBe("enrolled");
		expect(changes?.[0]?.to).toBe("opt_out");
	});

	test("channel subscription: no-op attaches nothing", () => {
		const existingStatus = "enrolled";
		const targetStatus = "enrolled";
		const response = { id: "con_1" };
		if (existingStatus !== targetStatus) {
			attachAuditChanges(response, [
				{
					field: "channel_subscription",
					from: existingStatus,
					to: targetStatus,
					label: "Subscription",
				},
			]);
		}
		expect(getAuditChanges(response)).toBeNull();
	});
});
