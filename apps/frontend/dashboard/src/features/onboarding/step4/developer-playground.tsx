
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
import { CopyCodeBlock } from "./copy-code-block";
import { IntegrationLanguagePills } from "./integration-language-pills";
import { IntegrationModeTabs } from "./integration-mode-tabs";
import {
	buildAiPrompt,
	installCommands,
	langFileLabels,
	languageLabels,
	nodeInstallCommands,
	sendEmailCode,
} from "./snippets";

import type { IntegrationMode, LanguageCode, PackageManager } from "./types";

const langIcons = {
	nodejs: siNodedotjs,
	python: siPython,
	go: siGo,
	php: siPhp,
} satisfies Record<LanguageCode, { path: string; hex: string }>;

const nonNodeInstallIcons = {
	python: siPython,
	go: siGnubash,
	php: siComposer,
} satisfies Partial<Record<LanguageCode, { path: string; hex: string }>>;

const pkgManagerTabs = [
	{ id: "npm" as PackageManager, label: "npm", si: siNpm },
	{ id: "pnpm" as PackageManager, label: "pnpm", si: siPnpm },
	{ id: "yarn" as PackageManager, label: "yarn", si: siYarn },
	{ id: "bun" as PackageManager, label: "bun", si: siBun },
];

export function DeveloperPlayground({
	apiKey,
	mode,
	lang,
	onModeChange,
	onLangChange,
}: {
	apiKey: string;
	mode: IntegrationMode;
	lang: LanguageCode;
	onModeChange: (mode: IntegrationMode) => void;
	onLangChange: (lang: LanguageCode) => void;
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
	const installLabel = isNode ? undefined : languageLabels[lang];
	const aiPrompt = buildAiPrompt(apiKey);

	return (
		<div className="flex flex-col gap-4">
			<IntegrationModeTabs value={mode} onChange={onModeChange} />
			{isAi ? (
				<AiPromptBlock prompt={aiPrompt} className="max-w-xl" />
			) : (
				<div className="flex flex-col gap-4">
					<IntegrationLanguagePills value={lang} onChange={onLangChange} />

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
						codeExtraPadding
					/>

					<CopyCodeBlock
						code={`RELOOP_API_KEY=${apiKey}`}
						lang="bash"
						copyValue={`RELOOP_API_KEY=${apiKey}`}
						label=".env"
						si={siDotenv}
						codeExtraPadding
					/>

					<CopyCodeBlock
						code={sendEmailCode[lang].code}
						lang={sendEmailCode[lang].lang}
						label={langFileLabels[lang]}
						si={langIcons[lang]}
						codeExtraPadding
					/>
				</div>
			)}
		</div>
	);
}
