"use client";

import { cn } from "@reloop/ui/cn";
import { CodeBlock } from "@reloop/ui/code-block";
import { Icon } from "@reloop/ui/icon";
import { useState } from "react";

export type CopyCodeBlockIcon = {
	path: string;
	hex: string;
};

export type CopyCodeBlockTab = {
	id: string;
	label: string;
	si: CopyCodeBlockIcon;
};

export function CopyCodeBlock({
	code,
	lang,
	copyValue,
	label,
	windowTitle,
	si,
	tabs,
	activeTab,
	onTabChange,
	className,
	hideLineNumbers = false,
	noScroll = true,
}: {
	code: string;
	lang: string;
	copyValue?: string;
	label?: string;
	windowTitle?: string;
	si?: CopyCodeBlockIcon;
	tabs?: CopyCodeBlockTab[];
	activeTab?: string;
	onTabChange?: (id: string) => void;
	className?: string;
	hideLineNumbers?: boolean;
	noScroll?: boolean;
}) {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(copyValue ?? code);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			// Clipboard may be unavailable outside a secure context.
		}
	};

	const displayLabel = label ?? lang;
	const hasTabs = tabs && tabs.length > 0;
	const addressBarTitle = windowTitle ?? displayLabel;

	return (
		<div
			className={cn(
				"group relative overflow-hidden rounded-2xl border border-stroke-soft-100 bg-transparent dark:border-stroke-soft-100/40",
				className,
			)}
		>
			{/* Browser chrome */}
			<div className="flex items-center gap-3 border-stroke-soft-100 border-b px-4 py-3 dark:border-stroke-soft-100/40">
				<div className="flex shrink-0 gap-1.5">
					<div className="size-3 rounded-full bg-bg-weak-50" />
					<div className="size-3 rounded-full bg-bg-weak-50" />
					<div className="size-3 rounded-full bg-bg-weak-50" />
				</div>

				<div className="mx-auto flex h-4 min-w-0 max-w-md flex-1 items-center justify-center gap-1.5 rounded-lg px-3 font-medium text-text-sub-600 text-xs">
					<Icon name="lock" className="size-3 shrink-0 opacity-60" />
					<span className="truncate font-mono">{addressBarTitle}</span>
				</div>

				<button
					type="button"
					onClick={handleCopy}
					aria-label={copied ? "Copied" : "Copy code"}
					className="shrink-0 cursor-pointer text-text-sub-600 transition-colors hover:text-text-strong-950 dark:text-white/45 dark:hover:text-white"
				>
					<Icon name={copied ? "check" : "copy"} className="size-4 stroke-3" />
				</button>
			</div>

			{/* Language tabs or file label */}
			{hasTabs ? (
				<div className="flex items-center border-stroke-soft-100 border-b px-4 dark:border-stroke-soft-100/40">
					{tabs.map((tab) => {
						const isActive = tab.id === activeTab;
						const brandColor = `#${tab.si.hex}`;
						return (
							<button
								key={tab.id}
								type="button"
								onClick={() => onTabChange?.(tab.id)}
								className={cn(
									"relative flex items-center gap-2 py-3 pr-5 font-medium text-sm transition-colors",
									isActive
										? "text-text-strong-950 dark:text-white"
										: "text-text-soft-400 hover:text-text-sub-600 dark:hover:text-white/60",
								)}
							>
								<svg
									role="img"
									viewBox="0 0 24 24"
									className="size-4 shrink-0"
									fill="currentColor"
									xmlns="http://www.w3.org/2000/svg"
									style={isActive ? { color: brandColor } : undefined}
									aria-hidden
								>
									<path d={tab.si.path} />
								</svg>
								{tab.label}
								{isActive ? (
									<span
										className="absolute right-5 bottom-0 left-0 h-[2px] rounded-full"
										style={{ backgroundColor: brandColor }}
									/>
								) : null}
							</button>
						);
					})}
				</div>
			) : (
				<div className="flex items-center gap-2 border-stroke-soft-100 border-b px-4 py-3 dark:border-stroke-soft-100/40">
					{si ? (
						<svg
							role="img"
							viewBox="0 0 24 24"
							className="size-4 shrink-0"
							fill="currentColor"
							xmlns="http://www.w3.org/2000/svg"
							style={{ color: `#${si.hex}` }}
							aria-hidden
						>
							<path d={si.path} />
						</svg>
					) : null}
					<span className="font-medium text-sm text-text-sub-600 dark:text-white/50">
						{displayLabel}
					</span>
				</div>
			)}

			{/* Code body — transparent */}
			<div className="bg-transparent">
				<CodeBlock
					code={code}
					lang={lang}
					className="text-[15px] leading-7 sm:text-base sm:leading-8 [&_.line::before]:text-sm"
					hideLineNumbers={hideLineNumbers}
					noScroll={noScroll}
				/>
			</div>
		</div>
	);
}
