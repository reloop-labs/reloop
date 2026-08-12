import Link from "next/link";
import { competitorBrands } from "../competitor-brands";
import { BrandIcon } from "./brand-icon";

const BRAND_HIGHLIGHTS: Record<string, string> = {
	Resend: "10x volume savings",
	Mailgun: "Unified stack",
	SendGrid: "Modern React UI & API",
	"AWS SES": "Built-in developer UI",
	Postmark: "Transactional + Marketing",
	Loops: "Native KumoMTA engine",
	Mailchimp: "No contact penalty",
};

export function ComparisonGrid() {
	return (
		<div className="space-y-6">
			<div className="text-center">
				<span className="font-bold text-[12px] text-text-sub-600 uppercase tracking-widest dark:text-white/50">
					Provider Directory
				</span>
				<h2 className="mt-2 font-serif text-[1.8rem] text-text-strong-950 leading-tight tracking-tight sm:text-[2.2rem] dark:text-white">
					Explore dedicated provider comparisons
				</h2>
			</div>

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
				{competitorBrands.map((brand) => {
					const highlight = BRAND_HIGHLIGHTS[brand.name];
					const glow = `#${brand.icon.hex}`;

					return (
						<Link
							key={brand.href}
							href={brand.href}
							aria-label={`Reloop vs ${brand.name}`}
							className="group relative flex flex-col justify-between rounded-2xl border border-stroke-soft-200/80 bg-bg-weak-50/50 p-5 transition-all duration-300 hover:border-stroke-soft-300 hover:bg-bg-white-0 hover:shadow-md dark:border-white/[0.08] dark:bg-white/[0.02] dark:hover:border-white/20 dark:hover:bg-white/[0.04]"
						>
							<div
								aria-hidden
								className="pointer-events-none absolute inset-x-6 bottom-3 h-10 opacity-30 blur-xl transition-opacity duration-300 group-hover:opacity-60"
								style={{
									background: `radial-gradient(ellipse at center, color-mix(in srgb, ${glow} 50%, transparent) 0%, transparent 75%)`,
								}}
							/>
							<div className="relative flex items-center justify-between">
								<div className="flex size-12 items-center justify-center rounded-xl border border-stroke-soft-200/80 bg-white shadow-sm transition-transform duration-300 group-hover:scale-105 dark:border-white/10 dark:shadow-none">
									<BrandIcon icon={brand.icon} className="size-6" />
								</div>
								<span className="font-mono text-[11px] font-semibold text-text-sub-600 group-hover:text-text-strong-950 dark:text-white/40 dark:group-hover:text-white transition-colors">
									Reloop vs {brand.name} →
								</span>
							</div>

							<div className="relative mt-6 space-y-1">
								<h3 className="font-bold text-[16px] text-text-strong-950 tracking-tight dark:text-white">
									{brand.name}
								</h3>
								{highlight ? (
									<span className="inline-block rounded-md bg-bg-weak-50 px-2 py-0.5 font-medium text-[12px] text-text-sub-600 dark:bg-white/10 dark:text-white/70">
										{highlight}
									</span>
								) : null}
							</div>
						</Link>
					);
				})}
			</div>
		</div>
	);
}
