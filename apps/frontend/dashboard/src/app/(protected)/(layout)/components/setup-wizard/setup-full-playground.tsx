"use client";

import { AiPromptBlock } from "@fe/dashboard/components/developer-playground/ai-prompt-block";
import { IntegrationModeTabs } from "@fe/dashboard/components/developer-playground/integration-mode-tabs";
import { StepCard } from "@fe/dashboard/components/developer-playground/step-card";
import {
	buildSetupCodeSnippet,
	buildSetupPrompt,
	type IntegrationMode,
	nodeInstallCommands,
	type PackageManager,
	type SetupLanguageCode,
	setupFileLabels,
	setupInstallCommands,
	setupShikiLang,
} from "@fe/dashboard/lib/integration/snippets";
import { CopyCodeBlock } from "@reloop/ui/copy-code-block";
import { Icon } from "@reloop/ui/icon";
import { useState } from "react";
import {
	siBun,
	siComposer,
	siGnubash,
	siGo,
	siNodedotjs,
	siNpm,
	siPhp,
	siPnpm,
	siPython,
	siRuby,
	siYarn,
} from "simple-icons";
import { SetupLanguagePills } from "./setup-language-pills";

const langIcons = {
	nodejs: siNodedotjs,
	python: siPython,
	go: siGo,
	php: siPhp,
	ruby: siRuby,
} satisfies Record<SetupLanguageCode, unknown>;

const nonNodeInstallIcons = {
	python: siPython,
	go: siGnubash,
	php: siComposer,
	ruby: siRuby,
} satisfies Partial<Record<SetupLanguageCode, unknown>>;

const pkgManagerTabs = [
	{ id: "npm" as PackageManager, label: "npm", si: siNpm },
	{ id: "pnpm" as PackageManager, label: "pnpm", si: siPnpm },
	{ id: "yarn" as PackageManager, label: "yarn", si: siYarn },
	{ id: "bun" as PackageManager, label: "bun", si: siBun },
];

export function SetupFullPlayground({
	apiKeyDisplay,
	domain,
	mode,
	lang,
	onModeChange,
	onLangChange,
}: {
	apiKeyDisplay: string;
	domain: string;
	mode: IntegrationMode;
	lang: SetupLanguageCode;
	onModeChange: (mode: IntegrationMode) => void;
	onLangChange: (lang: SetupLanguageCode) => void;
}) {
	const [pkgManager, setPkgManager] = useState<PackageManager>("npm");
	const isAi = mode === "ai";
	const isNode = lang === "nodejs";
	const installCode = isNode
		? nodeInstallCommands[pkgManager]
		: setupInstallCommands[lang];
	const installIcon = isNode
		? undefined
		: nonNodeInstallIcons[lang as keyof typeof nonNodeInstallIcons];
	const aiPrompt = buildSetupPrompt(lang, apiKeyDisplay, domain);
	const codeSnippet = buildSetupCodeSnippet(lang, apiKeyDisplay, domain);

	return (
		<div className="ml-0.5 flex flex-col">
			<div className="flex gap-3">
				<div className="flex flex-col items-center">
					<div className="mt-2.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-bg-weak-50 ring-1 ring-stroke-soft-200 dark:bg-bg-weak-50/70 dark:ring-stroke-soft-100/40">
						<Icon
							name={mode === "ai" ? "sparkling" : "code"}
							className="h-3 w-3 text-text-sub-600"
						/>
					</div>
					<div className="mt-1.5 w-px flex-1 bg-stroke-soft-200 dark:bg-stroke-soft-100/40" />
				</div>
				<div className="flex min-w-0 flex-1 flex-col pb-6">
					<IntegrationModeTabs value={mode} onChange={onModeChange} />
				</div>
			</div>

			{isAi ? (
				<StepCard number={1} title="Copy the AI prompt" isLast>
					<AiPromptBlock prompt={aiPrompt} />
				</StepCard>
			) : (
				<>
					<StepCard number={1} title="Choose your language">
						<SetupLanguagePills value={lang} onChange={onLangChange} />
					</StepCard>

					<StepCard number={2} title="Install the Reloop SDK">
						<CopyCodeBlock
							code={installCode}
							lang="bash"
							si={installIcon}
							tabs={isNode ? pkgManagerTabs : undefined}
							activeTab={isNode ? pkgManager : undefined}
							onTabChange={
								isNode ? (id) => setPkgManager(id as PackageManager) : undefined
							}
							codeExtraPadding={true}
						/>
					</StepCard>

					<StepCard number={3} title="Send your first email" isLast>
						<CopyCodeBlock
							code={codeSnippet}
							lang={setupShikiLang[lang]}
							label={setupFileLabels[lang]}
							si={langIcons[lang]}
							codeExtraPadding={true}
						/>
					</StepCard>
				</>
			)}
		</div>
	);
}
