import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { parseAsString, useQueryState } from "nuqs";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { onboardingStepParser } from "../onboarding-step";
import { useFinishOnboarding } from "../use-finish-onboarding";
import type { LanguageCode } from "./types";

const languageCodes: LanguageCode[] = ["nodejs", "python", "go", "php"];

function parseChoice(value: string): LanguageCode {
	// Legacy ?lang=ai URLs map to Node.js (AI is no longer a tab).
	if (value === "ai") return "nodejs";
	if (languageCodes.includes(value as LanguageCode))
		return value as LanguageCode;
	return "nodejs";
}

export type PlatformTestStatus = "idle" | "sending" | "sent" | "error";

export function useGenerateApiKey() {
	const queryClient = useQueryClient();
	const { finishOnboarding, isFinishing: finishing } = useFinishOnboarding();
	const [, setStep] = useQueryState("step", onboardingStepParser);
	const [apiKey, setApiKey] = useQueryState(
		"apiKey",
		parseAsString.withDefault(""),
	);
	const [choiceParam, setChoiceParam] = useQueryState(
		"lang",
		parseAsString.withDefault("nodejs"),
	);
	const [loading, setLoading] = useState(false);
	const [testStatus, setTestStatus] = useState<PlatformTestStatus>("idle");
	const [testError, setTestError] = useState<string | null>(null);
	const [testTo, setTestTo] = useState<string | null>(null);
	const [testFrom, setTestFrom] = useState<string | null>(null);

	const choice = parseChoice(choiceParam);

	const advanceStep = useCallback(async () => {
		await finishOnboarding();
	}, [finishOnboarding]);

	const skipStep = useCallback(async () => {
		await finishOnboarding();
	}, [finishOnboarding]);

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
				data.to ? `Email sent to ${data.to}` : "Email sent — check your inbox",
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
		advanceStep,
		skipStep,
		finishOnboarding,
		sendPlatformTestEmail,
		testStatus,
		testError,
		testTo,
		testFrom,
	};
}

