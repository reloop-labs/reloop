"use client";

import { authClient } from "@reloop/auth/client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { PostGenerate } from "./components/post-generate";
import { PreGenerate } from "./components/pre-generate";
import type { IntegrationMode, LanguageCode } from "./data";

const languageCodes: LanguageCode[] = ["nodejs", "python", "go", "php"];

function parseLanguage(value: string): LanguageCode {
	if (languageCodes.includes(value as LanguageCode)) {
		return value as LanguageCode;
	}
	return "nodejs";
}

function parseIntegrationState(
	langParam: string,
	modeParam: string,
): { mode: IntegrationMode; lang: LanguageCode } {
	if (langParam === "ai") {
		return { mode: "ai", lang: "nodejs" };
	}

	const lang = parseLanguage(langParam);
	const mode: IntegrationMode = modeParam === "manual" ? "manual" : "ai";

	return { mode, lang };
}

export const GenerateApiKeyStep = () => {
	const { mutate } = useSWRConfig();
	const router = useRouter();
	const [, _setStep] = useQueryState("step", parseAsInteger.withDefault(1));
	const [apiKey, setApiKey] = useQueryState(
		"apiKey",
		parseAsString.withDefault(""),
	);
	const [modeParam, setModeParam] = useQueryState(
		"mode",
		parseAsString.withDefault("ai"),
	);
	const [langParam, setLangParam] = useQueryState(
		"lang",
		parseAsString.withDefault("nodejs"),
	);
	const [loading, setLoading] = useState(false);

	const { mode, lang } = parseIntegrationState(langParam, modeParam);

	const generateKey = async () => {
		setLoading(true);
		try {
			const response = await axios.post("/api/api-key/v1/", {
				name: "Onboarding Key",
			});
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

	return (
		<div>
			{!apiKey ? (
				<PreGenerate loading={loading} onGenerate={generateKey} />
			) : (
				<PostGenerate
					apiKey={apiKey}
					mode={mode}
					lang={lang}
					onModeChange={setModeParam}
					onLangChange={(l) => setLangParam(l)}
					onDone={async () => {
						await authClient.getSession();
						try {
							await mutate(
								(key) => Array.isArray(key) && key[0] === "organizations",
								async () => (await authClient.organization.list()).data ?? [],
								{ revalidate: false },
							);
						} catch (error) {
							console.error("Error mutating organizations:", error);
						}
						router.push("/");
					}}
				/>
			)}
		</div>
	);
};
