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
	siYarn,
} from "simple-icons";
import { CopyCodeBlock } from "./copy-code-block";
import { CopyForAiButton } from "./copy-for-ai-button";
import { IntegrationLanguagePills } from "./integration-language-pills";
import {
	buildAiPrompt,
	installCommands,
	langFileLabels,
	languageLabels,
	nodeInstallCommands,
	sendEmailCode,
} from "./snippets";
import type { LanguageCode, PackageManager } from "./types";

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

function SectionLabel({ children }: { children: React.ReactNode }) {
	return (
		<p className="font-medium text-sm text-text-strong-950">{children}</p>
	);
}

export function DeveloperPlayground({
	apiKey,
	choice,
	onChoiceChange,
}: {
	apiKey: string;
	choice: LanguageCode;
	onChoiceChange: (choice: LanguageCode) => void;
}) {
	const [pkgManager, setPkgManager] = useState<PackageManager>("npm");

	const lang = choice;
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
		<div className="space-y-6">
			<div className="space-y-2">
				<SectionLabel>Choose your language</SectionLabel>
				<div className="flex flex-wrap items-center justify-between gap-2 pt-1">
					<IntegrationLanguagePills
						value={choice}
						onChange={onChoiceChange}
					/>
					<CopyForAiButton prompt={aiPrompt} />
				</div>
			</div>

			<div className="space-y-2">
				<SectionLabel>Install the Reloop SDK</SectionLabel>
				<CopyCodeBlock
					code={installCode}
					lang="bash"
					label={installLabel}
					si={installIcon}
					tabs={isNode ? pkgManagerTabs : undefined}
					activeTab={isNode ? pkgManager : undefined}
					onTabChange={
						isNode ? (id) => setPkgManager(id as PackageManager) : undefined
					}
					minHeight="auto"
				/>
			</div>

			<div className="space-y-2">
				<SectionLabel>Send your first request</SectionLabel>
				<CopyCodeBlock
					code={sendEmailCode[lang].code}
					lang={sendEmailCode[lang].lang}
					label={langFileLabels[lang]}
					si={langIcons[lang]}
					minHeight="auto"
				/>
			</div>
		</div>
	);
}
