"use client";

import { cn } from "@reloop/ui/cn";
import { CodeBlock } from "@reloop/ui/code-block";
import { Icon } from "@reloop/ui/icon";
import { useState } from "react";
import type { SimpleIcon } from "simple-icons";
import { toast } from "sonner";

interface Tab {
	id: string;
	label: string;
	si: SimpleIcon;
}

export function CopyCodeBlock({
	code,
	lang,
	copyValue,
	label,
	si,
	tabs,
	activeTab,
	onTabChange,
}: {
	code: string;
	lang: string;
	copyValue?: string;
	label?: string;
	si?: SimpleIcon;
	tabs?: Tab[];
	activeTab?: string;
	onTabChange?: (id: string) => void;
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
	const hasTabs = tabs && tabs.length > 0;

	return (
		<div className="group relative overflow-hidden rounded-2xl border border-stroke-soft-100 dark:border-stroke-soft-100/40">
			{/* Header */}
			<div className="flex items-center justify-between px-4 py-0">
				{hasTabs ? (
					/* Tab strip */
					<div className="flex items-center">
						{tabs.map((tab) => {
							const isActive = tab.id === activeTab;
							const brandColor = `#${tab.si.hex}`;
							return (
								<button
									key={tab.id}
									type="button"
									onClick={() => onTabChange?.(tab.id)}
									className={cn(
										"relative flex items-center gap-1.5 px-0 py-2 pr-4 font-medium text-xs transition-colors",
										isActive
											? "text-text-strong-950"
											: "text-text-soft-400 hover:text-text-sub-600",
									)}
								>
									<svg
										role="img"
										viewBox="0 0 24 24"
										className="h-3 w-3 shrink-0"
										fill="currentColor"
										xmlns="http://www.w3.org/2000/svg"
										style={isActive ? { color: brandColor } : undefined}
									>
										<path d={tab.si.path} />
									</svg>
									{tab.label}
									{/* Active underline — brand color */}
									{isActive && (
										<span
											className="absolute right-4 bottom-0 left-0 h-[1.5px] rounded-full"
											style={{ backgroundColor: brandColor }}
										/>
									)}
								</button>
							);
						})}
					</div>
				) : (
					/* Single label */
					<div className="flex items-center gap-1.5 py-2 font-medium text-sm text-text-sub-600">
						{si && (
							<svg
								role="img"
								viewBox="0 0 24 24"
								className="h-3.5 w-3.5 shrink-0"
								fill="currentColor"
								xmlns="http://www.w3.org/2000/svg"
								style={{ color: `#${si.hex}` }}
							>
								<path d={si.path} />
							</svg>
						)}
						<span>{displayLabel}</span>
					</div>
				)}

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
			<div className="rounded-t-[12px] rounded-b-2xl bg-bg-weak-50/70 dark:bg-bg-weak-50/45">
				<CodeBlock
					code={code}
					lang={lang}
					className="text-[13px]"
					hideLineNumbers={false}
					noScroll={true}
				/>
			</div>
		</div>
	);
}
