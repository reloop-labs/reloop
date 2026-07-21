"use client";

import { cn } from "@reloop/ui/cn";

export type EntityTab = {
	id: string;
	label: string;
	count?: number;
};

export function EntityTabs({
	tabs,
	active,
	onChange,
}: {
	tabs: EntityTab[];
	active: string;
	onChange: (id: string) => void;
}) {
	return (
		<div className="sticky top-0 z-[5] -mx-1 overflow-x-auto border-stroke-soft-100 border-b bg-bg-white-0/90 px-1 backdrop-blur-md dark:border-stroke-soft-100/40 dark:bg-[#0a0a0a]/90">
			<div className="flex min-w-max gap-0.5 py-1">
				{tabs.map((tab) => {
					const isActive = tab.id === active;
					return (
						<button
							key={tab.id}
							type="button"
							onClick={() => onChange(tab.id)}
							className={cn(
								"relative flex items-center gap-1.5 rounded-lg px-3 py-2 font-medium text-[13px] transition-colors",
								isActive
									? "bg-bg-weak-50 text-text-strong-950 dark:bg-white/[0.06]"
									: "text-text-sub-600 hover:bg-bg-weak-50/70 hover:text-text-strong-950 dark:hover:bg-white/[0.04]",
							)}
						>
							{tab.label}
							{typeof tab.count === "number" ? (
								<span
									className={cn(
										"rounded-md px-1.5 py-0.5 font-semibold text-[10px] tabular-nums",
										isActive
											? "bg-bg-white-0 text-text-sub-600 dark:bg-black/30"
											: "bg-bg-weak-50 text-text-soft-400 dark:bg-white/[0.04]",
									)}
								>
									{tab.count}
								</span>
							) : null}
						</button>
					);
				})}
			</div>
		</div>
	);
}
