"use client";

import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { PixelBlast } from "@reloop/web/components/pixel-blast";
import { hostedSignupHref } from "@reloop/web/lib/site";
import { useTheme } from "next-themes";

export function MarketingHero() {
	const { resolvedTheme } = useTheme();

	return (
		<header className="relative flex w-full flex-col items-center overflow-hidden bg-transparent px-6 pt-[224px] pb-40 text-center [--primary-base:#ea580c] [--primary-dark:#c2410c] [--primary-darker:#9a3412] [--primary-link:#c2410c] sm:px-8 lg:px-12 dark:[--primary-base:#fdba74] dark:[--primary-dark:#fdba74] dark:[--primary-darker:#fed7aa] dark:[--primary-link:#fdba74]">
			<div
				aria-hidden="true"
				className="absolute inset-0 [-webkit-mask-image:linear-gradient(to_right,black_0%,black_28%,transparent_42%,transparent_58%,black_72%,black_100%)] [mask-image:linear-gradient(to_right,black_0%,black_28%,transparent_42%,transparent_58%,black_72%,black_100%)]"
			>
				<PixelBlast
					variant="square"
					pixelSize={2}
					color={resolvedTheme === "dark" ? "#fdba74" : "#ea580c"}
					patternScale={4}
					patternDensity={0.45}
					enableRipples={false}
					rippleSpeed={0.05}
					rippleThickness={0.09}
					rippleIntensityScale={2.5}
					speed={0.2}
					transparent
					edgeFade={0.65}
				/>
			</div>
			<div className="relative z-10 flex w-auto max-w-full flex-col items-center px-8 py-6">
				<div className="mb-5 flex items-center justify-center gap-2 sm:mb-6">
					<span
						aria-hidden
						className="inline-flex size-5 shrink-0 items-center justify-center rounded-[5px] bg-primary-dark p-px pb-[2px] dark:bg-[#7c2d12]"
					>
						<span className="flex size-full items-center justify-center rounded-[4px] bg-primary-base text-white shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.45)] dark:text-black dark:shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.28),0_0_0_0.5px_rgba(255,255,255,0.08)]">
							<Icon name="mega-phone" className="size-[11px]" />
						</span>
					</span>
					<span className="font-medium text-[13.5px] text-text-strong-950 tracking-tight dark:text-white">
						Marketing Email
					</span>
				</div>

				<h1 className="max-w-3xl text-balance text-center font-semibold text-[2.5rem] text-text-strong-950 leading-[1.06] tracking-[-0.04em] sm:text-[3.5rem] lg:text-[4.25rem] dark:text-white">
					Launch campaigns{" "}
					<span className="bg-gradient-to-b from-primary-base to-primary-base bg-clip-text text-transparent">
						that land.
					</span>
				</h1>

				<p className="mt-5 max-w-[46rem] text-balance text-center text-[16.5px] text-text-sub-600 leading-relaxed sm:mt-6 sm:text-[18.5px] lg:text-[20px] dark:text-white/60">
					Newsletters, product launches, and automated drips with broadcasts,
					segments, and built-in analytics.
				</p>

				<div className="mt-8 flex flex-wrap items-center justify-center gap-3.5 sm:mt-9 sm:gap-4">
					<FancyButton.Root
						asChild
						variant="primary"
						size="medium"
						className="h-11 rounded-xl px-6 font-medium text-[15.5px]"
					>
						<a href={hostedSignupHref}>Start for free</a>
					</FancyButton.Root>
					<FancyButton.Root
						asChild
						variant="basic"
						size="medium"
						className="h-11 rounded-xl px-6 font-medium text-[15.5px]"
					>
						<a
							href="https://cal.com/pranavp/30"
							target="_blank"
							rel="noreferrer"
						>
							<Icon name="calendar" className="size-4 shrink-0" />
							<span>Schedule call</span>
						</a>
					</FancyButton.Root>
				</div>
				<p className="mt-4 text-center text-[13px] text-text-sub-600 sm:text-[13.5px] dark:text-white/50">
					Free plan: 3,000 emails a month. No credit card.
				</p>
			</div>
		</header>
	);
}
