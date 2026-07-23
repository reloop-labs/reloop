import { authClient } from "@reloop/auth/client";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import axios from "axios";
import { parseAsString, useQueryState } from "nuqs";
import { useState } from "react";
import { toast } from "sonner";
import { organizationsQueryOptions } from "#/features/auth/organizations-query";
import { queryKeys } from "#/lib/query-keys";
import type { IntegrationChoice, LanguageCode } from "./types";

const languageCodes: LanguageCode[] = ["nodejs", "python", "go", "php"];

function parseChoice(value: string): IntegrationChoice {
	if (value === "ai") return "ai";
	if (languageCodes.includes(value as LanguageCode)) return value as LanguageCode;
	return "ai";
}

export function useGenerateApiKey() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const [apiKey, setApiKey] = useQueryState(
		"apiKey",
		parseAsString.withDefault(""),
	);
	const [choiceParam, setChoiceParam] = useQueryState(
		"lang",
		parseAsString.withDefault("ai"),
	);
	const [loading, setLoading] = useState(false);

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

	const finishOnboarding = async () => {
		await authClient.getSession();
		await queryClient.invalidateQueries({
			queryKey: queryKeys.auth.session(),
		});
		// Force a network refetch so Home's post-auth redirect does not see a
		// stale empty org list and bounce the user back to /onboarding.
		await queryClient.fetchQuery(organizationsQueryOptions());
		await navigate({ to: "/" });
	};

	return {
		apiKey,
		loading,
		choice,
		setChoice: setChoiceParam,
		generateKey,
		finishOnboarding,
	};
}
