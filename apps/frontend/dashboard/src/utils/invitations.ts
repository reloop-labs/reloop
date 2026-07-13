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

/** Pending but past `expiresAt` — shown as expired, safe to re-invite. */
export function isInvitationExpiredPending(
	invite: Pick<InvitationLike, "status" | "expiresAt">,
	now: Date = new Date(),
) {
	return isInvitationPending(invite) && isInvitationExpired(invite, now);
}

/**
 * Collapse multiple pending invites for the same email into one row.
 * Prefers non-expired invites, then the latest `expiresAt` / `createdAt`.
 */
export function dedupePendingInvitesByEmail<T extends InvitationLike>(
	invites: T[],
	now: Date = new Date(),
): T[] {
	const byEmail = new Map<string, T>();

	for (const invite of invites) {
		if (!isInvitationPending(invite)) continue;

		const key = invite.email.toLowerCase();
		const existing = byEmail.get(key);
		if (!existing) {
			byEmail.set(key, invite);
			continue;
		}

		const inviteActionable = isInvitationActionable(invite, now);
		const existingActionable = isInvitationActionable(existing, now);

		// Prefer a still-valid invite over an expired one for the same email.
		if (inviteActionable && !existingActionable) {
			byEmail.set(key, invite);
			continue;
		}
		if (!inviteActionable && existingActionable) {
			continue;
		}

		const inviteTime = new Date(
			invite.createdAt ?? invite.expiresAt,
		).getTime();
		const existingTime = new Date(
			existing.createdAt ?? existing.expiresAt,
		).getTime();
		if (inviteTime >= existingTime) {
			byEmail.set(key, invite);
		}
	}

	return [...byEmail.values()];
}
