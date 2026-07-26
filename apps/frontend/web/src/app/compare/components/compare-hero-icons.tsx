import { Logo } from "@reloop/ui/logo";
import type { SimpleIcon } from "simple-icons";
import { BrandIcon } from "./brand-icon";

/**
 * Dual brand app icons for compare heroes.
 * Solid color tiles with white marks — clean product-icon style.
 */
export function CompareHeroIcons({
	icon,
}: {
	icon: Pick<SimpleIcon, "hex" | "path">;
}) {
	return (
		<div className="flex items-center justify-center gap-6 sm:gap-8">
			{/* Reloop — black tile, white mark */}
			<div
				className="relative flex size-24 items-center justify-center rounded-[26px] bg-[#0a0d12] sm:size-28 sm:rounded-[30px]"
				aria-hidden
			>
				<Logo className="size-[72%] [&_rect]:!fill-white" />
			</div>

			<span
				className="font-semibold text-sm text-text-sub-600 uppercase tracking-[0.14em] sm:text-base dark:text-white/55"
				aria-hidden
			>
				vs
			</span>

			{/* Competitor — brand color tile, white mark */}
			<div
				className="relative flex size-24 items-center justify-center rounded-[26px] sm:size-28 sm:rounded-[30px]"
				style={{ backgroundColor: `#${icon.hex}` }}
				aria-hidden
			>
				<BrandIcon
					icon={icon}
					fill="#ffffff"
					className="size-12 sm:size-14"
				/>
			</div>
		</div>
	);
}
