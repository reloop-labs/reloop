import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { useEffect } from "react";
import { useSessionQuery } from "#/features/auth/session-query";
import { navigatePostAuth } from "#/utils/navigate-post-auth";
import { resolvePostAuthDestinationWithQuery } from "#/utils/post-auth-destination";

/**
 * When a session already exists, resolve post-auth destination and navigate away.
 * Returns flags so pages can show a loader instead of flashing auth UI.
 */
export function useRedirectIfAuthenticated(inviteId?: string) {
	const router = useRouter();
	const queryClient = useQueryClient();
	const { data: session, isPending, isLoading } = useSessionQuery();

	useEffect(() => {
		if (!session) return;
		let cancelled = false;
		void (async () => {
			const destination = await resolvePostAuthDestinationWithQuery(
				queryClient,
				{ inviteId: inviteId || null },
			);
			if (!cancelled) await navigatePostAuth(router, destination);
		})();
		return () => {
			cancelled = true;
		};
	}, [session, router, inviteId, queryClient]);

	const isSessionLoading = isPending || isLoading;
	const isRedirecting = Boolean(session);

	return {
		session,
		isPending: isSessionLoading,
		isSessionLoading,
		isRedirecting,
		shouldBlockAuthUi: isSessionLoading || isRedirecting,
	};
}
