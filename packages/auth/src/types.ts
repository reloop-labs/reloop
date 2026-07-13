/**
 * Type-only surface derived from the single runtime Better Auth instance.
 *
 * Imports types from `./server/auth` (the instance module only), not the
 * server barrel — so typecheck does not pull signup-invite / redis re-exports.
 * Value imports of this module must not pull server runtime deps into clients;
 * use `import type` (enforced by export-isolation tests).
 */
import type { auth } from "./server/auth";

export type AuthInstance = typeof auth;
export type User = typeof auth.$Infer.Session.user;
export type Session = typeof auth.$Infer.Session & {
	user: User & {
		activeOrganizationId: string;
	};
};
