import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { hostedSignupHref } from "@reloop/web/lib/site";
import Link from "next/link";
import {
	HeroAtmosphere,
	HeroWindowChrome,
} from "../../(home)/components/hero-chrome";
import { HeroDashboardShell } from "../../(home)/components/hero-dashboard-shell";
import { HeroDomainPreview } from "../../(home)/components/hero-domain-preview";

export default function DomainHero() {
	return (
		<section className="relative flex min-h-dvh flex-col overflow-x-hidden bg-transparent pt-40 sm:pt-48 lg:pt-56">
			<div className="px-6 sm:px-8 lg:px-12">
				<h1 className="max-w-[14em] font-medium text-[2.5rem] text-text-strong-950 leading-[1.02] tracking-[-0.045em] sm:text-[3.5rem] lg:text-[4.25rem] dark:text-white">
					Authenticate your domain
					<br />
					with SPF, DKIM, and DMARC
				</h1>
				<p className="mt-5 max-w-[52rem] text-[15px] text-text-sub-600 leading-relaxed sm:mt-6 sm:text-[17px] dark:text-white/55">
					Add a sending domain and verify SPF, DKIM, and DMARC so every email
					authenticates and lands in the inbox.
				</p>
				<div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-7">
					<FancyButton.Root asChild variant="neutral" size="small">
						<a href={hostedSignupHref}>Start Building</a>
					</FancyButton.Root>
					<FancyButton.Root asChild variant="basic" size="small">
						<a href="/docs/learn/domain">Documentation</a>
					</FancyButton.Root>
				</div>
			</div>

			<div className="mt-8 flex min-h-0 flex-1 flex-col border-stroke-soft-200 border-t sm:mt-10 dark:border-white/10">
				<div className="relative flex flex-1 flex-col overflow-hidden bg-bg-white-0 px-3 pt-10 pb-10 sm:px-6 sm:pt-14 sm:pb-14 lg:px-8 lg:pt-20 lg:pb-16 dark:bg-black">
					<HeroAtmosphere />
					<div className="relative z-10 mx-auto flex h-[32rem] w-full max-w-5xl flex-col sm:h-[38rem] lg:h-[44rem]">
						<HeroWindowChrome>
							<HeroDashboardShell activeItem="domain">
								<HeroDomainPreview />
							</HeroDashboardShell>
							<div className="pointer-events-none absolute inset-x-3 bottom-3 z-10 sm:inset-x-5 sm:bottom-5">
								<div className="pointer-events-auto flex items-center gap-3 rounded-2xl bg-[#171717] px-3 py-2.5 text-white shadow-[0_8px_28px_rgba(0,0,0,0.18)] sm:gap-4 sm:rounded-[1.35rem] sm:px-4 sm:py-3 dark:bg-[#111]">
									<span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10 sm:size-11">
										<Icon name="globe" className="size-5 text-white" />
									</span>
									<div className="min-w-0 flex-1">
										<p className="truncate font-semibold text-[14px] leading-tight tracking-tight sm:text-[15px]">
											Domains
										</p>
										<p className="mt-0.5 truncate text-[12px] text-white/55 leading-snug sm:text-[13px]">
											Set up SPF, DKIM, and DMARC so every send authenticates.
										</p>
									</div>
									<Link
										href="/docs/learn/domain"
										className="inline-flex h-9 shrink-0 items-center rounded-full bg-white px-3.5 font-medium text-[#171717] text-[13px] transition-opacity hover:opacity-90 sm:h-10 sm:px-4"
									>
										Learn more
									</Link>
								</div>
							</div>
						</HeroWindowChrome>
					</div>
				</div>
			</div>
		</section>
	);
}
