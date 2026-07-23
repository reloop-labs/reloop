import { PostGenerate } from "./post-generate";
import { PreGenerate } from "./pre-generate";
import type { LanguageCode } from "./types";
import { useGenerateApiKey } from "./use-generate-api-key";

export function GenerateApiKeyStep() {
	const {
		apiKey,
		loading,
		mode,
		lang,
		setModeParam,
		setLangParam,
		generateKey,
		finishOnboarding,
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
		<>
			<h1 className="mb-4 font-semibold text-[26px] text-text-strong-950 tracking-tight">
				Generate API key
			</h1>
			<PostGenerate
				apiKey={apiKey}
				mode={mode}
				lang={lang}
				onModeChange={setModeParam}
				onLangChange={(l: LanguageCode) => setLangParam(l)}
				onDone={() => {
					void finishOnboarding();
				}}
			/>
		</>
	);
}
