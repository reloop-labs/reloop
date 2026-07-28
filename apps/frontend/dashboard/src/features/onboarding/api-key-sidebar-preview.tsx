import { useState } from "react";
import { DeveloperPlayground } from "./step4/developer-playground";
import type { IntegrationChoice } from "./step4/types";

interface ApiKeySidebarPreviewProps {
	apiKey?: string;
	lang?: string;
}

export function ApiKeySidebarPreview({ apiKey, lang }: ApiKeySidebarPreviewProps) {
	const defaultChoice: IntegrationChoice =
		lang === "python" || lang === "go" || lang === "php" || lang === "ai"
			? lang
			: "nodejs";

	const [choice, setChoice] = useState<IntegrationChoice>(defaultChoice);
	const activeApiKey = apiKey && apiKey.trim().length > 0 ? apiKey : "re_live_9a8b7c6d5e4f3a2b1c0d";

	return (
		<div className="flex h-full w-full items-center justify-center p-4 sm:p-6 overflow-y-auto">
			<div className="w-full max-w-xl space-y-6">
				{/* Interactive Developer Playground: Language pills, SDK install tabs, .env & code snippets */}
				<DeveloperPlayground
					apiKey={activeApiKey}
					choice={choice}
					onChoiceChange={setChoice}
				/>
			</div>
		</div>
	);
}
