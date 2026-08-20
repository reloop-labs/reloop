"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { useState } from "react";

export function CopyableDnsValue({
	value,
	mono = false,
	className,
}: {
	value: string;
	mono?: boolean;
	className?: string;
}) {
	const [copied, setCopied] = useState(false);

	const handleCopy = () => {
		if (typeof navigator !== "undefined" && navigator.clipboard) {
			void navigator.clipboard.writeText(value);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	};

	return (
		<button
			type="button"
			tabIndex={-1}
			onClick={handleCopy}
			onMouseDown={(e) => e.preventDefault()}
			aria-label={copied ? "Copied" : `Copy ${value}`}
			className={cn(
				"group relative flex h-8 w-full min-w-0 cursor-pointer select-none items-center justify-between gap-1.5 overflow-hidden rounded-lg bg-bg-white-0 px-2.5 text-left shadow-regular-xs outline-none transition duration-200 ease-out",
				"before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:ring-1 before:ring-inset before:ring-stroke-soft-100 dark:before:ring-stroke-soft-100/40",
				"hover:bg-bg-weak-50 dark:bg-bg-weak-50/30 dark:hover:bg-bg-weak-50/50",
				"focus:outline-none focus-visible:outline-none",
				copied && "bg-success-lighter/10 before:ring-success-base",
				className,
			)}
		>
			<span
				className={cn(
					"min-w-0 flex-1 truncate text-xs select-none transition-colors duration-150 ease-out",
					mono ? "font-mono" : "font-medium",
					copied
						? "text-success-dark"
						: mono
							? "text-text-sub-600"
							: "text-text-strong-950",
				)}
			>
				{value}
			</span>
			<span className="relative size-3.5 shrink-0 select-none" aria-hidden>
				<Icon
					name="copy"
					className={cn(
						"absolute inset-0 size-3.5 text-text-sub-600/50 transition-opacity duration-150 ease-out group-hover:text-text-strong-950",
						copied ? "opacity-0" : "opacity-100",
					)}
				/>
				<Icon
					name="check"
					className={cn(
						"absolute inset-0 size-3.5 text-success-base transition-opacity duration-150 ease-out",
						copied ? "opacity-100" : "opacity-0",
					)}
				/>
			</span>
		</button>
	);
}


