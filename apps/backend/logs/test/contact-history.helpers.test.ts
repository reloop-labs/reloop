import { describe, expect, test } from "bun:test";
import {
	resolveContactHistoryChanges,
	titleForContactAction,
} from "../src/routes/logs/contact-history/contact-history.helpers";

describe("contact history helpers", () => {
	test("prefers stored metadata.changes", () => {
		const changes = resolveContactHistoryChanges(
			"updated",
			{
				changes: [
					{ field: "firstName", from: "Ada", to: "Grace", label: "First name" },
				],
			},
			{ firstName: "Grace" },
			null,
		);
		expect(changes).toEqual([
			{ field: "firstName", from: "Ada", to: "Grace", label: "First name" },
		]);
	});

	test("derives changes from request body when metadata missing", () => {
		const changes = resolveContactHistoryChanges(
			"updated",
			{},
			{ firstName: "Grace", status: "blocked" },
			null,
		);
		expect(changes).toEqual([
			{ field: "firstName", from: null, to: "Grace", label: "First name" },
			{ field: "status", from: null, to: "blocked", label: "Status" },
		]);
	});

	test("titles known actions", () => {
		expect(titleForContactAction("updated")).toBe("Contact updated");
		expect(titleForContactAction("added_to_group")).toBe("Added to group");
	});
});
