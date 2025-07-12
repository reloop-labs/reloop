import type { AuthInstance } from '@reloop/auth/server';
import type { DatabaseInstance } from '@reloop/db/client';
import postRouter from './router/post';
import { createTRPCContext as createTRPCContextInternal, router } from './trpc';

export const appRouter = router({
  posts: postRouter,
});

export const createApi = ({
  auth,
  db,
}: {
  auth: AuthInstance;
  db: DatabaseInstance;
}) => {
  return {
    trpcRouter: appRouter,
    createTRPCContext: ({ headers }: { headers: Headers }) =>
      createTRPCContextInternal({ auth, db, headers }),
  };
};

export type AppRouter = typeof appRouter;
