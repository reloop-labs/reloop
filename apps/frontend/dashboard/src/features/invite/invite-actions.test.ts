import { describe, expect, it, vi } from "vitest";
import {
	acceptAndActivateInvitation,
	type Invitation,
	type InvitationClient,
	invitationIsUsable,
} from "./invite-actions";

function invitation(overrides: Partial<Invitation> = {}): Invitation {
	return {
		id: "invite-1",
		organizationId: "org-1",
		email: "person@example.com",
		role: "member",
		status: "pending",
		expiresAt: new Date(Date.now() + 60_000),
		inviterId: "user-1",
		organizationName: "Reloop",
		inviterEmail: "owner@example.com",
		...overrides,
	};
}

describe("invitation acceptance", () => {
	it("accepts the invitation, activates its organization, and persists it", async () => {
		const client: InvitationClient = {
			acceptInvitation: vi.fn().mockResolvedValue({
				data: { invitation: { organizationId: "org-1" } },
			}),
			setActive: vi.fn().mockResolvedValue(undefined),
			updateUser: vi.fn().mockResolvedValue(undefined),
		};

		await expect(
			acceptAndActivateInvitation("invite-1", client),
		).resolves.toEqual({ ok: true, organizationId: "org-1" });
		expect(client.acceptInvitation).toHaveBeenCalledWith({
			invitationId: "invite-1",
		});
		expect(client.setActive).toHaveBeenCalledWith({
			organizationId: "org-1",
		});
		expect(client.updateUser).toHaveBeenCalledWith({
			activeOrganizationId: "org-1",
		});
	});

	it("does not mutate organization state when acceptance fails", async () => {
		const client: InvitationClient = {
			acceptInvitation: vi
				.fn()
				.mockResolvedValue({ error: { message: "Invitation revoked" } }),
			setActive: vi.fn(),
			updateUser: vi.fn(),
		};

		await expect(
			acceptAndActivateInvitation("invite-1", client),
		).resolves.toEqual({ ok: false, message: "Invitation revoked" });
		expect(client.setActive).not.toHaveBeenCalled();
		expect(client.updateUser).not.toHaveBeenCalled();
	});

	it("rejects expired, revoked, and missing invitations", () => {
		expect(invitationIsUsable(invitation())).toBe(true);
		expect(
			invitationIsUsable(
				invitation({ expiresAt: new Date(Date.now() - 60_000) }),
			),
		).toBe(false);
		expect(invitationIsUsable(invitation({ status: "revoked" }))).toBe(false);
		expect(invitationIsUsable(null)).toBe(false);
	});
});
