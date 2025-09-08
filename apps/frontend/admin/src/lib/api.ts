import { edenTreaty } from "@elysiajs/eden";

// Type-safe API client for the auth service
export const authApi = edenTreaty("http://localhost:3010");

// Export types for use in components
export type AuthApi = typeof authApi;
