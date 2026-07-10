import { createAccessControl } from "better-auth/plugins/access";
import {
	adminAc,
	defaultStatements,
	memberAc,
	ownerAc,
} from "better-auth/plugins/organization/access";

/**
 * Organization access control for Reloop workspaces.
 *
 * Invite UI offers Admin / Member only. Creator is Owner (Better Auth default).
 * - Owner: full control (including delete org / transfer ownership)
 * - Admin: invite users, update payment, delete the team
 * - Member: manage emails, domains, and webhooks
 */
const statement = {
	...defaultStatements,
	billing: ["update"],
	email: ["create", "read", "update", "delete"],
	domain: ["create", "read", "update", "delete"],
	webhook: ["create", "read", "update", "delete"],
} as const;

export const ac = createAccessControl(statement);

export const owner = ac.newRole({
	...ownerAc.statements,
	billing: ["update"],
	email: ["create", "read", "update", "delete"],
	domain: ["create", "read", "update", "delete"],
	webhook: ["create", "read", "update", "delete"],
});

export const admin = ac.newRole({
	...adminAc.statements,
	organization: ["update", "delete"],
	billing: ["update"],
	email: ["create", "read", "update", "delete"],
	domain: ["create", "read", "update", "delete"],
	webhook: ["create", "read", "update", "delete"],
});

export const member = ac.newRole({
	...memberAc.statements,
	email: ["create", "read", "update", "delete"],
	domain: ["create", "read", "update", "delete"],
	webhook: ["create", "read", "update", "delete"],
});

export const orgRoles = {
	owner,
	admin,
	member,
} as const;
