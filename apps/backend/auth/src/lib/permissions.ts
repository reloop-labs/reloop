import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

const statement = {
	...defaultStatements,
	orgs: ["create", "share", "update", "delete"],
	members: ["invite", "remove"],
	apiKey: ["create", "update", "delete", "read"],
	templates: ["create", "update", "delete", "read"],
} as const;

export const ac = createAccessControl(statement);

export const dev = ac.newRole({
	apiKey: ["create", "delete", "read", "update"],
	templates: ["create", "read"],
});

export const marketing = ac.newRole({
	orgs: ["create", "share", "update", "delete"],
	templates: ["create", "update", "delete", "read"],
});

export const admin = ac.newRole({ ...adminAc.statements });
