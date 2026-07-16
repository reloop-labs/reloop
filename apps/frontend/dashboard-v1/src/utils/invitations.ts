/**
 * Invitation helpers.
 *
 * Better Auth keeps expired invites as `status: "pending"` until they are
 * accepted, rejected, or canceled. Callers must treat `expiresAt` as part of
 * "still actionable" — otherwise expired rows block onboarding and re-invites
 * create duplicate pending rows.
 */

export type InvitationLike = {
	id?: string;
	email: string;
	status: string;
	expiresAt: Date | string;
	createdAt?: Date | string;
};

export function isInvitationPending(invite: Pick<InvitationLike, "status">) {
	return invite.status.toLowerCase() === "pending";
}

export function isInvitationExpired(
	invite: Pick<InvitationLike, "expiresAt">,
	now: Date = new Date(),
) {
	return new Date(invite.expiresAt).getTime() <= now.getTime();
}

/** Pending and still within the acceptance window. */
export function isInvitationActionable(
	invite: Pick<InvitationLike, "status" | "expiresAt">,
	now: Date = new Date(),
) {
	return isInvitationPending(invite) && !isInvitationExpired(invite, now);
}
