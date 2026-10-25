"use client";

import { cn } from "@reloop/ui/cn";
import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

/** Small copy button for table cells; shows on row hover or keyboard focus. */
export function CopyCellButton({
	value,
	label,
}: {
	value: string;
	/** What is being copied, for the accessible name and toast. */
	label: string;
}) {
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		if (!copied) return;
		const timer = setTimeout(() => setCopied(false), 1500);
		return () => clearTimeout(timer);
	}, [copied]);

	return (
		<button
			type="button"
			aria-label={copied ? `${label} copied` : `Copy ${label}`}
			onClick={async (e) => {
				e.preventDefault();
				e.stopPropagation();
				try {
					await navigator.clipboard.writeText(value);
					setCopied(true);
				} catch {
					toast.error(`Failed to copy ${label}`);
				}
			}}
			className={cn(
				"flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-md text-text-sub-600 transition-[opacity,background-color,color] duration-150 hover:bg-bg-weak-50 hover:text-text-strong-950 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stroke-strong-950/20",
				copied ? "opacity-100" : "opacity-0 group-hover/row:opacity-100",
			)}
		>
			{copied ? (
				<Check className="size-3" strokeWidth={2.5} aria-hidden />
			) : (
				<Copy className="size-3" strokeWidth={2.25} aria-hidden />
			)}
		</button>
	);
}
