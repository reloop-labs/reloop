"use client";

import { cn } from "@reloop/ui/cn";
import { CodeBlock } from "@reloop/ui/code-block";
import { CheckCircle2, Copy } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";

export function CopyCodeBlock({
	code,
	lang,
	copyValue,
}: {
	code: string;
	lang: string;
	copyValue?: string;
}) {
	const [copied, setCopied] = useState(false);
	const { resolvedTheme } = useTheme();

	const handleCopy = () => {
		navigator.clipboard.writeText(copyValue ?? code);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className="group relative overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-weak-50">
			<div className="max-h-52 overflow-auto">
				<CodeBlock
					code={code}
					lang={lang}
					theme={resolvedTheme === "light" ? "rose-pine-dawn" : "vesper"}
				/>
			</div>
			<button
				type="button"
				onClick={handleCopy}
				className={cn(
					"absolute top-2 right-2 flex items-center gap-1.5 rounded-md border border-stroke-soft-200 bg-bg-white-0 px-2 py-1",
					"text-label-xs text-text-sub-600 shadow-xs transition-all duration-150",
					"opacity-0 group-hover:opacity-100 hover:border-stroke-soft-300 hover:text-text-strong-950",
				)}
			>
				{copied ? (
					<CheckCircle2 className="h-3 w-3 text-success-base" />
				) : (
					<Copy className="h-3 w-3" />
				)}
				{copied ? "Copied!" : "Copy"}
			</button>
		</div>
	);
}
