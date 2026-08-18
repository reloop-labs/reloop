"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import type { PreviewTabId } from "./preview-scenes";
import { PREVIEW_TABS } from "./preview-scenes";

export function PreviewTabs({
	active,
	onChange,
}: {
	active: PreviewTabId;
	onChange: (id: PreviewTabId) => void;
}) {
	return (
		<div
			role="tablist"
			aria-label="Transactional features"
			className="grid border-stroke-soft-200 border-t sm:grid-cols-3 dark:border-white/10"
		>
			{PREVIEW_TABS.map((tab) => {
				const selected = tab.id === active;
				return (
					<div
						key={tab.id}
						role="tab"
						aria-selected={selected}
						tabIndex={selected ? 0 : -1}
						onClick={() => onChange(tab.id)}
						onKeyDown={(event) => {
							if (event.key === "Enter" || event.key === " ") {
								event.preventDefault();
								onChange(tab.id);
							}
						}}
						className={cn(
							"relative cursor-pointer px-5 py-6 text-left sm:px-6 sm:py-7",
							selected ? "bg-transparent" : "bg-transparent",
						)}
					>
						<span
							aria-hidden
							className={cn(
								"absolute top-5 bottom-5 left-0 w-px",
								selected
									? "bg-primary-base"
									: "bg-stroke-soft-200 dark:bg-white/10",
							)}
						/>
						<Icon
							name={tab.icon}
							className={cn(
								"size-4",
								selected
									? "text-text-strong-950 dark:text-white"
									: "text-text-soft-400 dark:text-white/30",
							)}
						/>
						<p
							className={cn(
								"mt-3 font-semibold text-[15px] tracking-tight",
								selected
									? "text-text-strong-950 dark:text-white"
									: "text-text-sub-600 dark:text-white/40",
							)}
						>
							{tab.title}
						</p>
						<p
							className={cn(
								"mt-2 max-w-[18rem] text-[13.5px] leading-relaxed",
								selected
									? "text-text-sub-600 dark:text-white/55"
									: "text-text-soft-400 dark:text-white/30",
							)}
						>
							{tab.description}
						</p>
						<Link
							href={tab.href}
							onClick={(event) => event.stopPropagation()}
							className={cn(
								"mt-4 inline-flex items-center gap-1 text-[13.5px]",
								selected
									? "text-primary-base"
									: "text-text-soft-400 dark:text-white/30",
							)}
						>
							Learn more
							<span aria-hidden>›</span>
						</Link>
					</div>
				);
			})}
		</div>
	);
}
