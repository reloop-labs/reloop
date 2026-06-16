export interface ApiKeyData {
	id: string;
	name: string | null;
	start: string | null;
	prefix: string | null;
	enabled: boolean;
	requestCount: number;
	remaining: number | null;
	expiresAt: string | null;
	createdAt: string;
	lastRequest: string | null;
}

export interface DomainData {
	id: string;
	domain: string;
	status: "pending" | "verifying" | "active" | "suspended" | "failed";
	createdAt: string;
}

export type SetupStepId = "account" | "domain" | "apiKey" | "sendEmail";

export const SETUP_STEPS: { id: SetupStepId; label: string }[] = [
	{ id: "account", label: "Create your account" },
	{ id: "domain", label: "Add sending domain" },
	{ id: "apiKey", label: "Generate API key" },
	{ id: "sendEmail", label: "Send your first email" },
];

export function getGreeting(): string {
	const hour = new Date().getHours();
	if (hour < 12) return "Good morning";
	if (hour < 17) return "Good afternoon";
	return "Good evening";
}

export function useSetupProgress({
	domains,
	primaryApiKey,
	generatedApiKey,
	step4Done,
}: {
	domains: DomainData[];
	primaryApiKey: ApiKeyData | undefined;
	generatedApiKey: string | null;
	step4Done: boolean;
}) {
	const primaryDomain = domains[0];
	const primaryDomainName = primaryDomain?.domain || "mycompany.com";
	const hasApiKey = !!primaryApiKey || !!generatedApiKey;

	const step1Done = true;
	const step2Done = primaryDomain?.status === "active";
	const step3Done = hasApiKey;
	const step4Complete = step4Done;

	const completedCount = [
		step1Done,
		step2Done,
		step3Done,
		step4Complete,
	].filter(Boolean).length;
	const stepsLeft = 4 - completedCount;

	const currentStepId: SetupStepId = !step2Done
		? "domain"
		: !step3Done
			? "apiKey"
			: !step4Complete
				? "sendEmail"
				: "sendEmail";

	const currentStepIndex = SETUP_STEPS.findIndex((s) => s.id === currentStepId);

	const displayPrefix = generatedApiKey
		? generatedApiKey.split("_").slice(0, 2).join("_")
		: primaryApiKey?.start || "rl_live";
	const maskedKey = generatedApiKey || `${displayPrefix}_••••••••••`;
	const apiKeyForPlayground = generatedApiKey || maskedKey;

	function getStepState(
		stepId: SetupStepId,
	): "completed" | "active" | "default" {
		const stepIndex = SETUP_STEPS.findIndex((s) => s.id === stepId);
		const isDone =
			stepId === "account"
				? step1Done
				: stepId === "domain"
					? step2Done
					: stepId === "apiKey"
						? step3Done
						: step4Complete;

		if (isDone) return "completed";
		if (stepIndex === currentStepIndex) return "active";
		return "default";
	}

	return {
		primaryDomain,
		primaryDomainName,
		hasApiKey,
		step1Done,
		step2Done,
		step3Done,
		step4Complete,
		completedCount,
		stepsLeft,
		currentStepId,
		currentStepIndex,
		displayPrefix,
		maskedKey,
		apiKeyForPlayground,
		generatedApiKey,
		getStepState,
	};
}
