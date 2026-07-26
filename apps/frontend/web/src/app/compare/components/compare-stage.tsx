import { cn } from "@reloop/ui/cn";
import type React from "react";

/**
 * Soft grid stage for compare heroes (Dub-inspired, Reloop tokens).
 * Frames the full top fold: brand tiles, title, description, and CTAs.
 */
export function CompareStage({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div className={cn("relative mx-auto w-full max-w-[1320px]", className)}>
			{/* Soft floating stage card */}
			<div className="relative overflow-hidden rounded-[28px] border border-stroke-soft-200/80 bg-gradient-to-b from-bg-weak-50/90 to-bg-white-0 px-6 py-16 sm:rounded-[32px] sm:px-12 sm:py-24 lg:py-28 dark:border-white/10 dark:from-white/[0.04] dark:to-transparent">
				{/* Soft color wash */}
				<div
					aria-hidden
					className="pointer-events-none absolute inset-0 overflow-hidden"
				>
					<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(99,102,241,0.06),transparent_50%)] dark:bg-[radial-gradient(ellipse_at_30%_20%,rgba(99,102,241,0.12),transparent_50%)]" />
					<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_80%,rgba(16,185,129,0.05),transparent_50%)] dark:bg-[radial-gradient(ellipse_at_70%_80%,rgba(16,185,129,0.1),transparent_50%)]" />

					{/* Grid, masked to center */}
					<div
						className="absolute inset-0 opacity-50 dark:opacity-25"
						style={{
							backgroundImage: `
								linear-gradient(to right, rgba(0,0,0,0.045) 1px, transparent 1px),
								linear-gradient(to bottom, rgba(0,0,0,0.045) 1px, transparent 1px)
							`,
							backgroundSize: "40px 40px",
							maskImage:
								"radial-gradient(ellipse at 50% 50%, black 15%, transparent 72%)",
							WebkitMaskImage:
								"radial-gradient(ellipse at 50% 50%, black 15%, transparent 72%)",
						}}
					/>
					<div
						className="absolute inset-0 hidden opacity-40 dark:block"
						style={{
							backgroundImage: `
								linear-gradient(to right, rgba(255,255,255,0.07) 1px, transparent 1px),
								linear-gradient(to bottom, rgba(255,255,255,0.07) 1px, transparent 1px)
							`,
							backgroundSize: "40px 40px",
							maskImage:
								"radial-gradient(ellipse at 50% 50%, black 15%, transparent 72%)",
							WebkitMaskImage:
								"radial-gradient(ellipse at 50% 50%, black 15%, transparent 72%)",
						}}
					/>
				</div>

				<div className="relative z-10 w-full text-center">{children}</div>
			</div>
		</div>
	);
}
