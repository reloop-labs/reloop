"use client";

import * as Button from "@reloop/ui/button";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { hostedSignupHref } from "@reloop/web/lib/site";
import Link from "next/link";
import {
	HeroAtmosphere,
	HeroWindowChrome,
} from "../../(home)/components/hero-chrome";
import { HeroDashboardShell } from "../../(home)/components/hero-dashboard-shell";
import {
	HeroDemoPlaybackButton,
	HeroDemoPlaybackProvider,
} from "../../(home)/components/hero-demo-playback";
import { HeroEmailsPreview } from "../../(home)/components/hero-emails-preview";

const TransactionEmailsPage = () => {
	return (
		<div className="relative min-h-screen overflow-x-hidden bg-bg-white-0 font-sans text-text-strong-950 selection:bg-neutral-200 dark:bg-black dark:text-white">
			{/* Hero Header */}
			<header className="relative flex w-full flex-col items-center px-6 pt-28 pb-14 text-center sm:px-8 sm:pt-32 sm:pb-16 lg:px-12 lg:pt-36 lg:pb-20">
				<Link
					href="/compare/resend"
					className="group mb-6 inline-flex items-center gap-0 overflow-hidden rounded-full border border-stroke-soft-200 bg-bg-white-0 text-[13px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 hover:border-stroke-strong-950/20 sm:mb-8 sm:text-[13.5px] dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none dark:hover:border-white/25"
				>
					<span className="px-3.5 py-1.5 font-medium text-text-sub-600 dark:text-white/70">
						An open-source alternative to Resend
					</span>
					<span
						className="h-3.5 w-px bg-stroke-soft-200 dark:bg-white/10"
						aria-hidden="true"
					/>
					<span className="inline-flex items-center gap-1 px-3 py-1.5 font-medium text-text-strong-950 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
						<span>Read more</span>
						<Icon
							name="arrow-up-right"
							className="group-hover:-translate-y-0.5 size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
							aria-hidden="true"
						/>
					</span>
				</Link>
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
			<section className="relative w-full overflow-hidden px-3 pt-6 pb-14 sm:px-6 sm:pt-8 sm:pb-16 lg:px-8 lg:pb-20">
				<HeroAtmosphere />
				<div className="relative z-10 mx-auto flex h-[34rem] w-full max-w-5xl flex-col sm:h-[42rem] md:max-w-7xl lg:h-[48rem]">
					<HeroDemoPlaybackProvider started={true}>
						<HeroWindowChrome action={<HeroDemoPlaybackButton />}>
							<HeroDashboardShell activeItem="emails">
								<HeroEmailsPreview />
							</HeroDashboardShell>
						</HeroWindowChrome>
					</HeroDemoPlaybackProvider>
				</div>
			</section>

			{/* Specs Bento Grid */}
			<section className="border-stroke-soft-200 border-t bg-bg-white-0 py-20 sm:py-28 dark:border-white/10 dark:bg-black">
				<div className="mx-auto w-full max-w-5xl px-4 sm:px-6 md:max-w-7xl lg:px-8">
					<div className="mb-16 text-center sm:mb-20">
						<h2 className="font-semibold text-[2.6rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem] dark:text-white">
							SMTP Relay &amp; HTTP APIs
						</h2>
						<p className="mx-auto mt-4 max-w-xl text-[15px] text-text-sub-600 leading-relaxed sm:text-base dark:text-white/50">
							Connect using standard protocols. Run on a zero-latency, failover
							edge mesh network.
						</p>
					</div>

					<div className="grid gap-px overflow-hidden rounded-2xl border border-stroke-soft-200 bg-stroke-soft-200 sm:grid-cols-2 lg:grid-cols-3 dark:border-white/10 dark:bg-white/10">
						{/* Card 1: Multi-Protocol */}
						<div className="col-span-1 flex flex-col justify-between bg-bg-white-0 p-8 transition-colors hover:bg-bg-weak-50/50 lg:col-span-2 lg:p-10 dark:bg-black dark:hover:bg-white/[0.02]">
							<div>
								<div className="mb-6 inline-flex size-10 items-center justify-center rounded-xl border border-stroke-soft-200 bg-bg-weak-50 dark:border-white/10 dark:bg-white/5">
									<Icon
										name="arrow-swap"
										className="size-5 text-text-sub-600 dark:text-white/60"
									/>
								</div>
								<h3 className="mb-3 font-semibold text-[18px] text-text-strong-950 leading-snug sm:text-[20px] dark:text-white">
									SMTP Relay &amp; HTTP REST API
								</h3>
								<p className="max-w-md text-[14px] text-text-sub-600 leading-[1.7] dark:text-white/60">
									Connect via lightweight client SDKs or point your existing
									mailers straight to our relays. Zero configuration migration
									required.
								</p>
							</div>

							<div className="mt-12 grid grid-cols-2 gap-4">
								<div className="rounded-xl border border-stroke-soft-200 bg-bg-weak-50 p-4 dark:border-white/10 dark:bg-white/5">
									<div className="mb-1 font-mono text-text-sub-600 text-xs dark:text-white/40">
										SMTP HOST
									</div>
									<div className="font-mono font-semibold text-[13px] text-text-strong-950 dark:text-white">
										smtp.reloop.sh
									</div>
									<div className="mt-1 font-mono text-[11px] text-text-sub-600 dark:text-white/40">
										Ports: 587 (TLS), 465 (SSL)
									</div>
								</div>
								<div className="rounded-xl border border-stroke-soft-200 bg-bg-weak-50 p-4 dark:border-white/10 dark:bg-white/5">
									<div className="mb-1 font-mono text-text-sub-600 text-xs dark:text-white/40">
										HTTP ENDPOINT
									</div>
									<div className="font-mono font-semibold text-[13px] text-text-strong-950 dark:text-white">
										api.reloop.sh/v1
									</div>
									<div className="mt-1 font-mono text-[11px] text-text-sub-600 dark:text-white/40">
										HTTPS POST /send
									</div>
								</div>
							</div>
						</div>

						{/* Card 2: Latency & SLA */}
						<div className="flex flex-col justify-between bg-bg-white-0 p-8 transition-colors hover:bg-bg-weak-50/50 lg:p-10 dark:bg-black dark:hover:bg-white/[0.02]">
							<div>
								<div className="mb-6 inline-flex size-10 items-center justify-center rounded-xl border border-stroke-soft-200 bg-bg-weak-50 dark:border-white/10 dark:bg-white/5">
									<Icon
										name="graph-up"
										className="size-5 text-text-sub-600 dark:text-white/60"
									/>
								</div>
								<h3 className="mb-3 font-semibold text-[18px] text-text-strong-950 leading-snug sm:text-[20px] dark:text-white">
									99.99% Global Uptime
								</h3>
								<p className="text-[14px] text-text-sub-600 leading-[1.7] dark:text-white/60">
									Reloop routes requests through distributed edge nodes. Built
									for failover safety during cloud zone anomalies.
								</p>
							</div>
							<div className="mt-12 flex items-end justify-between">
								<div>
									<div className="font-bold text-3xl text-text-strong-950 tracking-tight dark:text-white">
										11.8ms
									</div>
									<div className="mt-1 text-[11px] text-text-sub-600 dark:text-white/40">
										Average US-East Delivery
									</div>
								</div>
								{/* Mini Sparkline */}
								<svg
									className="h-8 w-20 text-emerald-500"
									viewBox="0 0 100 30"
									fill="none"
								>
									<path
										d="M0 25 L15 24 L30 18 L45 20 L60 12 L75 14 L90 3 L100 5"
										stroke="currentColor"
										strokeWidth="2.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							</div>
						</div>

						{/* Card 3: SPF/DKIM */}
						<div className="flex flex-col justify-between bg-bg-white-0 p-8 transition-colors hover:bg-bg-weak-50/50 lg:p-10 dark:bg-black dark:hover:bg-white/[0.02]">
							<div>
								<div className="mb-6 inline-flex size-10 items-center justify-center rounded-xl border border-stroke-soft-200 bg-bg-weak-50 dark:border-white/10 dark:bg-white/5">
									<Icon
										name="lock"
										className="size-5 text-text-sub-600 dark:text-white/60"
									/>
								</div>
								<h3 className="mb-3 font-semibold text-[18px] text-text-strong-950 leading-snug sm:text-[20px] dark:text-white">
									Auto-SPF/DKIM Signing
								</h3>
								<p className="text-[14px] text-text-sub-600 leading-[1.7] dark:text-white/60">
									We analyze your domains dynamically and automatically apply
									SPF alignments, custom DKIM signing keys, and DMARC
									validations.
								</p>
							</div>
							<div className="mt-12 flex flex-wrap gap-2">
								<span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 font-semibold text-[11px] text-emerald-600 dark:text-emerald-400">
									DKIM Checked
								</span>
								<span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 font-semibold text-[11px] text-emerald-600 dark:text-emerald-400">
									SPF Alignment Pass
								</span>
							</div>
						</div>

						{/* Card 4: Suppression Sync Webhook */}
						<div className="col-span-1 flex flex-col justify-between bg-bg-white-0 p-8 transition-colors hover:bg-bg-weak-50/50 lg:col-span-2 lg:p-10 dark:bg-black dark:hover:bg-white/[0.02]">
							<div>
								<div className="mb-6 inline-flex size-10 items-center justify-center rounded-xl border border-stroke-soft-200 bg-bg-weak-50 dark:border-white/10 dark:bg-white/5">
									<Icon
										name="webhook"
										className="size-5 text-text-sub-600 dark:text-white/60"
									/>
								</div>
								<h3 className="mb-3 font-semibold text-[18px] text-text-strong-950 leading-snug sm:text-[20px] dark:text-white">
									Suppression List Webhooks
								</h3>
								<p className="max-w-md text-[14px] text-text-sub-600 leading-[1.7] dark:text-white/60">
									Instantly alerts your app webhooks if an address bounces or
									triggers a spam report, protecting your active mailing list
									quality.
								</p>
							</div>

							<div className="mt-12 space-y-1 rounded-xl bg-[#0a0a0a] p-4 font-mono text-[11px] shadow-inner">
								<div className="mb-2 flex justify-between border-white/5 border-b pb-2 text-white/30">
									<span>WEBHOOK DISPATCH</span>
									<span className="text-emerald-400">ACTIVE</span>
								</div>
								<div className="flex justify-between text-violet-400">
									<span>POST https://yoursite.com/webhooks/reloop</span>
									<span className="text-emerald-400">200 OK</span>
								</div>
								<div className="text-white/40">
									&#123; &quot;event&quot;: &quot;email.bounced&quot;,
									&quot;recipient&quot;: &quot;user@aol.com&quot;,
									&quot;code&quot;: 550 &#125;
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Quick Start Guide Section */}
			<section className="border-stroke-soft-200 border-t bg-bg-weak-50/60 py-20 sm:py-28 dark:border-white/10 dark:bg-white/[0.02]">
				<div className="mx-auto w-full max-w-5xl px-4 sm:px-6 md:max-w-7xl lg:px-8">
					<div className="mb-16 text-center sm:mb-20">
						<h2 className="font-semibold text-[2.6rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem] dark:text-white">
							Setup in 5 Minutes
						</h2>
						<p className="mx-auto mt-4 max-w-xl text-[15px] text-text-sub-600 leading-relaxed sm:text-base dark:text-white/50">
							No sales calls or enterprise agreements. Build and send
							immediately.
						</p>
					</div>

					<div className="grid gap-px overflow-hidden rounded-2xl border border-stroke-soft-200 bg-stroke-soft-200 md:grid-cols-3 dark:border-white/10 dark:bg-white/10">
						<div className="flex flex-col justify-between bg-bg-white-0 p-8 lg:p-10 dark:bg-black">
							<div>
								<div className="flex size-8 items-center justify-center rounded-lg bg-bg-strong-950 font-bold font-mono text-white text-xs dark:bg-white dark:text-black">
									1
								</div>
								<h3 className="mt-4 font-semibold text-lg text-text-strong-950 leading-snug dark:text-white">
									Generate Credentials
								</h3>
								<p className="mt-4 text-[14px] text-text-sub-600 leading-[1.7] dark:text-white/60">
									Create an account, verify domain TXT records, and generate
									private API keys in the dashboard interface.
								</p>
							</div>
						</div>

						<div className="flex flex-col justify-between bg-bg-white-0 p-8 lg:p-10 dark:bg-black">
							<div>
								<div className="flex size-8 items-center justify-center rounded-lg bg-bg-strong-950 font-bold font-mono text-white text-xs dark:bg-white dark:text-black">
									2
								</div>
								<h3 className="mt-4 font-semibold text-lg text-text-strong-950 leading-snug dark:text-white">
									Add Reloop SDK
								</h3>
								<p className="mt-4 text-[14px] text-text-sub-600 leading-[1.7] dark:text-white/60">
									Install our client library package into your local codebase
									dependencies:
									<code className="mt-4 block rounded border border-white/5 bg-[#0a0a0a] p-2 font-mono text-[11.5px] text-violet-300">
										npm install reloop-email
									</code>
								</p>
							</div>
						</div>

						<div className="flex flex-col justify-between bg-bg-white-0 p-8 lg:p-10 dark:bg-black">
							<div>
								<div className="flex size-8 items-center justify-center rounded-lg bg-bg-strong-950 font-bold font-mono text-white text-xs dark:bg-white dark:text-black">
									3
								</div>
								<h3 className="mt-4 font-semibold text-lg text-text-strong-950 leading-snug dark:text-white">
									Trigger Sends
								</h3>
								<p className="mt-4 text-[14px] text-text-sub-600 leading-[1.7] dark:text-white/60">
									Point calls to the endpoints using payload templates, and view
									live audit trails in the platform dashboard.
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Banner Section */}
			<section className="border-stroke-soft-200 border-t bg-bg-white-0 py-20 sm:py-28 dark:border-white/10 dark:bg-black">
				<div className="mx-auto max-w-[920px] px-4 text-center">
					<h2 className="font-semibold text-[2.6rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem] dark:text-white">
						3,000 emails for free
						<br />
						<span className="text-primary-base">per month.</span>
					</h2>
					<p className="mx-auto mt-8 max-w-[550px] font-medium text-[15px] text-text-sub-600 leading-7 sm:text-[17px] dark:text-white/60">
						No credit card required. Connect your endpoints, optimize
						deliverability, and trigger emails at low-latency scale.
					</p>

					<div className="mt-10 flex flex-wrap items-center justify-center gap-4">
						<a
							href="/dashboard/signup"
							className={`${Button.buttonVariants({
								variant: "neutral",
								mode: "filled",
							}).root()} h-12! rounded-full! px-8! font-semibold text-[15px]`}
						>
							Get started
						</a>
						<Link
							href="/pricing"
							className={`${Button.buttonVariants({
								variant: "neutral",
								mode: "stroke",
							}).root()} h-12! rounded-full! px-8! font-semibold text-[15px]`}
						>
							See pricing
						</Link>
					</div>
				</div>
			</section>
		</div>
	);
};

export default TransactionEmailsPage;
