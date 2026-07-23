import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { useHotkeys } from "react-hotkeys-hook";
import { CopyCodeBlock } from "./copy-code-block";
import { DeveloperPlayground } from "./developer-playground";
import type { IntegrationChoice } from "./types";

export function PostGenerate({
	apiKey,
	choice,
	onChoiceChange,
	onDone,
}: {
	apiKey: string;
	choice: IntegrationChoice;
	onChoiceChange: (choice: IntegrationChoice) => void;
	onDone: () => void;
}) {
	useHotkeys(
		"mod+enter",
		(e) => {
			e.preventDefault();
			onDone();
		},
		{ enableOnFormTags: true },
		[onDone],
	);

	return (
		<div className="w-full min-w-0 max-w-2xl space-y-7">
			{/* Header */}
			<div className="space-y-2">
				<div>
					<h1 className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
						API Key
					</h1>
					<p className="text-paragraph-md text-text-sub-600 leading-relaxed">
						Your API key — copy it now, you won&apos;t see it again.
					</p>
				</div>

				{/* Secret Key Display Box */}
				<CopyCodeBlock
					code={apiKey}
					lang="bash"
					copyValue={apiKey}
					label="secret key"
					minHeight="auto"
				/>
			</div>

			<DeveloperPlayground
				apiKey={apiKey}
				choice={choice}
				onChoiceChange={onChoiceChange}
			/>

			<div className="flex items-center justify-end gap-3 pb-4">
				<FancyButton.Root
					variant="blue"
					size="small"
					className="rounded-xl"
					onClick={onDone}
				>
					<Icon name="check-circle" className="h-3.5 w-3.5" />
					Go to Dashboard
				</FancyButton.Root>
			</div>
		</div>
	);
}
