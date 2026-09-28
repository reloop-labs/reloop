"use client";

import { CopyCodeBlock } from "@reloop/ui/copy-code-block";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { hostedSignupHref } from "@reloop/web/lib/site";
import Link from "next/link";

const INSTALL_COMMAND = "curl -fsSL https://reloop.sh/install.sh | bash";

export interface HeroProps {
	variant?: "default" | "self-host";
}

export function Hero({ variant = "default" }: HeroProps) {
	return (
		<section id="features" className="relative flex flex-col bg-transparent">
			{variant === "self-host" ? (
				<div className="relative mx-auto flex w-full max-w-5xl flex-col items-start border-stroke-soft-100 border-x px-6 pt-36 pb-20 text-left sm:px-8 sm:pt-44 sm:pb-24 md:max-w-7xl lg:px-12 lg:pt-52 lg:pb-28 dark:border-white/10">
					<h1 className="max-w-[38rem] text-balance text-left font-medium text-3xl text-text-strong-950 leading-[1.1] tracking-tight sm:text-3xl md:text-4xl lg:text-5xl dark:text-white">
						Self-Host Reloop on your own server
					</h1>
					<p className="mt-6 max-w-2xl text-pretty text-left text-lg text-text-sub-600 leading-normal md:text-xl dark:text-white/60">
						Deploy full-featured email infrastructure on your own servers. Same
						API and DX as Cloud, with 100% data sovereignty.
					</p>

					<div className="mt-8 w-full max-w-2xl text-left sm:mt-9">
						<CopyCodeBlock code={INSTALL_COMMAND} lang="bash" hideLineNumbers />
					</div>
					<div className="mt-6 flex flex-wrap items-center justify-start gap-x-6 gap-y-2 pl-1 text-[13.5px] text-text-sub-600 dark:text-white/50">
						<Link
							href={hostedSignupHref}
							className="inline-flex items-center gap-2 transition-colors hover:text-text-strong-950 dark:hover:text-white"
						>
							<Icon
								name="mail-exchange"
								className="size-4 shrink-0"
								aria-hidden="true"
							/>
							<span>Try Reloop Cloud 3,000 emails for free</span>
						</Link>
						<Link
							href="/docs/self-host"
							className="inline-flex items-center gap-2 transition-colors hover:text-text-strong-950 dark:hover:text-white"
						>
							<Icon
								name="book-open"
								className="size-4 shrink-0"
								aria-hidden="true"
							/>
							<span>View deployment docs</span>
						</Link>
					</div>
				</div>
			) : (
				<div className="relative mx-auto flex w-full max-w-5xl flex-col items-start border-stroke-soft-100 border-x px-6 pt-36 pb-20 text-left sm:px-8 sm:pt-44 sm:pb-24 md:max-w-7xl lg:px-12 lg:pt-52 lg:pb-28 dark:border-white/10">
					<h1 className="max-w-[38rem] text-balance text-left font-medium text-3xl text-text-strong-950 leading-[1.1] tracking-tight sm:text-3xl md:text-4xl lg:text-5xl dark:text-white">
						Email Infrastructure for Developers
					</h1>
					<p className="mt-6 max-w-2xl text-pretty text-left text-lg text-text-sub-600 leading-normal md:text-xl dark:text-white/60">
						SES like infrastructure with the DX you already love. Agent inboxes,
						marketing campaigns, drip automations, built in.
					</p>
					<div className="mt-8 flex flex-wrap items-center justify-start gap-3.5 sm:mt-9 sm:gap-4">
						<FancyButton.Root
							asChild
							variant="primary"
							size="medium"
							className="h-11 rounded-xl px-6 font-medium text-[15.5px] dark:bg-white dark:text-black dark:hover:bg-white/90 dark:[--primary-base:#ffffff]"
						>
							<a href={hostedSignupHref}>Get Started</a>
						</FancyButton.Root>
						<FancyButton.Root
							asChild
							variant="basic"
							size="medium"
							className="h-11 rounded-xl px-6 font-medium text-[15.5px]"
						>
							<Link href="/self-host">Self-host Reloop</Link>
						</FancyButton.Root>
					</div>
					<div className="mt-6 flex flex-wrap items-center justify-start gap-x-6 gap-y-2 pl-1 text-[13.5px] text-text-sub-600 dark:text-white/50">
						<Link
							href="/pricing"
							className="inline-flex items-center gap-2 transition-colors hover:text-text-strong-950 dark:hover:text-white"
						>
							<Icon
								name="mail-exchange"
								className="size-4 shrink-0"
								aria-hidden="true"
							/>
							<span>3,000 emails for free</span>
						</Link>
						<Link
							href="/dpa"
							className="inline-flex items-center gap-2 transition-colors hover:text-text-strong-950 dark:hover:text-white"
						>
							<Icon
								name="shield"
								className="size-4 shrink-0"
								aria-hidden="true"
							/>
							<span>GDPR supported</span>
						</Link>
					</div>
				</div>
			)}
		</section>
	);
}

export default Hero;
