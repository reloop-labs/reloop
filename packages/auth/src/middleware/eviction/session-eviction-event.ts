export type SessionEvictionEvent =
	| { type: "logout"; sessionToken: string; userId?: string | null }
	| { type: "password-change"; userId: string }
	| { type: "organization-switch"; userId: string };
