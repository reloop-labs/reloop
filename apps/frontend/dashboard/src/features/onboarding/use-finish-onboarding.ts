import { authClient } from "@reloop/auth/client";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import { parseAsString, useQueryState } from "nuqs";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { organizationsQueryOptions } from "#/features/auth/organizations-query";
import { sessionQueryOptions } from "#/features/auth/session-query";
import { queryKeys } from "#/lib/query-keys";

async function wait(ms: number) {
	await new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Load organizations from the network (bypass staleTime) so Home does not
 * briefly see `[]` and bounce the user back to /onboarding.
 */
async function fetchOrganizationsFresh(
	queryClient: ReturnType<typeof useQueryClient>,
) {
	return queryClient.fetchQuery({
		...organizationsQueryOptions(),
		staleTime: 0,
	});
}

export function useFinishOnboarding() {
	const queryClient = useQueryClient();
	const router = useRouter();
	const [apiKey] = useQueryState("apiKey", parseAsString.withDefault(""));
	const [isFinishing, setIsFinishing] = useState(false);
	const finishingRef = useRef(false);

	const finishOnboarding = useCallback(async () => {
		// Guard double-clicks (button + mod+enter) before React re-renders.
		if (finishingRef.current) return;
		finishingRef.current = true;
		setIsFinishing(true);

		try {
			// Reassign platform onboarding email_log → customer org + API key.
			// Best-effort: never block navigation if attribution fails.
			if (apiKey?.trim()) {
				try {
					await axios.post(
						"/api/email/v1/onboarding/dashboard",
						{ apiKey: apiKey.trim() },
						{ withCredentials: true },
					);
				} catch (attrError) {
					console.warn("Failed to attribute onboarding email log", attrError);
				}
			}

			// Warm session + org list so ActiveOrganization / Home never treat
			// this user as orgless on first paint after navigation.
			await authClient.getSession();
			await queryClient.invalidateQueries({
				queryKey: queryKeys.auth.session(),
			});
			await queryClient.fetchQuery(sessionQueryOptions());

			let organizations = await fetchOrganizationsFresh(queryClient);

			// Membership can lag setActive briefly after workspace creation.
			if (!organizations?.length) {
				await wait(400);
				organizations = await fetchOrganizationsFresh(queryClient);
			}

			if (!organizations?.length) {
				toast.error(
					"Your workspace is still setting up. Please try again in a moment.",
				);
				finishingRef.current = false;
				setIsFinishing(false);
				return;
			}

			// Pin a non-empty list into the cache before leaving onboarding.
			queryClient.setQueryData(queryKeys.auth.organizations(), organizations);

			// replace so Back does not return to a half-finished onboarding URL.
			router.replace("/");
		} catch (error) {
			console.error("Failed to finish onboarding", error);
			toast.error("Could not open the dashboard. Please try again.");
			finishingRef.current = false;
			setIsFinishing(false);
		}
	}, [apiKey, queryClient, router]);

	return {
		finishOnboarding,
		isFinishing,
	};
}
