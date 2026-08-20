"use client";

import * as FancyButton from "@reloop/ui/fancy-button";
import { hostedSignupHref } from "@reloop/web/lib/site";
import { SceneGlyph } from "../../../(home)/components/_shared/scene-header";
import { HeroWindowChrome } from "../../../(home)/components/hero-chrome";
import { HeroDashboardShell } from "../../../(home)/components/hero-dashboard-shell";
import {
	HeroDemoPlaybackButton,
	HeroDemoPlaybackProvider,
} from "../../../(home)/components/hero-demo-playback";
import { HeroEmailsPreview } from "../../../(home)/components/hero-emails-preview";
import { TransactionalEmailsAtmosphere } from "./transactional-atmosphere";

export function TransactionalHero() {
	return (
		<div className="relative w-full overflow-hidden">
			<TransactionalEmailsAtmosphere />

			{/* Hero Header */}
			<header className="relative z-10 flex w-full flex-col items-center px-6 pt-28 pb-14 text-center sm:px-8 sm:pt-32 sm:pb-16 lg:px-12 lg:pt-36 lg:pb-20">
				<div className="mb-6 flex items-center justify-center gap-2 sm:mb-8">
					<SceneGlyph icon="send-2" color="orange" />
					<span className="font-medium text-[13.5px] text-text-strong-950 tracking-tight dark:text-white">
						Transactional Email
					</span>
				</div>
				<h1 className="max-w-3xl text-balance text-center font-semibold text-[2.5rem] text-text-strong-950 leading-[1.06] tracking-[-0.04em] sm:text-[3.5rem] lg:text-[4.25rem] dark:text-white">
					Send Transactional Email in 5 Minutes
				</h1>
				<p className="mt-5 max-w-[46rem] text-balance text-center text-[16.5px] text-text-sub-600 leading-relaxed sm:mt-6 sm:text-[18.5px] lg:text-[20px] dark:text-white/60">
					Start sending transactional emails with a robust REST API, native
					SDKs, and reliable SMTP service.
				</p>
				<div className="mt-8 flex flex-wrap items-center justify-center gap-3.5 sm:mt-9 sm:gap-4">
					<FancyButton.Root
						asChild
						variant="neutral"
						size="medium"
						className="h-11 rounded-xl px-6 font-medium text-[15.5px]"
					>
						<a href={hostedSignupHref}>Get Started</a>
					</FancyButton.Root>
					<FancyButton.Root
						asChild
						variant="basic"
						size="medium"
						className="h-11 rounded-xl px-6 font-medium text-[15.5px]"
					>
						<a href="/docs">Documentation</a>
					</FancyButton.Root>
				</div>
			</header>

			{/* Overview Window Demo */}
			<section className="relative z-10 w-full px-3 pt-6 pb-14 sm:px-6 sm:pt-8 sm:pb-16 lg:px-8 lg:pb-20">
				<div className="mx-auto flex h-[34rem] w-full max-w-5xl flex-col sm:h-[42rem] md:max-w-7xl lg:h-[48rem]">
					<HeroDemoPlaybackProvider started={true}>
						<HeroWindowChrome action={<HeroDemoPlaybackButton />}>
							<HeroDashboardShell activeItem="emails">
								<HeroEmailsPreview />
							</HeroDashboardShell>
						</HeroWindowChrome>
					</HeroDemoPlaybackProvider>
				</div>
			</section>
		</div>
	);
}
