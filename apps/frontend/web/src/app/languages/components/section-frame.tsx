import { cn } from "@reloop/ui/cn";
import type { ReactNode } from "react";

/**
 * Languages/SDKs section chrome:
 * - Full-bleed horizontal rule(s) that run into the side gutters
 * - Centered content column with left/right vertical borders
 */
export function SectionFrame({
	id,
	children,
	className,
	showTopRule = true,
}: {
	id?: string;
	children: ReactNode;
	className?: string;
	/** Draw a full-viewport top hairline into the side gutters */
	showTopRule?: boolean;
}) {
	return (
		<section
			id={id}
			className={cn(
				"relative w-full bg-bg-white-0 text-text-strong-950 dark:bg-black dark:text-white",
				className,
			)}
		>
			{/* Full-bleed bg line — spans viewport, including side spacing/gutters */}
			{showTopRule ? (
				<div
					aria-hidden
					className="-translate-x-1/2 pointer-events-none absolute top-0 left-1/2 z-10 h-px w-screen bg-stroke-soft-200 dark:bg-white/10"
				/>
			) : null}

			{/* Content column: vertical rules only */}
			<div className="relative mx-auto w-full max-w-5xl border-stroke-soft-200 border-x md:max-w-7xl dark:border-white/10">
				{children}
			</div>
		</section>
	);
}

/**
 * Diagonal hatch fill — same language as resource cards / design reference.
 * Width matches section title padding (px-6 / sm:px-10 / lg:px-12) so icon
 * grids line up with headings.
 */
export function HatchGutter({
	side,
	className,
}: {
	side: "left" | "right";
	className?: string;
}) {
	return (
		<div
			aria-hidden
			className={cn(
				"w-6 shrink-0 self-stretch text-stroke-soft-200/80 sm:w-10 lg:w-12 dark:text-white/[0.08]",
				side === "left"
					? "border-stroke-soft-200 border-r dark:border-white/10"
					: "border-stroke-soft-200 border-l dark:border-white/10",
				className,
			)}
			style={{
				backgroundImage:
					"repeating-linear-gradient(-45deg, transparent 0, transparent 6px, currentColor 6px, currentColor 6.75px)",
			}}
		/>
	);
}

/**
 * Icon grid band with hatched side gutters so cells align with section titles.
 */
export function AlignedIconBand({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<div className={cn("flex min-h-0", className)}>
			<HatchGutter side="left" />
			<div className="min-w-0 flex-1">{children}</div>
			<HatchGutter side="right" />
		</div>
	);
}
