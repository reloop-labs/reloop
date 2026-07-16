import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { KbdCommand } from "@reloop/ui/kbd-command";
import { KbdEnter } from "@reloop/ui/kbd-enter";
import { useHotkeys } from "react-hotkeys-hook";
import { CopyCodeBlock } from "./copy-code-block";
import { DeveloperPlayground } from "./developer-playground";
import type { IntegrationMode, LanguageCode } from "./types";

export function PostGenerate({
	apiKey,
	mode,
	lang,
	onModeChange,
	onLangChange,
	onDone,
}: {
	apiKey: string;
	mode: IntegrationMode;
	lang: LanguageCode;
	onModeChange: (mode: IntegrationMode) => void;
	onLangChange: (lang: LanguageCode) => void;
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
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-1.5">
				<p className="text-paragraph-xs text-text-sub-600">
					Your API key — copy it now, you won&apos;t see it again.
				</p>
				<CopyCodeBlock
					code={apiKey}
					lang="bash"
					copyValue={apiKey}
					label="secret key"
					codeExtraPadding
				/>
			</div>

			<DeveloperPlayground
				apiKey={apiKey}
				mode={mode}
				lang={lang}
				onModeChange={onModeChange}
				onLangChange={onLangChange}
			/>

			<div className="flex items-center justify-end gap-3 pb-4">
				<Button.Root
					variant="neutral"
					mode="filled"
					size="xsmall"
					onClick={onDone}
				>
					<Icon name="check-circle" className="h-3.5 w-3.5" />
					Go to Dashboard
					<span className="inline-flex items-center gap-0.5">
						<KbdCommand />
						<KbdEnter />
					</span>
				</Button.Root>
			</div>
		</div>
	);
}
