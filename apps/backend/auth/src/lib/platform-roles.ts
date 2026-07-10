import { createAccessControl } from "better-auth/plugins/access";
import {
	adminAc,
	defaultStatements,
	userAc,
} from "better-auth/plugins/admin/access";

/** Platform operator role for Reloop employees (Console / Admin API). */
export const PLATFORM_ADMIN_ROLE = "super-admin" as const;

/** Default Better Auth user role (non-operator). */
export const DEFAULT_USER_ROLE = "user" as const;

/** Access control for Better Auth's platform admin plugin (not org roles). */
export const platformAc = createAccessControl(defaultStatements);

export const platformRoles = {
	[PLATFORM_ADMIN_ROLE]: platformAc.newRole({
		...adminAc.statements,
	}),
	[DEFAULT_USER_ROLE]: platformAc.newRole({
		...userAc.statements,
	}),
};
