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
import type { LanguageCode } from "./types";

const languageCodes: LanguageCode[] = ["nodejs", "python", "go", "php"];

function parseChoice(value: string): LanguageCode {
	// Legacy ?lang=ai URLs map to Node.js (AI is no longer a tab).
	if (value === "ai") return "nodejs";
	if (languageCodes.includes(value as LanguageCode)) return value as LanguageCode;
	return "nodejs";
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

export type PlatformTestStatus = "idle" | "sending" | "sent" | "error";

export function useGenerateApiKey() {
	const queryClient = useQueryClient();
	const router = useRouter();
	const [apiKey, setApiKey] = useQueryState(
		"apiKey",
		parseAsString.withDefault(""),
	);
	const [choiceParam, setChoiceParam] = useQueryState(
		"lang",
		parseAsString.withDefault("nodejs"),
	);
	const [loading, setLoading] = useState(false);
	/** True from "Go to Dashboard" until navigation (or error). */
	const [finishing, setFinishing] = useState(false);
	const finishingRef = useRef(false);
	const [testStatus, setTestStatus] = useState<PlatformTestStatus>("idle");
	const [testError, setTestError] = useState<string | null>(null);
	const [testTo, setTestTo] = useState<string | null>(null);
	const [testFrom, setTestFrom] = useState<string | null>(null);

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
			setTestStatus("idle");
			setTestError(null);
			setTestTo(null);
			setTestFrom(null);
		} catch (error) {
			const errorMessage = axios.isAxiosError(error)
				? error.response?.data?.message || "Failed to generate API key"
				: "Failed to generate API key";
			toast.error(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	const sendPlatformTestEmail = useCallback(async () => {
		if (testStatus === "sending" || testStatus === "sent") return;
		if (!apiKey.trim()) {
			toast.error("Generate an API key before sending a test email");
			return;
		}

		setTestStatus("sending");
		setTestError(null);

		try {
			const response = await axios.post(
				"/api/email/v1/onboarding/send-test-email",
				{ apiKey },
				{ withCredentials: true },
			);

			const data = response.data as {
				to?: string;
				from?: string;
				message?: string;
			};
			setTestTo(data.to ?? null);
			setTestFrom(data.from ?? null);
			setTestStatus("sent");
			toast.success(
				data.to
					? `Email sent to ${data.to}`
					: "Email sent — check your inbox",
			);
		} catch (error) {
			const errorMessage = axios.isAxiosError(error)
				? error.response?.data?.message ||
					error.response?.data?.why ||
					"Failed to send email"
				: "Failed to send email";
			setTestStatus("error");
			setTestError(errorMessage);
			toast.error(errorMessage);
		}
	}, [apiKey, testStatus]);

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

	const setChoice = useCallback(
		(next: LanguageCode) => {
			void setChoiceParam(next);
		},
		[setChoiceParam],
	);

	return {
		apiKey,
		loading,
		finishing,
		choice,
		setChoice,
		generateKey,
		finishOnboarding,
		sendPlatformTestEmail,
		testStatus,
		testError,
		testTo,
		testFrom,
	};
}
