"use client";

import {
	buildAiPrompt,
	type IntegrationMode,
	installCommands,
	type LanguageCode,
	nodeInstallCommands,
	type PackageManager,
	sendEmailCode,
} from "@fe/dashboard/lib/integration/snippets";
import { CopyCodeBlock } from "@reloop/ui/copy-code-block";
import { useState } from "react";
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
import { AiPromptBlock } from "./ai-prompt-block";
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

export type DeveloperPlaygroundVariant = "full" | "preview";

export function DeveloperPlayground({
	apiKey,
	mode,
	lang,
	onModeChange,
	onLangChange,
	variant = "full",
	aiPrompt: aiPromptOverride,
}: {
	apiKey: string;
	mode: IntegrationMode;
	lang: LanguageCode;
	onModeChange: (mode: IntegrationMode) => void;
	onLangChange: (lang: LanguageCode) => void;
	variant?: DeveloperPlaygroundVariant;
	aiPrompt?: string;
}) {
	const [pkgManager, setPkgManager] = useState<PackageManager>("npm");

	const isAi = mode === "ai";
	const isNode = lang === "nodejs";
	const installCode = isNode
		? nodeInstallCommands[pkgManager]
		: installCommands[lang];
	const installIcon = isNode
		? undefined
		: nonNodeInstallIcons[lang as keyof typeof nonNodeInstallIcons];
	const installLabel = isNode ? undefined : langLabels[lang];
	const aiPrompt = aiPromptOverride ?? buildAiPrompt(apiKey);

	if (variant === "preview") {
		return (
			<div className="flex flex-col gap-4">
				<IntegrationModeTabs value={mode} onChange={onModeChange} />
				{isAi ? (
					<AiPromptBlock prompt={aiPrompt} />
				) : (
					<p className="text-paragraph-xs text-text-sub-600">
						Generate your API key to unlock full code examples and install
						instructions.
					</p>
				)}
			</div>
		);
	}

	return (
		<div className="flex flex-col">
			{/* Header — mirrors the left panel's Setup Checklist heading */}
			<div className="mb-6">
				<h2 className="font-bold text-lg text-text-strong-950 dark:text-white">
					Developer Playground
				</h2>
				<p className="mt-1 text-text-sub-600 text-xs dark:text-white/40">
					Choose how to integrate Reloop — let AI do the work or follow the
					step-by-step SDK guide.
				</p>
			</div>

			{/* Mode tabs */}
			<IntegrationModeTabs
				value={mode}
				onChange={onModeChange}
				className="mb-5"
			/>

			{/* Step content */}
			<div className="ml-0.5 flex flex-col">
				{isAi ? (
					<StepCard number={1} title="Copy the AI prompt" isLast>
						<AiPromptBlock prompt={aiPrompt} />
					</StepCard>
				) : (
					<>
						<StepCard number={1} title="Choose your language">
							<IntegrationLanguagePills value={lang} onChange={onLangChange} />
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
		</div>
	);
}
