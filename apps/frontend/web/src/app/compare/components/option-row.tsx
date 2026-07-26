import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import type React from "react";

/**
 * Method-selection style row from Add Contacts.
 * Static marketing variant (not interactive unless `href` is set).
 */
export function OptionRow({
	icon,
	title,
	description,
	href,
	trailing,
	className,
}: {
	icon?: React.ReactNode;
	title: string;
	description?: string;
	href?: string;
	trailing?: React.ReactNode;
	className?: string;
}) {
	const content = (
		<>
			<div className="flex min-w-0 items-center gap-3.5">
				{icon ? (
					<div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-stroke-soft-200 bg-bg-weak-50 text-text-strong-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-white">
						{icon}
					</div>
				) : null}
				<div className="min-w-0">
					<div className="font-medium text-[14px] text-text-strong-950 tracking-tight dark:text-white">
						{title}
					</div>
					{description ? (
						<div className="mt-0.5 text-[12px] text-text-sub-600 leading-relaxed dark:text-white/50">
							{description}
						</div>
					) : null}
				</div>
			</div>
			{trailing ??
				(href ? (
					<Icon
						name="arrow-right"
						className="size-4 shrink-0 text-text-soft-400 transition-all group-hover:translate-x-0.5 group-hover:text-text-strong-950 dark:text-white/35 dark:group-hover:text-white"
					/>
				) : null)}
		</>
	);

	const classes = cn(
		"group flex w-full items-center justify-between gap-3 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4 text-left transition-all dark:border-white/10 dark:bg-transparent",
		href &&
			"hover:border-stroke-soft-300 hover:bg-bg-weak-50/70 dark:hover:border-white/15 dark:hover:bg-white/[0.03]",
		className,
	);

	if (href) {
		return (
			<a href={href} className={classes}>
				{content}
			</a>
		);
	}

	return <div className={classes}>{content}</div>;
}
