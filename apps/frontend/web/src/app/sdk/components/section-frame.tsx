import { cn } from "@reloop/ui/cn";
import type { ReactNode } from "react";

/**
 * Languages/SDKs section chrome:
 * - Top rule on the section (w-full, never w-screen — avoids horizontal scroll)
 * - Content constrained to max-w-5xl / md:max-w-7xl with left/right borders
 */
export function SectionFrame({
	id,
	children,
	className,
	showTopRule = true,
	framed = true,
}: {
	id?: string;
	children: ReactNode;
	className?: string;
	/** Top hairline across the section width */
	showTopRule?: boolean;
	/** Inner max-width + vertical rails. Skip when the parent page is already framed. */
	framed?: boolean;
}) {
	return (
		<section
			id={id}
			className={cn(
				"relative w-full max-w-full overflow-x-clip bg-bg-white-0 text-text-strong-950 dark:bg-black dark:text-white",
				showTopRule && "border-stroke-soft-200 border-t dark:border-white/10",
				className,
			)}
		>
			{framed ? (
				<div className="relative mx-auto w-full max-w-5xl border-stroke-soft-200 md:max-w-7xl xl:border-x dark:border-white/10">
					{children}
				</div>
			) : (
				children
			)}
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
		<div className={cn("flex min-h-0 min-w-0", className)}>
			<HatchGutter side="left" />
			<div className="min-w-0 flex-1 overflow-hidden">{children}</div>
			<HatchGutter side="right" />
		</div>
	);
}
