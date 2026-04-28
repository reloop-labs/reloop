"use client";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { installCommands, sendEmailCode, type LanguageCode } from "../data";
import { CopyCodeBlock } from "./copy-code-block";
import { LanguageBadges } from "./language-badges";
import { StepCard } from "./step-card";

export function PostGenerate({
	apiKey,
	lang,
	onLanguageChange,
	onDone,
}: {
	apiKey: string;
	lang: LanguageCode;
	onLanguageChange: (lang: LanguageCode) => void;
	onDone: () => void;
}) {
	return (
		<div className="flex flex-col gap-6">
			{/* API Key display */}
			<div className="flex flex-col gap-1.5">
				<p className="text-paragraph-xs text-text-sub-600">
					Your API key — copy it now, you won't see it again.
				</p>
				<CopyCodeBlock code={apiKey} lang="bash" copyValue={apiKey} />
			</div>

			{/* Language selector */}
			<LanguageBadges value={lang} onChange={onLanguageChange} />

			{/* 3-step integration guide */}
			<div className="flex flex-col gap-5">
				<StepCard
					number={1}
					title="Install the SDK"
					subtitle="Add the Reloop package to your project"
				>
					<CopyCodeBlock code={installCommands[lang]} lang="bash" />
				</StepCard>

				<StepCard
					number={2}
					title="Set your environment variable"
					subtitle="Add your secret key to your .env file"
				>
					<CopyCodeBlock
						code={`RELOOP_API_KEY=${apiKey}`}
						lang="bash"
						copyValue={`RELOOP_API_KEY=${apiKey}`}
					/>
				</StepCard>

				<StepCard
					number={3}
					title="Send your first email"
					subtitle="Use the SDK to send a transactional email"
				>
					<CopyCodeBlock
						code={sendEmailCode[lang].code}
						lang={sendEmailCode[lang].lang}
					/>
				</StepCard>
			</div>

			{/* CTA */}
			<div className="flex items-center gap-3 pb-4">
				<Button.Root
					variant="neutral"
					mode="filled"
					size="xsmall"
					onClick={onDone}
				>
					<Icon name="check-circle" className="h-3.5 w-3.5" />
					Go to Dashboard
				</Button.Root>
			</div>
		</div>
	);
}
