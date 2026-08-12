import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import { competitorBrands } from "../competitor-brands";
import { BrandIcon } from "./brand-icon";

const BRAND_DESCRIPTIONS: Record<string, string> = {
	Resend:
		"10x lower volume costs, 100% open-source engine, and built-in AI agent inboxes.",
	SendGrid:
		"Modern React/JSX templates and fast developer UI without legacy enterprise clutter.",
	Mailgun:
		"Unified transactional and marketing email platform with predictable flat pricing.",
	"AWS SES":
		"AWS SES-level pricing with a modern dashboard UI and deliverability controls.",
	Postmark:
		"High deliverability across both transactional and broadcast marketing streams.",
	Loops:
		"Native KumoMTA engine with full developer APIs and self-hosting freedom.",
	Mailchimp:
		"Pay only for sent email volume without contact list size penalty pricing.",
};

export function ComparisonGrid() {
	return (
		<section className="w-full border-stroke-soft-200 border-t bg-bg-white-0 text-text-strong-950 dark:border-white/10 dark:bg-black dark:text-white">
			{/* Left-Aligned Header with Comparison Icon */}
			<div className="flex flex-col items-start gap-2.5 px-6 py-12 sm:px-10 sm:py-14 lg:px-12">
				<svg
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					className="size-5 text-text-strong-950 dark:text-white"
					aria-hidden="true"
				>
					<path
						d="M12 3L12 21M12 4.30969C11.0904 4.30969 10.1808 4.41019 9.28927 4.61121C6.82045 5.16789 4.89278 7.02094 4.31367 9.39419C3.89544 11.1081 3.89544 12.8918 4.31367 14.6058C4.89278 16.979 6.82045 18.8321 9.28928 19.3887C10.1808 19.5898 11.0904 19.6903 12 19.6903"
						stroke="currentColor"
						strokeWidth="1.5"
						strokeLinecap="round"
					/>
					<path
						d="M14.7107 19.3887C17.1795 18.8321 19.1072 16.979 19.6863 14.6058C20.1045 12.8918 20.1045 11.1081 19.6863 9.39419C19.1072 7.02094 17.1795 5.16789 14.7107 4.61121"
						stroke="currentColor"
						strokeWidth="1.5"
						strokeLinecap="round"
					/>
				</svg>
				<h2 className="font-semibold text-text-strong-950 text-xl tracking-tight sm:text-2xl lg:text-[1.65rem] dark:text-white">
					Explore dedicated provider comparisons.
				</h2>
			</div>

			{/* Full-width Divider & Grid Section */}
			<div className="border-stroke-soft-200 border-t px-6 py-12 sm:px-10 lg:px-12 dark:border-white/10">
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{competitorBrands.map((brand) => {
						const description =
							BRAND_DESCRIPTIONS[brand.name] ??
							"Compare Reloop's open-source architecture, pricing, and features.";
						const glow = `#${brand.icon.hex}`;

						return (
							<Link
								key={brand.href}
								href={brand.href}
								aria-label={`Reloop vs ${brand.name}`}
								className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 gap-3.5 p-5 max-lg:p-4 max-xl:gap-3 transition-all duration-200 hover:border-stroke-soft-300 hover:bg-bg-weak-50 dark:border-white/10 dark:bg-black dark:hover:border-white/20 dark:hover:bg-white/[0.04]"
							>
								{/* Brand Logo Ambient Color Glow Shadow (ONLY ON HOVER) */}
								<div
									aria-hidden
									className="pointer-events-none absolute inset-x-6 bottom-2 h-12 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-65"
									style={{
										background: `radial-gradient(ellipse at center, color-mix(in srgb, ${glow} 55%, transparent) 0%, transparent 75%)`,
									}}
								/>

								{/* Top Row: Icon, Titles & Hover Arrow */}
								<div className="relative z-10 flex items-start justify-between gap-3.5">
									<div className="flex items-center gap-2.5 max-xl:gap-2 min-w-0 flex-1">
										<div className="relative size-10 shrink-0 overflow-hidden rounded-[30%] border border-stroke-soft-200/80 p-2 flex items-center justify-center dark:border-white/10">
											<BrandIcon icon={brand.icon} className="size-full object-contain" />
										</div>
										<div className="flex flex-col min-w-0 flex-1">
											<h4 className="font-semibold text-text-strong-950 max-xl:text-sm dark:text-white">
												{brand.name}
											</h4>
											<p className="shrink truncate text-text-sub-600 text-sm dark:text-white/50">
												Reloop vs {brand.name}
											</p>
										</div>
									</div>

									<Icon
										name="arrow-right"
										className="size-3.5 shrink-0 text-text-sub-600 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100 dark:text-white/60"
										aria-hidden="true"
									/>
								</div>

								{/* Description Section */}
								<div className="relative z-10 flex flex-col gap-1">
									<p className="text-sm text-pretty text-text-sub-600 pr-2 line-clamp-2 leading-relaxed dark:text-white/60">
										{description}
									</p>
								</div>
							</Link>
						);
					})}
				</div>
			</div>
		</section>
	);
}
