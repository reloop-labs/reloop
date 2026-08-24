"use client";

import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { hostedSignupHref } from "@reloop/web/lib/site";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";
import { SceneGlyph } from "../../../(home)/components/_shared/scene-header";
import { HeroAnalyticsPreview } from "../../../(home)/components/hero-analytics-preview";
import { HeroWindowChrome } from "../../../(home)/components/hero-chrome";
import { HeroDashboardShell } from "../../../(home)/components/hero-dashboard-shell";

const ANALYTICS_AI_PROMPT = `Track email delivery, engagement, and bounce events with Reloop.

1. Install the SDK: npm install reloop-email
2. Query real-time email metrics and webhook events:
   - Deliverability rate, open rates, and click tracking
   - Root-cause bounce diagnostic codes
   - Webhook streaming for event ingestion

API Docs: https://reloop.sh/docs/analytics`;

function PromptIcon({ className }: { className?: string }) {
	return (
		<svg viewBox="0 0 16 16" className={className} fill="none" aria-hidden>
			<path
				fill="currentColor"
				d="M6.75 14a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5m3.75 0a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5m3.75 0a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5m-7.5-3.25a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5m7.5 0a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5M8.25.5C9.22.5 10 1.28 10 2.25V3H8.5v-.75A.25.25 0 0 0 8.25 2h-5.5a.25.25 0 0 0-.25.25v7.5c0 .14.11.25.25.25H4.5v1.5H2.75C1.78 11.5 1 10.72 1 9.75v-7.5C1 1.28 1.78.5 2.75.5zm-1.5 7.25a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5m7.5 0a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5M6.75 4.5a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5m3.75 0a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5m3.75 0a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5"
			/>
		</svg>
	);
}

export default function Hero() {
	const [copied, setCopied] = useState(false);

	const handleCopyPrompt = async () => {
		try {
			await navigator.clipboard.writeText(ANALYTICS_AI_PROMPT);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 2000);
		} catch {
			// ignore
		}
	};

	return (
		<div className="relative w-full overflow-hidden bg-transparent">
			{/* Hero Header */}
			<header className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-6 pt-28 pb-14 text-center sm:px-8 sm:pt-32 sm:pb-16 md:max-w-7xl lg:px-12 lg:pt-36 lg:pb-20">
				<div className="mb-6 flex items-center justify-center gap-2 sm:mb-8">
					<SceneGlyph icon="fat-row" color="blue" />
					<span className="font-medium text-[13.5px] text-text-strong-950 tracking-tight dark:text-white">
						Email Analytics & Intelligence
					</span>
				</div>
				<h1 className="max-w-3xl text-balance text-center font-semibold text-[2.5rem] text-text-strong-950 leading-[1.06] tracking-[-0.04em] sm:text-[3.5rem] lg:text-[4.25rem] dark:text-white">
					See Exactly What Happens to Every Email
				</h1>
				<p className="mt-5 max-w-[46rem] text-balance text-center text-[16.5px] text-text-sub-600 leading-relaxed sm:mt-6 sm:text-[18.5px] lg:text-[20px] dark:text-white/60">
					Real-time delivery observability, engagement tracking, bounce
					diagnostics, and domain reputation metrics—from the moment you hit
					send.
				</p>
				<div className="mt-8 flex flex-wrap items-center justify-center gap-3.5 sm:mt-9 sm:gap-4">
					<FancyButton.Root
						asChild
						variant="primary"
						size="medium"
						className="h-11 rounded-xl px-6 font-medium text-[15.5px]"
					>
						<a href={hostedSignupHref}>Start Tracking Free</a>
					</FancyButton.Root>
					<FancyButton.Root
						type="button"
						variant="basic"
						size="medium"
						onClick={handleCopyPrompt}
						className="h-11 rounded-xl px-6 font-medium text-[15.5px]"
						aria-label={copied ? "Copied" : "Copy agent prompt"}
					>
						<span className="relative inline-flex items-center justify-center">
							<span
								aria-hidden="true"
								className="pointer-events-none invisible flex items-center justify-center gap-2"
							>
								<PromptIcon className="size-4 shrink-0" />
								<span>Copy agent prompt</span>
							</span>

							<AnimatePresence mode="wait" initial={false}>
								<motion.span
									key={copied ? "copied" : "idle"}
									transition={{ type: "spring", duration: 0.22, bounce: 0 }}
									initial={{ opacity: 0, y: -8 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: 8 }}
									className="absolute inset-0 flex items-center justify-center gap-2 whitespace-nowrap"
								>
									{copied ? (
										<Icon
											name="check-circle"
											className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400"
										/>
									) : (
										<PromptIcon className="size-4 shrink-0" />
									)}
									<span>{copied ? "Copied!" : "Copy agent prompt"}</span>
								</motion.span>
							</AnimatePresence>
						</span>
					</FancyButton.Root>
				</div>
				<p className="mt-4 text-center text-[13px] text-text-sub-600 sm:text-[13.5px] dark:text-white/50">
					Free tier: 3,000 tracked emails/month. Instant setup, zero lock-in.
				</p>
			</header>

			{/* Interactive Dashboard Window Demo */}
			<section className="relative z-10 w-full px-3 pt-6 sm:px-6 sm:pt-8 sm:pb-16 lg:px-8 lg:pb-20">
				<div className="mx-auto flex h-[34rem] w-full max-w-5xl flex-col sm:h-[42rem] md:max-w-7xl lg:h-[48rem]">
					<HeroWindowChrome>
						<HeroDashboardShell activeItem="analytics">
							<HeroAnalyticsPreview />
						</HeroDashboardShell>
					</HeroWindowChrome>
				</div>
			</section>
		</div>
	);
}
