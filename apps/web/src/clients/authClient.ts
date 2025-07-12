import { createAuthClient } from '@reloop/auth/client';
import { env } from '@/env';

export const authClient = createAuthClient({
  apiBaseUrl: env.PUBLIC_SERVER_URL,
});

export type AuthSession =
  | ReturnType<typeof createAuthClient>['$Infer']['Session']
  | null;
