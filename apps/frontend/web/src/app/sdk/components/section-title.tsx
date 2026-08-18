import { cn } from "@reloop/ui/cn";
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
	size = "lg",
	className,
	titleClassName,
	id,
}: {
	title: string;
	/** Icon sprite name or custom node */
	icon: string | ReactNode;
	/** Optional right-side action (e.g. View all) */
	action?: ReactNode;
	as?: "h1" | "h2";
	size?: "default" | "lg" | "xl";
	className?: string;
	titleClassName?: string;
	id?: string;
}) {
	const Heading = as;

	const sizeClasses = {
		default: "text-xl sm:text-2xl lg:text-[1.65rem]",
		lg: "text-2xl sm:text-3xl lg:text-[2.25rem] leading-[1.12]",
		xl: "text-[1.75rem] sm:text-4xl lg:text-[2.75rem] leading-[1.08]",
	};

	const iconSizeClasses = {
		default: "size-5",
		lg: "size-6",
		xl: "size-7",
	};

	return (
		<div
			className={cn(
				"flex flex-wrap items-end justify-between gap-4 border-stroke-soft-200 border-b px-6 py-10 sm:px-10 sm:py-12 lg:px-12 dark:border-white/10",
				className,
			)}
		>
			<div className="flex flex-col items-start gap-3">
				{typeof icon === "string" ? (
					<Icon
						name={icon}
						className={cn(
							"shrink-0 text-text-strong-950 dark:text-white",
							iconSizeClasses[size],
						)}
						aria-hidden
					/>
				) : (
					icon
				)}
				<Heading
					id={id}
					className={cn(
						"font-semibold text-text-strong-950 tracking-tight dark:text-white",
						sizeClasses[size],
						titleClassName,
					)}
				>
					{title}
				</Heading>
			</div>
			{action ? <div className="shrink-0">{action}</div> : null}
		</div>
	);
}
