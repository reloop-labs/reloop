import { createAccessControl } from "better-auth/plugins/access";
import {
	adminAc,
	defaultStatements,
	userAc,
} from "better-auth/plugins/admin/access";
import { DEFAULT_USER_ROLE, PLATFORM_ADMIN_ROLE } from "./roles";

export const platformAc = createAccessControl(defaultStatements);

export const platformSuperAdmin = platformAc.newRole({
	...adminAc.statements,
});

export const platformUser = platformAc.newRole({
	...userAc.statements,
});

export const platformRoles = {
	[PLATFORM_ADMIN_ROLE]: platformSuperAdmin,
	[DEFAULT_USER_ROLE]: platformUser,
};
