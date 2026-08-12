import { Icon } from "@reloop/ui/icon";
import type { ReactNode } from "react";

/**
 * Compare-page style section header: icon on top, single title below.
 * No eyebrow label or description.
 */
export function SectionTitle({
	title,
	icon,
	action,
	as = "h2",
	className,
}: {
	title: string;
	/** Icon sprite name or custom node */
	icon: string | ReactNode;
	/** Optional right-side action (e.g. View all) */
	action?: ReactNode;
	as?: "h1" | "h2";
	className?: string;
}) {
	const Heading = as;

	return (
		<div
			className={
				className ??
				"flex flex-wrap items-end justify-between gap-4 border-stroke-soft-200 border-b px-6 py-10 sm:px-10 sm:py-12 lg:px-12 dark:border-white/10"
			}
		>
			<div className="flex flex-col items-start gap-2.5">
				{typeof icon === "string" ? (
					<Icon
						name={icon}
						className="size-5 shrink-0 text-text-strong-950 dark:text-white"
						aria-hidden
					/>
				) : (
					icon
				)}
				<Heading className="font-semibold text-text-strong-950 text-xl tracking-tight sm:text-2xl lg:text-[1.65rem] dark:text-white">
					{title}
				</Heading>
			</div>
			{action ? <div className="shrink-0">{action}</div> : null}
		</div>
	);
}
