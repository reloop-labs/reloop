import { Logo } from "@reloop/ui/logo";
import type { SimpleIcon } from "simple-icons";
import { BrandIcon } from "./brand-icon";

export function CompareHeroIcons({
	icon,
}: {
	icon: Pick<SimpleIcon, "hex" | "path">;
}) {
	const glow = `#${icon.hex}`;

	return (
		<div className="mb-8 flex items-center justify-center gap-5 sm:mb-10 sm:gap-8">
			<div
				className="relative flex size-24 items-center justify-center rounded-[26px] border border-stroke-soft-200/80 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] sm:size-28 sm:rounded-[30px] dark:border-white/10"
				aria-hidden
			>
				<Logo className="size-full text-text-strong-950 dark:text-[#0a0d12]" />
			</div>

			<span
				className="font-semibold text-sm text-text-sub-600 uppercase tracking-[0.12em] sm:text-base dark:text-white/55"
				aria-hidden
			>
				vs
			</span>

			<div className="relative flex size-24 items-center justify-center sm:size-28">
				<div
					aria-hidden
					className="pointer-events-none absolute inset-0 opacity-50 blur-xl"
					style={{
						background: `radial-gradient(ellipse at center, color-mix(in srgb, ${glow} 55%, transparent) 0%, transparent 75%)`,
					}}
				/>
				<div
					className="relative flex size-24 items-center justify-center rounded-[22px] border border-stroke-soft-200/80 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] sm:size-28 sm:rounded-[26px] dark:border-white/10"
					aria-hidden
				>
					<BrandIcon icon={icon} className="size-14 sm:size-16" />
				</div>
			</div>
		</div>
	);
}
