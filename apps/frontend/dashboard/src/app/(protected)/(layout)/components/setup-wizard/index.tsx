"use client";

import { useApiLanguage } from "@fe/dashboard/hooks/use-api-language";
import type {
	IntegrationMode,
	SetupLanguageCode,
} from "@fe/dashboard/lib/integration/types";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { SetupChecklist } from "./setup-checklist";
import { SetupContextPanel } from "./setup-context-panel";
import { SetupHeader } from "./setup-header";
import {
	type ApiKeyData,
	type DomainData,
	useSetupProgress,
} from "./use-setup-progress";

export interface SetupWizardProps {
	firstName: string;
	domains: DomainData[];
	primaryApiKey: ApiKeyData | undefined;
	userEmail?: string;
}

export function SetupWizard({
	firstName,
	domains,
	primaryApiKey,
	userEmail = "",
}: SetupWizardProps) {
	const router = useRouter();
	const testRecipient = userEmail;
	const [isSendingTest, setIsSendingTest] = useState(false);
	const [step4Done, setStep4Done] = useState(false);
	const [generatedApiKey, setGeneratedApiKey] = useState<string | null>(null);
	const [isGeneratingKey, setIsGeneratingKey] = useState(false);
	const [mode, setMode] = useState<IntegrationMode>("ai");
	const [setupLang, setSetupLang] = useApiLanguage<SetupLanguageCode>(
		["nodejs", "python", "php", "ruby", "go"],
		"nodejs",
	);

	const progress = useSetupProgress({
		domains,
		primaryApiKey,
		generatedApiKey,
		step4Done,
	});

	const { stepsLeft, completedCount, apiKeyForPlayground } = progress;

	const handleGenerateApiKey = async () => {
		if (isGeneratingKey) return;
		setIsGeneratingKey(true);

		try {
			const response = await fetch("/api/api-key/v1/", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: "Setup Wizard Key" }),
				credentials: "include",
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(
					errorData.why || errorData.message || "Failed to generate API key.",
				);
			}

			const data = await response.json();
			setGeneratedApiKey(data.key);
			toast.success("API key generated successfully!");
			router.refresh();
		} catch (error: unknown) {
			const message =
				error instanceof Error ? error.message : "Failed to generate API key";
			toast.error(message);
		} finally {
			setIsGeneratingKey(false);
		}
	};

	const handleSendTestEmail = async () => {
		if (!testRecipient) {
			toast.error("Please enter a recipient email address");
			return;
		}

		setIsSendingTest(true);

		try {
			let cleartextApiKey = generatedApiKey;

			if (!cleartextApiKey) {
				const apiKeyRes = await fetch("/api/api-key/v1/", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ name: "Setup Wizard Test Key" }),
					credentials: "include",
				});

				if (!apiKeyRes.ok) {
					const errorData = await apiKeyRes.json().catch(() => ({}));
					throw new Error(
						errorData.why ||
							errorData.message ||
							"Failed to generate API key for sending.",
					);
				}

				const apiKeyData = await apiKeyRes.json();
				cleartextApiKey = apiKeyData.key;
			}

			const response = await fetch("/api/email/v1/onboarding/send-test-email", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					...(cleartextApiKey ? { "x-api-key": cleartextApiKey } : {}),
				},
				body: JSON.stringify({
					from: `test@${progress.primaryDomainName}`,
					to: testRecipient,
				}),
				credentials: "include",
			});

			if (!response.ok) {
				const result = await response.json().catch(() => ({}));
				throw new Error(result.why || result.message || "Failed to send email");
			}

			toast.success("Test email sent successfully!");
			setStep4Done(true);

			setTimeout(() => {
				router.refresh();
			}, 1500);
		} catch (error: unknown) {
			const message =
				error instanceof Error ? error.message : "Failed to send test email";
			toast.error(message);
		} finally {
			setIsSendingTest(false);
		}
	};

	const playgroundKey = useMemo(
		() => generatedApiKey || apiKeyForPlayground,
		[generatedApiKey, apiKeyForPlayground],
	);

	return (
		<div className="relative mx-auto max-w-6xl overflow-hidden p-6 lg:p-12">
			<div className="-top-24 -left-20 -z-10 pointer-events-none absolute h-72 w-72 rounded-full bg-primary-base/5 blur-[100px]" />
			<div className="-right-20 -z-10 pointer-events-none absolute top-1/3 h-96 w-96 rounded-full bg-blue-500/5 blur-[120px]" />

			<SetupHeader firstName={firstName} />

			<div className="mt-8 grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
				<div className="space-y-6 lg:col-span-5">
					<SetupChecklist
						domains={domains}
						primaryApiKey={primaryApiKey}
						generatedApiKey={generatedApiKey}
						step4Done={step4Done}
						isGeneratingKey={isGeneratingKey}
						isSendingTest={isSendingTest}
						testRecipient={testRecipient}
						onGenerateApiKey={handleGenerateApiKey}
						onSendTestEmail={handleSendTestEmail}
					/>
				</div>

				<div className="space-y-6 lg:col-span-7">
					<SetupContextPanel
						apiKeyDisplay={playgroundKey}
						domain={progress.primaryDomainName}
						mode={mode}
						setupLang={setupLang}
						onModeChange={setMode}
						onSetupLangChange={setSetupLang}
					/>
				</div>
			</div>
		</div>
	);
}

export type { ApiKeyData, DomainData };
