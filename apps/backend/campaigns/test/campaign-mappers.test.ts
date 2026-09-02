import { describe, expect, test } from "bun:test";
import { toCampaignResponse } from "../src/routes/campaign/campaign.mappers";

function campaignRow(overrides: Record<string, unknown> = {}) {
	const now = new Date("2026-09-02T12:00:00.000Z");
	return {
		id: "cmp_test",
		organizationId: "org_1",
		userId: "user_1",
		name: "Draft",
		subject: "Hello",
		previewText: null,
		fromName: "Team",
		fromEmail: "team@example.com",
		replyTo: null,
		status: "draft" as const,
		audienceType: "all" as const,
		audienceTargetId: null,
		audienceTargetName: null,
		csvEmails: [],
		templateId: null,
		content: [],
		contentHtml: "",
		scheduledAt: null,
		startedAt: null,
		sentAt: null,
		cancelledAt: null,
		recipientCount: 0,
		sentCount: 0,
		deliveredCount: 0,
		openedCount: 0,
		clickedCount: 0,
		failedCount: 0,
		skippedCount: 0,
		lastError: null,
		deletedAt: null,
		createdAt: now,
		updatedAt: now,
		...overrides,
	};
}

describe("toCampaignResponse", () => {
	test("returns editor JSON separately from composed email HTML", () => {
		const content = [
			{
				type: "paragraph",
				attrs: { textAlign: "left" },
				content: [{ type: "text", text: "Hello" }],
			},
		];
		const response = toCampaignResponse(
			campaignRow({
				content,
				contentHtml: '<table align="center"><tr><td>Hello</td></tr></table>',
			}) as never,
		);

		expect(response.content).toEqual(content);
		expect(response.contentHtml).toContain('align="center"');
	});

	test("defaults missing content to an empty array", () => {
		const response = toCampaignResponse(
			campaignRow({ content: null }) as never,
		);
		expect(response.content).toEqual([]);
	});
});
