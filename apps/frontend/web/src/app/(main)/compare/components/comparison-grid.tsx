import Link from "next/link";
import { competitorBrands } from "../competitor-brands";
import { BrandIcon } from "./brand-icon";

export function ComparisonGrid() {
	return (
		<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
			{competitorBrands.map((brand) => {
				const glow = `#${brand.icon.hex}`;

				return (
					<Link
						key={brand.href}
						href={brand.href}
						aria-label={`Reloop vs ${brand.name}`}
						className="group relative flex flex-col items-center gap-3 rounded-2xl border border-stroke-soft-200/80 bg-bg-weak-50/50 px-4 py-6 transition-all duration-300 hover:border-stroke-soft-300 hover:bg-bg-soft-50 sm:py-8 dark:border-white/[0.08] dark:bg-white/[0.02] dark:hover:border-white/15 dark:hover:bg-white/[0.04]"
					>
						<div
							aria-hidden
							className="pointer-events-none absolute inset-x-6 bottom-3 h-10 opacity-40 blur-xl transition-opacity duration-300 group-hover:opacity-70"
							style={{
								background: `radial-gradient(ellipse at center, color-mix(in srgb, ${glow} 50%, transparent) 0%, transparent 75%)`,
							}}
						/>
						<div className="relative flex size-16 items-center justify-center rounded-[20px] border border-stroke-soft-200/80 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-transform duration-300 group-hover:scale-[1.04] sm:size-[4.5rem] dark:border-white/10 dark:shadow-none">
							<BrandIcon icon={brand.icon} className="size-8 sm:size-9" />
						</div>
						<span className="font-semibold text-[13px] text-text-strong-950 tracking-tight sm:text-[14px] dark:text-white">
							{brand.name}
						</span>
					</Link>
				);
			})}
		</div>
	);
}
