import { Logo } from "@reloop/ui/logo";
import type { SimpleIcon } from "simple-icons";
import { BrandIcon } from "./brand-icon";

/**
 * Dual brand tiles for compare heroes.
 * Soft rounded tiles on a subtle stage — Dub composition, Reloop tokens.
 */
export function CompareHeroIcons({
	icon,
}: {
	icon: Pick<SimpleIcon, "hex" | "path">;
}) {
	return (
		<div className="flex items-center justify-center gap-4 sm:gap-6">
			{/* Reloop tile */}
			<div
				className="relative flex size-[4.5rem] items-center justify-center rounded-[22px] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_28px_rgba(0,0,0,0.08)] ring-1 ring-black/[0.05] sm:size-24 sm:rounded-[26px] dark:bg-white dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] dark:ring-white/10"
				aria-hidden
			>
				<Logo className="size-full text-text-strong-950 dark:text-[#0a0d12]" />
			</div>

			<span
				className="font-semibold text-sm text-text-sub-600 uppercase tracking-[0.14em] sm:text-base dark:text-white/55"
				aria-hidden
			>
				vs
			</span>

			{/* Competitor tile */}
			<div
				className="relative flex size-[4.5rem] items-center justify-center rounded-[20px] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_28px_rgba(0,0,0,0.08)] ring-1 ring-black/[0.05] sm:size-24 sm:rounded-[24px] dark:bg-white dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] dark:ring-white/10"
				aria-hidden
			>
				<BrandIcon icon={icon} className="size-11 sm:size-14" />
			</div>
		</div>
	);
}
