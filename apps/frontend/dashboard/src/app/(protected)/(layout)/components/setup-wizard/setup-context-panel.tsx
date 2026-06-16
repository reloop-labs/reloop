"use client";

import {
	buildSetupCodeSnippet,
	buildSetupPrompt,
	type IntegrationMode,
	type SetupLanguageCode,
	setupFileLabels,
	setupInstallCommands,
	setupShikiLang,
} from "@fe/dashboard/lib/integration/snippets";
import { CodeBlock } from "@reloop/ui/code-block";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Lightbulb, Sparkles, Terminal } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { SetupLanguagePills } from "./setup-language-pills";

function CopyButton({ text, label }: { text: string; label: string }) {
	const [copied, setCopied] = useState(false);

	const handleCopy = () => {
		navigator.clipboard.writeText(text);
		setCopied(true);
		toast.success(`${label} copied to clipboard`);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<button
			type="button"
			onClick={handleCopy}
			className="flex h-7 items-center justify-center gap-1.5 rounded-lg border border-stroke-soft-100 bg-white px-2.5 font-semibold text-text-strong-950 text-xs transition-all hover:bg-bg-weak-50 active:scale-95 dark:border-white/[0.06] dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.08]"
		>
			{copied ? (
				<span className="flex items-center gap-1 font-semibold text-emerald-500">
					<Check className="h-3 w-3" strokeWidth={3} />
					Copied
				</span>
			) : (
				<span className="flex items-center gap-1.5">
					<Copy className="h-3 w-3" />
					Copy
				</span>
			)}
		</button>
	);
}

