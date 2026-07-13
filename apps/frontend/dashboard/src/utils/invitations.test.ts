import { describe, expect, test } from "bun:test";
import {
	dedupePendingInvitesByEmail,
	isInvitationActionable,
	isInvitationExpiredPending,
	isInvitationPending,
} from "./invitations";

const now = new Date("2026-07-13T12:00:00.000Z");

describe("invitation helpers", () => {
	test("isInvitationPending is case-insensitive", () => {
		expect(isInvitationPending({ status: "pending" })).toBe(true);
		expect(isInvitationPending({ status: "Pending" })).toBe(true);
		expect(isInvitationPending({ status: "canceled" })).toBe(false);
	});

	test("isInvitationActionable requires pending and future expiresAt", () => {
		expect(
			isInvitationActionable(
				{
					status: "pending",
					expiresAt: "2026-07-14T12:00:00.000Z",
				},
				now,
			),
		).toBe(true);
		expect(
			isInvitationActionable(
				{
					status: "pending",
					expiresAt: "2026-07-12T12:00:00.000Z",
				},
				now,
			),
		).toBe(false);
		expect(
			isInvitationActionable(
				{
					status: "canceled",
					expiresAt: "2026-07-14T12:00:00.000Z",
				},
				now,
			),
		).toBe(false);
	});

	test("isInvitationExpiredPending is pending + past expiresAt", () => {
		expect(
			isInvitationExpiredPending(
				{
					status: "pending",
					expiresAt: "2026-07-12T12:00:00.000Z",
				},
				now,
			),
		).toBe(true);
		expect(
			isInvitationExpiredPending(
				{
					status: "pending",
					expiresAt: "2026-07-14T12:00:00.000Z",
				},
				now,
			),
		).toBe(false);
	});

	test("dedupePendingInvitesByEmail keeps one row per email", () => {
		const result = dedupePendingInvitesByEmail(
			[
				{
					id: "old-expired",
					email: "a@example.com",
					status: "pending",
					expiresAt: "2026-07-01T00:00:00.000Z",
					createdAt: "2026-06-01T00:00:00.000Z",
				},
				{
					id: "new-valid",
					email: "a@example.com",
					status: "pending",
					expiresAt: "2026-07-20T00:00:00.000Z",
					createdAt: "2026-07-10T00:00:00.000Z",
				},
				{
					id: "other",
					email: "b@example.com",
					status: "pending",
					expiresAt: "2026-07-20T00:00:00.000Z",
				},
				{
					id: "canceled",
					email: "c@example.com",
					status: "canceled",
					expiresAt: "2026-07-20T00:00:00.000Z",
				},
			],
			now,
		);

		expect(result.map((r) => r.id).sort()).toEqual(["new-valid", "other"]);
	});

	test("dedupe prefers valid invite over expired for same email", () => {
		const result = dedupePendingInvitesByEmail(
			[
				{
					id: "valid",
					email: "a@example.com",
					status: "pending",
					expiresAt: "2026-07-20T00:00:00.000Z",
					createdAt: "2026-06-01T00:00:00.000Z",
				},
				{
					id: "expired-newer",
					email: "a@example.com",
					status: "pending",
					expiresAt: "2026-07-01T00:00:00.000Z",
					createdAt: "2026-07-12T00:00:00.000Z",
				},
			],
			now,
		);

		expect(result).toHaveLength(1);
		expect(result[0]?.id).toBe("valid");
	});
});
