"use client";

import { sendEmailXCodeSamples } from "@reloop/code-samples/mail";
import type { CodeSample } from "@reloop/code-samples/types";
import { CopyCodeBlock } from "@reloop/ui/copy-code-block";
import { JAVA_ICON } from "@reloop/ui/icons/java";
import { useMemo, useState } from "react";
import {
	siDotnet,
	siElixir,
	siGnubash,
	siGo,
	siNodedotjs,
	siPhp,
	siPython,
	siRuby,
	siRust,
} from "simple-icons";

/** Tab order matching dashboard email API samples. */
const LANG_ORDER = [
	"node",
	"python",
	"php",
	"go",
	"ruby",
	"rust",
	"java",
	"dotnet",
	"curl",
	"elixir",
] as const;

const LANGUAGE_ICONS: Record<string, { path: string; hex: string }> = {
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
	if (id === "rust" || l === "rust") {
		hex = "e24d2b";
	}

	return { ...icon, path: icon.path, hex };
}

function orderSamples(samples: readonly CodeSample[]): CodeSample[] {
	const byId = new Map(samples.map((sample) => [sample.id, sample]));
	const ordered: CodeSample[] = [];

	for (const id of LANG_ORDER) {
		const sample = byId.get(id);
		if (sample) {
			ordered.push(sample);
			byId.delete(id);
		}
	}

	for (const sample of byId.values()) {
		ordered.push(sample);
	}

	return ordered;
}

export function CodeSamples({ samples }: { samples: readonly CodeSample[] }) {
	const ordered = useMemo(() => orderSamples(samples), [samples]);
	const firstSample = ordered[0];
	const defaultId = ordered.some((sample) => sample.id === "node")
		? "node"
		: (firstSample?.id ?? "node");
	const [activeTab, setActiveTab] = useState(defaultId);

	if (!firstSample || ordered.length === 0) return null;

	const resolvedActiveTab = ordered.some((sample) => sample.id === activeTab)
		? activeTab
		: defaultId;

	const activeSample =
		ordered.find((sample) => sample.id === resolvedActiveTab) ?? firstSample;

	const tabs = ordered.map((sample) => ({
		id: sample.id,
		label: sample.label,
		si: getIconForSample(sample.id, sample.lang),
	}));

	return (
		<div className="my-6">
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

/** Multi-language send-email samples (same source as dashboard API details). */
export function SendEmailCodeSamples() {
	return <CodeSamples samples={sendEmailXCodeSamples} />;
}
