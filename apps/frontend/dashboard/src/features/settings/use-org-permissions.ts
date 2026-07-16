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
 * Until role resolves, treat as admin-capable so settings pages remain usable.
 */
export function useOrgPermissions() {
	const { data, isPending, error } = authClient.useActiveMemberRole();
	const role = data?.role ?? null;

	return useMemo(() => {
		// While role is loading, allow admin surfaces (matches progressive port).
		if (isPending && !role) {
			return {
				role: null as string | null,
				isPending: true,
				error,
				isOwner: false,
				isAdmin: false,
				isMember: false,
				isOrgAdmin: true,
				canManageTeam: true,
				canManageBilling: true,
				canManageWorkspace: true,
				canInvite: true,
			};
		}

		const isOwner = roleIncludes(role, ["owner"]);
		const isAdmin = roleIncludes(role, ["admin"]);
		const isMember = roleIncludes(role, ["member"]);
		const canManageTeam = isOwner || isAdmin;
		const canManageBilling = isOwner || isAdmin;
		const canManageWorkspace = isOwner || isAdmin;
		const isOrgAdmin = isOwner || isAdmin;

		const typedRole = role ? asOrgRole(role) : null;
		const canInvite = typedRole
			? authClient.organization.checkRolePermission({
					role: typedRole,
					permissions: { invitation: ["create"] },
				})
			: isOrgAdmin;

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
