export const PLATFORM_ADMIN_ROLE = "super-admin" as const;

export const DEFAULT_USER_ROLE = "user" as const;

export type PlatformAdminRole = typeof PLATFORM_ADMIN_ROLE;
