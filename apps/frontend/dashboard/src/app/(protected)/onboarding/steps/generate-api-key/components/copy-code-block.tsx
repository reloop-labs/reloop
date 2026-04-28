"use client";

import { CodeBlock } from "@reloop/ui/code-block";
import { Icon } from "@reloop/ui/icon";
import { useState } from "react";
import { toast } from "sonner";

export function CopyCodeBlock({
	code,
	lang,
	copyValue,
	label,
}: {
	code: string;
	lang: string;
	copyValue?: string;
	label?: string;
}) {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(copyValue ?? code);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			toast.error("Failed to copy");
		}
	};

	const displayLabel = label ?? lang;

	return (
		<div className="group relative overflow-hidden rounded-2xl border border-stroke-soft-100 dark:border-stroke-soft-100/40">
			{/* Header */}
			<div className="flex items-center justify-between px-4 py-2">
				<p className="font-medium text-sm text-text-sub-600">{displayLabel}</p>
				<button
					type="button"
					onClick={handleCopy}
					className="cursor-pointer text-text-sub-600 transition-colors hover:text-text-strong-950"
				>
					<Icon
						name={copied ? "check" : "copy"}
						className="h-3.5 w-3.5 stroke-3"
					/>
				</button>
			</div>
			{/* Code body */}
			<div className="rounded-t-[10px] rounded-b-2xl bg-bg-weak-50/70 dark:bg-bg-weak-50/45">
				<CodeBlock
					code={code}
					lang={lang}
					className="text-[10px]"
					hideLineNumbers={true}
					noScroll={true}
				/>
			</div>
		</div>
	);
}
