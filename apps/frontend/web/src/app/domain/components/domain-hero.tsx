import * as FancyButton from "@reloop/ui/fancy-button";
import { hostedSignupHref } from "@reloop/web/lib/site";
import {
	HeroAtmosphere,
	HeroWindowChrome,
} from "../../(home)/components/hero-chrome";
import { HeroDashboardShell } from "../../(home)/components/hero-dashboard-shell";
import { HeroDomainPreview } from "../../(home)/components/hero-domain-preview";
import { DomainScrollWindow } from "./domain-scroll-window";

export default function DomainHero() {
	return (
		<section className="relative flex min-h-dvh flex-col bg-transparent pt-40 sm:pt-48 lg:pt-56">
			<div className="relative mx-auto w-full max-w-5xl px-6 text-center sm:px-8 md:max-w-7xl lg:px-12">
				<h1 className="mx-auto max-w-[16em] font-medium text-[2.5rem] text-text-strong-950 leading-[1.02] tracking-[-0.045em] sm:text-[3.5rem] lg:text-[4.25rem] dark:text-white">
					Authenticate your domain
					<br />
					with SPF, DKIM, and DMARC
				</h1>
				<p className="mx-auto mt-5 max-w-[40rem] text-[15px] text-text-sub-600 leading-relaxed sm:mt-6 sm:text-[17px] dark:text-white/55">
					Add a sending domain and verify SPF, DKIM, and DMARC so every email
					authenticates and lands in the inbox.
				</p>
				<div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:mt-7">
					<FancyButton.Root asChild variant="neutral" size="small">
						<a href={hostedSignupHref}>Start Building</a>
					</FancyButton.Root>
					<FancyButton.Root asChild variant="basic" size="small">
						<a href="/docs/learn/domain">Documentation</a>
					</FancyButton.Root>
				</div>
			</div>

			<div className="relative mt-8 w-full flex-1 overflow-x-clip bg-bg-white-0 sm:mt-10 dark:bg-black">
				<HeroAtmosphere />
				<DomainScrollWindow>
					<HeroWindowChrome>
						<HeroDashboardShell activeItem="domain">
							<HeroDomainPreview />
						</HeroDashboardShell>
					</HeroWindowChrome>
				</DomainScrollWindow>
			</div>
		</section>
	);
}
