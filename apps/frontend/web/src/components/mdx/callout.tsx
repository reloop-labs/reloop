import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import type { ReactNode } from "react";

// Same surface as the post's Summary card; only warning gets a colour.
const variants = {
	info: {
		label: "Note",
		icon: "info-outline",
		accent: "text-text-strong-950 dark:text-white",
	},
	tip: {
		label: "Tip",
		icon: "magic-wand",
		accent: "text-text-strong-950 dark:text-white",
	},
	warning: {
		label: "Warning",
		icon: "alert-triangle",
		accent: "text-warning-base",
	},
} as const;

export function Callout({
	type = "info",
	children,
}: {
	type?: keyof typeof variants;
	children: ReactNode;
}): ReactNode {
	const variant = variants[type];

	return (
		<aside className="my-6 rounded-2xl border border-stroke-soft-200 bg-bg-weak-50/70 p-5 dark:border-white/10 dark:bg-white/[0.03]">
			<div
				className={cn(
					"mb-2 flex items-center gap-1.5 font-mono font-semibold text-[11px] uppercase tracking-widest",
					variant.accent,
				)}
			>
				<Icon name={variant.icon} className="size-3.5" />
				<span>{variant.label}</span>
			</div>
			<div className="text-[14.5px] text-text-sub-600 leading-relaxed dark:text-white/60 [&_p+p]:mt-3! [&_p]:my-0!">
				{children}
			</div>
		</aside>
	);
}
