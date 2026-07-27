import { useRouter } from "next/navigation";
import { authClient } from "@reloop/auth/client";
import { useQueryClient } from "@tanstack/react-query";

import axios from "axios";
import { parseAsString, useQueryState } from "nuqs";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { organizationsQueryOptions } from "#/features/auth/organizations-query";
import { sessionQueryOptions } from "#/features/auth/session-query";
import { queryKeys } from "#/lib/query-keys";
import type { IntegrationChoice, LanguageCode } from "./types";

const languageCodes: LanguageCode[] = ["nodejs", "python", "go", "php"];

function parseChoice(value: string): IntegrationChoice {
	if (value === "ai") return "ai";
	if (languageCodes.includes(value as LanguageCode)) return value as LanguageCode;
	return "ai";
}

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

export function useGenerateApiKey() {
	const queryClient = useQueryClient();
	const router = useRouter();
	const [apiKey, setApiKey] = useQueryState(
		"apiKey",
		parseAsString.withDefault(""),
	);
	const [choiceParam, setChoiceParam] = useQueryState(
		"lang",
		parseAsString.withDefault("ai"),
	);
	const [loading, setLoading] = useState(false);
	/** True from "Go to Dashboard" until navigation (or error). */
	const [finishing, setFinishing] = useState(false);
	const finishingRef = useRef(false);

	const choice = parseChoice(choiceParam);

	const generateKey = async () => {
		setLoading(true);
		try {
			const response = await axios.post(
				"/api/api-key/v1/",
				{ name: "Onboarding Key" },
				{ withCredentials: true },
			);
			setApiKey(response.data.key);
		} catch (error) {
			const errorMessage = axios.isAxiosError(error)
				? error.response?.data?.message || "Failed to generate API key"
				: "Failed to generate API key";
			toast.error(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	const finishOnboarding = useCallback(async () => {
		// Guard double-clicks (button + mod+enter) before React re-renders.
		if (finishingRef.current) return;
		finishingRef.current = true;
		setFinishing(true);

		try {
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
				setFinishing(false);
				return;
			}

			// Pin a non-empty list into the cache before leaving onboarding.
			queryClient.setQueryData(queryKeys.auth.organizations(), organizations);

			// replace so Back does not return to a half-finished onboarding URL.
			router.replace("/");
			// Keep `finishing` true — the route unmounts this step; avoid a
			// flash of the API-key UI if navigation is slow.
		} catch (error) {
			console.error("Failed to finish onboarding", error);
			toast.error("Could not open the dashboard. Please try again.");
			finishingRef.current = false;
			setFinishing(false);
		}
	}, [queryClient, router]);

	return {
		apiKey,
		loading,
		finishing,
		choice,
		setChoice: setChoiceParam,
		generateKey,
		finishOnboarding,
	};
}
