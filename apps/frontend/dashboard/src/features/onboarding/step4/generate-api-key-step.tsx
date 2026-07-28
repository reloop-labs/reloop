import { PostGenerate } from "./post-generate";
import { PreGenerate } from "./pre-generate";
import { useGenerateApiKey } from "./use-generate-api-key";

export function GenerateApiKeyStep() {
	const {
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
	} = useGenerateApiKey();

	if (!apiKey) {
		return (
			<>
				<h1 className="mb-4 font-semibold text-[26px] text-text-strong-950 tracking-tight">
					Generate API key
				</h1>
				<PreGenerate loading={loading} onGenerate={generateKey} />
			</>
		);
	}

	return (
		<PostGenerate
			apiKey={apiKey}
			choice={choice}
			onChoiceChange={setChoice}
			finishing={finishing}
			onDone={() => {
				void finishOnboarding();
			}}
			onSendTest={() => {
				void sendPlatformTestEmail();
			}}
			testStatus={testStatus}
			testError={testError}
			testTo={testTo}
			testFrom={testFrom}
		/>
	);
}
