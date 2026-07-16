import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useSessionQuery } from "#/features/auth/session-query";
import { navigatePostAuth } from "#/utils/navigate-post-auth";
import { resolvePostAuthDestinationWithQuery } from "#/utils/post-auth-destination";

/**
 * Dashboard overview. Shell + session gate live in `_dashboard` layout.
 * Still redirects orgless users to onboarding / invite.
 */
export function HomePage() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { data: session, isPending } = useSessionQuery();

	useEffect(() => {
		if (isPending || !session) return;

		let cancelled = false;
		void (async () => {
			const destination =
				await resolvePostAuthDestinationWithQuery(queryClient);
			if (cancelled) return;
			if (destination !== "/") {
				await navigatePostAuth(navigate, destination);
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [session, isPending, navigate, queryClient]);

	return (
		<div className="flex min-h-full flex-col items-center justify-center gap-3 p-6">
			<h1 className="font-medium text-label-lg text-text-strong-950">
				Welcome to Reloop
			</h1>
			<p className="max-w-sm text-center text-[13px] text-text-sub-600">
				You&apos;re signed in as{" "}
				<span className="font-medium text-text-strong-950">
					{session?.user.email}
				</span>
				.
			</p>
		</div>
	);
}
