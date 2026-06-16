"use client";

import { ArrowRight, Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function MaskedKeyCopy({ text }: { text: string }) {
	const [copied, setCopied] = useState(false);

	return (
		<button
			type="button"
			onClick={() => {
				navigator.clipboard.writeText(text);
				setCopied(true);
				toast.success("API Key copied to clipboard");
				setTimeout(() => setCopied(false), 2000);
			}}
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

export function SetupStepApiKey({
	step3Done,
	step2Done,
	maskedKey,
	generatedApiKey,
	isGeneratingKey,
	onGenerate,
}: {
	step3Done: boolean;
	step2Done: boolean;
	maskedKey: string;
	generatedApiKey: string | null;
	isGeneratingKey: boolean;
	onGenerate: () => void;
}) {
	if (step3Done) {
		return (
			<>
				<span className="mt-1 text-text-sub-600/60 text-xs dark:text-white/30">
					API key generated
				</span>
				<div className="mt-3.5 flex items-center gap-2 rounded-lg border border-stroke-soft-100/30 bg-bg-weak-50/50 px-3 py-1.5 dark:border-white/[0.04] dark:bg-white/[0.02]">
					<code className="flex-1 select-all truncate font-mono text-text-strong-950 text-xs dark:text-white/80">
						{generatedApiKey ?? maskedKey}
					</code>
					<MaskedKeyCopy text={generatedApiKey ?? maskedKey} />
				</div>
			</>
		);
	}

	if (!step2Done) return null;

	return (
		<>
			<span className="mt-1 text-text-sub-600 text-xs dark:text-white/50">
				Authenticate your transactional email requests
			</span>
			<button
				type="button"
				onClick={onGenerate}
				disabled={isGeneratingKey}
				className="mt-3.5 inline-flex items-center justify-center gap-1.5 self-start rounded-lg bg-text-strong-950 px-4.5 py-2 font-semibold text-white text-xs transition-all hover:opacity-90 active:scale-95 disabled:pointer-events-none disabled:opacity-50 dark:bg-white dark:text-black"
			>
				{isGeneratingKey ? "Generating..." : "Generate API Key"}
				<ArrowRight className="h-3 w-3" />
			</button>
		</>
	);
}
