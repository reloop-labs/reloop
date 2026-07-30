import { authClient } from "@reloop/auth/client";
import { useMemo } from "react";

type OrgRole = "owner" | "admin" | "member";

function roleIncludes(role: string | null | undefined, allowed: OrgRole[]) {
	if (!role) return false;
	const parts = role.split(",").map((r) => r.trim().toLowerCase());
	return allowed.some((a) => parts.includes(a));
}

function asOrgRole(role: string): OrgRole | null {
	const primary = role.split(",")[0]?.trim().toLowerCase();
	if (primary === "owner" || primary === "admin" || primary === "member") {
		return primary;
	}
	return null;
}

/**
 * Active org member role + simple permission flags for UI gating.
 *
 * Fail-closed while role is unknown: admin-only nav/actions stay hidden so
 * members never flash Usage / Billing / Teams / Workspace links (sidebar,
 * profile menu, command palette).
 */
export function useOrgPermissions() {
	const { data, isPending, error } = authClient.useActiveMemberRole();
	const role = data?.role ?? null;

	return useMemo(() => {
		const isOwner = roleIncludes(role, ["owner"]);
		const isAdmin = roleIncludes(role, ["admin"]);
		const isMember = roleIncludes(role, ["member"]);
		// Only true once role is known as owner/admin — never while pending/unknown.
		const isOrgAdmin = !isPending && (isOwner || isAdmin);
		const canManageTeam = isOrgAdmin;
		const canManageBilling = isOrgAdmin;
		const canManageWorkspace = isOrgAdmin;

		const typedRole = role ? asOrgRole(role) : null;
		const canInvite =
			!isPending && typedRole
				? authClient.organization.checkRolePermission({
						role: typedRole,
						permissions: { invitation: ["create"] },
					})
				: false;

		return {
			role,
			isPending,
			error,
			isOwner,
			isAdmin,
			isMember,
			isOrgAdmin,
			canManageTeam,
			canManageBilling,
			canManageWorkspace,
			canInvite,
		};
	}, [role, isPending, error]);
}
