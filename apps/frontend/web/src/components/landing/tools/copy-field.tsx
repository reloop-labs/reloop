"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { useState } from "react";

export function CopyField({
	label,
	value,
	multiline = false,
	secret = false,
}: {
	label: string;
	value: string;
	multiline?: boolean;
	secret?: boolean;
}) {
	const [copied, setCopied] = useState(false);

	const copy = async () => {
		try {
			await navigator.clipboard.writeText(value);
			setCopied(true);
			setTimeout(() => setCopied(false), 1800);
		} catch {
			// Snippet stays selectable.
		}
	};

	return (
		<div>
			<div className="mb-1.5 flex items-center justify-between gap-2">
				<p className="font-medium text-[13px] text-text-strong-950 dark:text-white">
					{label}
				</p>
				<button
					type="button"
					onClick={copy}
					className="inline-flex items-center gap-1.5 rounded-full border border-stroke-soft-200 px-2.5 py-1 font-mono text-[11px] text-text-sub-600 uppercase tracking-[0.08em] hover:text-text-strong-950 dark:border-white/12 dark:text-white/45 dark:hover:text-white"
				>
					<Icon name={copied ? "check" : "copy"} className="size-3.5" />
					{copied ? "Copied" : "Copy"}
				</button>
			</div>
			<pre
				className={cn(
					"overflow-x-auto rounded-xl border border-stroke-soft-200 bg-bg-weak-50 p-3 font-mono text-[12.5px] text-text-strong-950 dark:border-white/10 dark:bg-black dark:text-white/80",
					multiline ? "whitespace-pre-wrap break-all" : "whitespace-nowrap",
					secret && "max-h-40 overflow-y-auto",
				)}
			>
				{value}
			</pre>
		</div>
	);
}
