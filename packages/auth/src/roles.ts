/** Platform operator role for Reloop employees (Console / Admin API). */
export const PLATFORM_ADMIN_ROLE = "super-admin" as const;

/** Default Better Auth user role (non-operator). */
export const DEFAULT_USER_ROLE = "user" as const;

export type PlatformAdminRole = typeof PLATFORM_ADMIN_ROLE;
