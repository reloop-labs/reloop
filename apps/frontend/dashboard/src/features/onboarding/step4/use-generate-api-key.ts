import axios from "axios";
import { parseAsString, useQueryState } from "nuqs";
import { useCallback, useLayoutEffect, useState } from "react";
import { toast } from "sonner";
import { useFinishOnboarding } from "../use-finish-onboarding";
import type { LanguageCode } from "./types";

const languageCodes: LanguageCode[] = ["nodejs", "python", "go", "php"];

/** Session-only flag — never stores the secret, only that one was shown. */
const API_KEY_ISSUED_FLAG = "reloop.onboarding.apiKeyIssued";

function readIssuedFlag() {
	if (typeof window === "undefined") return false;
	try {
		return sessionStorage.getItem(API_KEY_ISSUED_FLAG) === "1";
	} catch {
		return false;
	}
}

function markIssued() {
	try {
		sessionStorage.setItem(API_KEY_ISSUED_FLAG, "1");
	} catch {
		// Ignore quota / private-mode failures.
	}
}

function stripApiKeyFromUrl() {
	const url = new URL(window.location.href);
	if (!url.searchParams.has("apiKey")) return;
	url.searchParams.delete("apiKey");
	const qs = url.searchParams.toString();
	window.history.replaceState(
		null,
		"",
		`${url.pathname}${qs ? `?${qs}` : ""}${url.hash}`,
	);
}

function parseChoice(value: string): LanguageCode {
	// Legacy ?lang=ai URLs map to Node.js (AI is no longer a tab).
	if (value === "ai") return "nodejs";
	if (languageCodes.includes(value as LanguageCode))
		return value as LanguageCode;
	return "nodejs";
}

export type PlatformTestStatus = "idle" | "sending" | "sent" | "error";

/** Survives step unmount, not a full reload. Never written to the URL. */
let inMemoryApiKey = "";

export function useGenerateApiKey() {
	const { finishOnboarding, isFinishing: finishing } = useFinishOnboarding();
	const [apiKey, setApiKeyState] = useState(inMemoryApiKey);
	const [mustRegenerate, setMustRegenerate] = useState(
		() => !inMemoryApiKey && readIssuedFlag(),
	);

	const setApiKey = (key: string) => {
		inMemoryApiKey = key;
		setApiKeyState(key);
	};
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

	useLayoutEffect(() => {
		stripApiKeyFromUrl();
	}, []);

	const advanceStep = useCallback(async () => {
		await finishOnboarding(apiKey);
	}, [finishOnboarding, apiKey]);

	const skipStep = useCallback(async () => {
		await finishOnboarding(apiKey);
	}, [finishOnboarding, apiKey]);

	const generateKey = async () => {
		setLoading(true);
		try {
			const response = await axios.post(
				"/api/api-key/v1/",
				{ name: "Onboarding Key" },
				{ withCredentials: true },
			);
			setApiKey(response.data.key);
			markIssued();
			setMustRegenerate(false);
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
		mustRegenerate,
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
