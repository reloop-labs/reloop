import { describe, expect, test } from "bun:test";
import {
	type PostAuthDestinationDeps,
	resolvePostAuthDestination,
} from "./post-auth-destination";

const future = "2026-07-20T12:00:00.000Z";
const past = "2026-07-01T12:00:00.000Z";

function deps(
	overrides: Partial<PostAuthDestinationDeps>,
): PostAuthDestinationDeps {
	return {
		listOrganizations: async () => ({ data: [] }),
		listUserInvitations: async () => ({ data: [] }),
		...overrides,
	};
}

describe("resolvePostAuthDestination", () => {
	test("prefers explicit inviteId over membership and invites", async () => {
		const path = await resolvePostAuthDestination(
			{ inviteId: "inv-deep" },
			deps({
				listOrganizations: async () => ({ data: [{ id: "org-1" }] }),
				listUserInvitations: async () => ({
					data: [
						{
							id: "inv-other",
							status: "pending",
							expiresAt: future,
						},
					],
				}),
			}),
		);
		expect(path).toBe("/invite?id=inv-deep");
	});

	test("sends members to dashboard home", async () => {
		const path = await resolvePostAuthDestination(
			{},
			deps({
				listOrganizations: async () => ({ data: [{ id: "org-1" }] }),
			}),
		);
		expect(path).toBe("/");
	});

	test("sends orgless users with actionable invite to invite page", async () => {
		const path = await resolvePostAuthDestination(
			{},
			deps({
				listOrganizations: async () => ({ data: [] }),
				listUserInvitations: async () => ({
					data: [
						{
							id: "inv-1",
							status: "pending",
							expiresAt: future,
						},
					],
				}),
			}),
		);
		expect(path).toBe("/invite?id=inv-1");
	});

	test("ignores expired pending invites and sends to onboarding", async () => {
		const path = await resolvePostAuthDestination(
			{},
			deps({
				listOrganizations: async () => ({ data: [] }),
				listUserInvitations: async () => ({
					data: [
						{
							id: "inv-expired",
							status: "pending",
							expiresAt: past,
						},
					],
				}),
			}),
		);
		expect(path).toBe("/onboarding");
	});

	test("sends orgless users with no invites to onboarding", async () => {
		const path = await resolvePostAuthDestination({}, deps({}));
		expect(path).toBe("/onboarding");
	});

	test("treats org list failure as orgless and still checks invites", async () => {
		const path = await resolvePostAuthDestination(
			{},
			deps({
				listOrganizations: async () => {
					throw new Error("network");
				},
				listUserInvitations: async () => ({
					data: [
						{
							id: "inv-1",
							status: "pending",
							expiresAt: future,
						},
					],
				}),
			}),
		);
		expect(path).toBe("/invite?id=inv-1");
	});

	test("falls back to onboarding when both list calls fail", async () => {
		const path = await resolvePostAuthDestination(
			{},
			deps({
				listOrganizations: async () => {
					throw new Error("network");
				},
				listUserInvitations: async () => {
					throw new Error("network");
				},
			}),
		);
		expect(path).toBe("/onboarding");
	});

	test("trims empty inviteId and continues resolution", async () => {
		const path = await resolvePostAuthDestination(
			{ inviteId: "   " },
			deps({
				listOrganizations: async () => ({ data: [] }),
			}),
		);
		expect(path).toBe("/onboarding");
	});
});
