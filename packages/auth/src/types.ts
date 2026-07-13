import type { auth } from "./server/auth";

export type AuthInstance = typeof auth;
export type User = typeof auth.$Infer.Session.user;
export type Session = typeof auth.$Infer.Session & {
	user: User & {
		activeOrganizationId: string;
	};
};
