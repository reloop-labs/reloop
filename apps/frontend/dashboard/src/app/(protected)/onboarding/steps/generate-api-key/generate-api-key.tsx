"use client";

import { authClient } from "@reloop/auth/client";
import axios from "axios";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { useState } from "react";
import { toast } from "sonner";
import { PostGenerate } from "./components/post-generate";
import { PreGenerate } from "./components/pre-generate";
import type { LanguageCode } from "./data";

export const GenerateApiKeyStep = () => {
	const [, setStep] = useQueryState("step", parseAsInteger.withDefault(1));
	const [apiKey, setApiKey] = useQueryState(
		"apiKey",
		parseAsString.withDefault(""),
	);
	const [selectedLang, setSelectedLang] = useQueryState(
		"lang",
		parseAsString.withDefault("nodejs"),
	);
	const [loading, setLoading] = useState(false);

	const lang = (selectedLang as LanguageCode) || "nodejs";

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
					lang={lang}
					onLanguageChange={(l) => setSelectedLang(l)}
					onDone={async () => {
						await authClient.getSession();
						setStep(5);
					}}
				/>
			)}
		</div>
	);
};
