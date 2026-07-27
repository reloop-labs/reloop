import { describe, expect, it } from "vitest";
import { resolveOrglessDestination } from "./orgless-destination";

const validInvitation = {
	id: "invite with spaces",
	status: "pending",
	expiresAt: new Date(Date.now() + 60_000),
};

describe("orgless authenticated routing", () => {
	it("globally sends a direct protected route to an actionable invitation", () => {
		expect(
			resolveOrglessDestination({
				pathname: "/settings",
				organizations: [],
				invitations: [validInvitation],
				invitationsSettled: true,
			}),
		).toBe("/invite?id=invite%20with%20spaces");
	});

	it("sends an orgless user without an actionable invitation to onboarding", () => {
		expect(
			resolveOrglessDestination({
				pathname: "/contacts",
				organizations: [],
				invitations: [
					{
						...validInvitation,
						expiresAt: new Date(Date.now() - 60_000),
					},
				],
				invitationsSettled: true,
			}),
		).toBe("/onboarding");
	});

	it("does not redirect while data is pending, for members, or on onboarding", () => {
		expect(
			resolveOrglessDestination({
				pathname: "/inbox",
				organizations: [],
				invitations: undefined,
				invitationsSettled: false,
			}),
		).toBeNull();
		expect(
			resolveOrglessDestination({
				pathname: "/settings",
				organizations: [{}],
				invitations: [],
				invitationsSettled: true,
			}),
		).toBeNull();
		expect(
			resolveOrglessDestination({
				pathname: "/onboarding",
				organizations: [],
				invitations: [],
				invitationsSettled: true,
			}),
		).toBeNull();
	});
});
