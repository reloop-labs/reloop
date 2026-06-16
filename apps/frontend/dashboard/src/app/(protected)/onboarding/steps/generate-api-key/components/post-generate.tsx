"use client";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { KbdCommand } from "@reloop/ui/kbd-command";
import { KbdEnter } from "@reloop/ui/kbd-enter";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import {
	siBun,
	siComposer,
	siDotenv,
	siGnubash,
	siGo,
	siNodedotjs,
	siNpm,
	siPhp,
	siPnpm,
	siPython,
	siYarn,
} from "simple-icons";
import {
	buildAiPrompt,
	installCommands,
	type IntegrationMode,
	type LanguageCode,
	nodeInstallCommands,
	type PackageManager,
	sendEmailCode,
} from "../data";
import { AiPromptBlock } from "./ai-prompt-block";
import { CopyCodeBlock } from "./copy-code-block";
import { IntegrationLanguagePills } from "./integration-language-pills";
import { IntegrationModeTabs } from "./integration-mode-tabs";
import { StepCard } from "./step-card";

const langIcons = {
	nodejs: siNodedotjs,
	python: siPython,
	go: siGo,
	php: siPhp,
} satisfies Record<LanguageCode, unknown>;

const langLabels: Record<LanguageCode, string> = {
	nodejs: "Node.js",
	python: "Python",
	go: "Go",
	php: "PHP",
};

const langFileLabels: Record<LanguageCode, string> = {
	nodejs: "send-email.ts",
	python: "send_email.py",
	go: "send_email.go",
	php: "send-email.php",
};

const nonNodeInstallIcons = {
	python: siPython,
	go: siGnubash,
	php: siComposer,
} satisfies Partial<Record<LanguageCode, unknown>>;

const pkgManagerTabs = [
	{ id: "npm" as PackageManager, label: "npm", si: siNpm },
	{ id: "pnpm" as PackageManager, label: "pnpm", si: siPnpm },
	{ id: "yarn" as PackageManager, label: "yarn", si: siYarn },
	{ id: "bun" as PackageManager, label: "bun", si: siBun },
];

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
	const [pkgManager, setPkgManager] = useState<PackageManager>("npm");

	useHotkeys(
		"mod+enter",
		(e) => {
			e.preventDefault();
			onDone();
		},
		{ enableOnFormTags: true },
		[onDone],
	);

	const isAi = mode === "ai";
	const isNode = lang === "nodejs";
	const installCode = isNode
		? nodeInstallCommands[pkgManager]
		: installCommands[lang];
	const installIcon = isNode
		? undefined
		: nonNodeInstallIcons[lang as keyof typeof nonNodeInstallIcons];
	const installLabel = isNode ? undefined : langLabels[lang];
	const aiPrompt = buildAiPrompt(apiKey);

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-1.5">
				<p className="text-paragraph-xs text-text-sub-600">
					Your API key — copy it now, you won't see it again.
				</p>
				<CopyCodeBlock
					code={apiKey}
					lang="bash"
					copyValue={apiKey}
					label="secret key"
				/>
			</div>

			<div className="ml-8">
				<IntegrationModeTabs value={mode} onChange={onModeChange} />
			</div>

			<div className="ml-0.5 flex flex-col gap-5">
				{isAi ? (
					<StepCard number={1} title="Copy the AI prompt" isLast>
						<AiPromptBlock prompt={aiPrompt} />
					</StepCard>
				) : (
					<>
						<StepCard number={1} title="Choose your language">
							<IntegrationLanguagePills
								value={lang}
								onChange={onLangChange}
							/>
						</StepCard>

						<StepCard number={2} title="Install the Reloop SDK">
							<CopyCodeBlock
								code={installCode}
								lang="bash"
								label={installLabel}
								si={installIcon}
								tabs={isNode ? pkgManagerTabs : undefined}
								activeTab={isNode ? pkgManager : undefined}
								onTabChange={
									isNode
										? (id) => setPkgManager(id as PackageManager)
										: undefined
								}
							/>
						</StepCard>

						<StepCard number={3} title="Add your API key to .env">
							<CopyCodeBlock
								code={`RELOOP_API_KEY=${apiKey}`}
								lang="bash"
								copyValue={`RELOOP_API_KEY=${apiKey}`}
								label=".env"
								si={siDotenv}
							/>
						</StepCard>

						<StepCard number={4} title="Send your first email" isLast>
							<CopyCodeBlock
								code={sendEmailCode[lang].code}
								lang={sendEmailCode[lang].lang}
								label={langFileLabels[lang]}
								si={langIcons[lang]}
							/>
						</StepCard>
					</>
				)}
			</div>

			<div className="ml-8 flex items-center gap-3 pb-4">
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