export function SetupContextPanel({
	apiKeyDisplay,
	domain,
	mode,
	setupLang,
	onModeChange,
	onSetupLangChange,
}: {
	apiKeyDisplay: string;
	domain: string;
	mode: IntegrationMode;
	setupLang: SetupLanguageCode;
	onModeChange: (mode: IntegrationMode) => void;
	onSetupLangChange: (lang: SetupLanguageCode) => void;
}) {
	const activeTab = mode === "ai" ? "prompt" : "code";

	const aiPrompt = useMemo(
		() => buildSetupPrompt(setupLang, apiKeyDisplay, domain),
		[setupLang, apiKeyDisplay, domain],
	);

	const codeSnippet = useMemo(
		() => buildSetupCodeSnippet(setupLang, apiKeyDisplay, domain),
		[setupLang, apiKeyDisplay, domain],
	);

	return (
		<div>
			<div>
				<h2 className="font-bold text-lg text-text-strong-950 dark:text-white">
					Developer Playground
				</h2>
				<p className="mt-1 text-text-sub-600 text-xs dark:text-white/40">
					Select your language and choose how to integrate Reloop into your
					application.
				</p>
			</div>

			<div className="mt-6">
				<SetupLanguagePills value={setupLang} onChange={onSetupLangChange} />
			</div>

			<div className="mt-6 flex border-stroke-soft-100 border-b dark:border-white/[0.04]">
				<button
					type="button"
					onClick={() => onModeChange("ai")}
					className={`relative flex items-center gap-2 px-1 pb-3 font-semibold text-xs transition-all ${
						activeTab === "prompt"
							? "text-primary-base"
							: "text-text-sub-600 hover:text-text-strong-950 dark:text-white/40 dark:hover:text-white"
					}`}
				>
					<Sparkles className="h-3.5 w-3.5" />
					Prompt for AI Assistant
					{activeTab === "prompt" && (
						<motion.div
							layoutId="setupActiveTabUnderline"
							className="absolute right-0 bottom-0 left-0 h-[2px] bg-primary-base"
							transition={{ type: "spring", stiffness: 380, damping: 30 }}
						/>
					)}
				</button>
				<button
					type="button"
					onClick={() => onModeChange("manual")}
					className={`relative ml-6 flex items-center gap-2 px-1 pb-3 font-semibold text-xs transition-all ${
						activeTab === "code"
							? "text-primary-base"
							: "text-text-sub-600 hover:text-text-strong-950 dark:text-white/40 dark:hover:text-white"
					}`}
				>
					<Terminal className="h-3.5 w-3.5" />
					Direct SDK Integration
					{activeTab === "code" && (
						<motion.div
							layoutId="setupActiveTabUnderline"
							className="absolute right-0 bottom-0 left-0 h-[2px] bg-primary-base"
							transition={{ type: "spring", stiffness: 380, damping: 30 }}
						/>
					)}
				</button>
			</div>

			<div className="mt-5">
				<AnimatePresence mode="wait">
					{activeTab === "prompt" ? (
						<motion.div
							key="prompt-container"
							initial={{ opacity: 0, y: 5 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -5 }}
							transition={{ duration: 0.15 }}
							className="relative rounded-2xl border border-primary-base/20 bg-primary-base/5 p-5 dark:border-primary-base/30 dark:bg-primary-base/10"
						>
							<div className="mb-3.5 flex items-center justify-between border-primary-base/15 border-b pb-3.5 dark:border-primary-base/25">
								<div className="flex items-center gap-1.5 text-primary-base">
									<Sparkles className="h-3.5 w-3.5" />
									<span className="font-semibold text-xs uppercase tracking-wider">
										AI Instruction Prompt
									</span>
								</div>
								<CopyButton text={aiPrompt} label="AI prompt" />
							</div>
							<div className="scrollbar-hide max-h-[280px] overflow-y-auto py-1">
								<div className="select-text whitespace-pre-wrap pr-10 font-mono text-[13px] text-text-strong-950 leading-relaxed dark:text-zinc-200">
									{aiPrompt}
								</div>
							</div>
						</motion.div>
					) : (
						<motion.div
							key="code-container"
							initial={{ opacity: 0, y: 5 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -5 }}
							transition={{ duration: 0.15 }}
							className="relative rounded-2xl border border-primary-base/20 bg-primary-base/5 p-5 dark:border-primary-base/30 dark:bg-primary-base/10"
						>
							<div className="mb-3.5 flex items-center justify-between border-primary-base/15 border-b pb-3.5 dark:border-primary-base/25">
								<div className="flex items-center gap-1.5 text-primary-base">
									<Terminal className="h-3.5 w-3.5" />
									<span className="font-semibold text-xs uppercase tracking-wider">
										{setupFileLabels[setupLang]}
									</span>
								</div>
								<CopyButton text={codeSnippet} label="SDK code snippet" />
							</div>
							<div className="scrollbar-hide max-h-[280px] overflow-x-auto py-1">
								<CodeBlock
									code={codeSnippet}
									lang={setupShikiLang[setupLang]}
									hideLineNumbers
									className="[&>pre]:!p-0 p-0 font-mono text-[13px] leading-relaxed"
								/>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			<div className="mt-5 flex items-start gap-2.5 rounded-xl border border-primary-base/10 bg-primary-base/5 p-4 text-text-sub-600 text-xs dark:text-white/60">
				<Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary-base" />
				<div>
					{activeTab === "prompt" ? (
						<p>
							Copy the prompt above and paste it into your AI editor (Cursor,
							Copilot, etc.). It instructs the agent to automatically run{" "}
							<code className="rounded bg-primary-base/10 px-1 py-0.5 font-mono font-semibold text-primary-base dark:bg-primary-base/20">
								{setupInstallCommands[setupLang]}
							</code>{" "}
							and write the full implementation for you.
						</p>
					) : (
						<p>
							Install the SDK first:{" "}
							<code className="select-all rounded bg-white/10 px-1.5 py-0.5 font-mono text-text-strong-950 dark:bg-white/[0.05] dark:text-white">
								{setupInstallCommands[setupLang]}
							</code>
							, then paste this template to send your first email.
						</p>
					)}
				</div>
			</div>
		</div>
	);
}
