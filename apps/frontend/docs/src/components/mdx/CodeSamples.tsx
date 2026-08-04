"use client";

import { useApiLanguage } from "@reloop/fe-docs/lib/use-api-language";
import { CopyCodeBlock } from "@reloop/ui/copy-code-block";
import { JAVA_ICON } from "@reloop/ui/icons/java";
import {
	siDotnet,
	siElixir,
	siGnubash,
	siGo,
	siJson,
	siNodedotjs,
	siPhp,
	siPython,
	siRuby,
	siRust,
} from "simple-icons";

export type LearnCodeSample = {
	id: string;
	lang: string;
	label: string;
	source: string;
};

const LANGUAGE_ICONS: Record<string, { path: string; hex: string }> = {
	json: siJson,
	node: siNodedotjs,
	nodejs: siNodedotjs,
	javascript: siNodedotjs,
	js: siNodedotjs,
	typescript: siNodedotjs,
	ts: siNodedotjs,
	php: siPhp,
	python: siPython,
	ruby: siRuby,
	go: siGo,
	// Brand hex is #000000 — override so the gear stays visible on dark UI
	rust: { path: siRust.path, hex: "e24d2b" },
	java: JAVA_ICON,
	dotnet: siDotnet,
	csharp: siDotnet,
	curl: siGnubash,
	bash: siGnubash,
	shell: siGnubash,
	elixir: siElixir,
};

function getIconForSample(sampleId: string, lang: string) {
	const icon =
		LANGUAGE_ICONS[sampleId.toLowerCase()] ||
		LANGUAGE_ICONS[lang.toLowerCase()] ||
		siGnubash;

	let hex = icon.hex;
	const id = sampleId.toLowerCase();
	const l = lang.toLowerCase();
	if (id === "json" || l === "json") {
		hex = "f59e0b";
	}
	if (id === "rust" || l === "rust") {
		hex = "e24d2b";
	}

	return { ...icon, path: icon.path, hex };
}

export function CodeSamples({ samples }: { samples: LearnCodeSample[] }) {
	const firstSample = samples?.[0];
	if (!samples || samples.length === 0 || !firstSample) return null;

	const availableIds = samples.map((sample) => sample.id);
	const defaultId = availableIds.includes("node")
		? "node"
		: (availableIds[0] ?? "node");
	const [activeTab, setActiveTab] = useApiLanguage(availableIds, defaultId);

	const resolvedActiveTab =
		activeTab && samples.some((sample) => sample.id === activeTab)
			? activeTab
			: defaultId;

	const activeSample =
		samples.find((sample) => sample.id === resolvedActiveTab) ?? firstSample;

	const tabs = samples.map((sample) => ({
		id: sample.id,
		label: sample.label,
		si: getIconForSample(sample.id, sample.lang),
	}));

	return (
		<div className="my-4">
			<CopyCodeBlock
				code={activeSample.source}
				lang={activeSample.lang}
				tabs={tabs}
				activeTab={resolvedActiveTab}
				onTabChange={setActiveTab}
				noScroll={false}
				codeExtraPadding
			/>
		</div>
	);
}
