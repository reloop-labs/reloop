/**
 * Type-only surface derived from the single runtime Better Auth instance.
 * Value imports of this module must not pull server runtime deps into clients.
 */
import type { auth } from "./server";

export type AuthInstance = typeof auth;
export type User = typeof auth.$Infer.Session.user;
export type Session = typeof auth.$Infer.Session & {
	user: User & {
		activeOrganizationId: string;
	};
};
