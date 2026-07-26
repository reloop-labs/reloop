import { cn } from "@reloop/ui/cn";
import type React from "react";

/**
 * Full-bleed section inside the compare page frame.
 * Side borders live on the parent frame; this only adds a bottom divider
 * and vertical padding. Constrain inner components with maxWidth.
 */
export function CompareSection({
	children,
	className,
	/** Max width for the inner content. Default full frame width. */
	maxWidth = "full",
	/** Skip the bottom divider (last section). */
	noDivider = false,
	/** Tighter top padding after the hero divider. */
	flushTop = false,
	/** Drop horizontal padding so gutters (e.g. hatch) can meet the frame rails. */
	flushX = false,
	/** Display square dot matrix background. */
	hasDotGrid = false,
}: {
	children: React.ReactNode;
	className?: string;
	maxWidth?: "full" | "5xl" | "4xl" | "3xl" | "2xl";
	noDivider?: boolean;
	flushTop?: boolean;
	flushX?: boolean;
	hasDotGrid?: boolean;
}) {
	const maxWidthClass =
		maxWidth === "full"
			? "max-w-none"
			: maxWidth === "5xl"
				? "max-w-5xl"
				: maxWidth === "4xl"
					? "max-w-4xl"
					: maxWidth === "3xl"
						? "max-w-3xl"
						: "max-w-2xl";

	return (
		<section className={cn("relative w-full overflow-hidden", className)}>
			{hasDotGrid && (
				<div
					aria-hidden
					className="pointer-events-none absolute inset-0 text-text-strong-950/20 dark:text-white/20"
					style={{
						backgroundImage:
							"radial-gradient(circle, currentColor 1.5px, transparent 1.5px)",
						backgroundSize: "24px 24px",
						maskImage:
							"radial-gradient(ellipse at 50% 40%, black 40%, transparent 85%)",
						WebkitMaskImage:
							"radial-gradient(ellipse at 50% 40%, black 40%, transparent 85%)",
					}}
				/>
			)}
			{!noDivider && (
				<div
					aria-hidden
					className="pointer-events-none absolute bottom-0 left-1/2 w-screen -translate-x-1/2 border-stroke-soft-200 border-b dark:border-white/10"
				/>
			)}
			<div
				className={cn(
					"relative z-10 mx-auto w-full",
					flushX ? "px-0" : "px-4 sm:px-6 lg:px-8",
					flushTop
						? "pt-10 pb-16 sm:pt-12 sm:pb-20 lg:pb-24"
						: "py-16 sm:py-20 lg:py-24",
					maxWidthClass,
				)}
			>
				{children}
			</div>
		</section>
	);
}
