"use client";

import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { hostedSignupHref } from "@reloop/web/lib/site";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { SceneGlyph } from "../../../(home)/components/_shared/scene-header";
import { HeroWindowChrome } from "../../../(home)/components/hero-chrome";
import { HeroDashboardShell } from "../../../(home)/components/hero-dashboard-shell";
import {
	HeroDemoPlaybackButton,
	HeroDemoPlaybackProvider,
} from "../../../(home)/components/hero-demo-playback";
import { HeroEmailsPreview } from "../../../(home)/components/hero-emails-preview";
import { TransactionalEmailsAtmosphere } from "./transactional-atmosphere";

const TRANSACTIONAL_AI_PROMPT = `Integrate Reloop transactional email into this project.

I will set RELOOP_API_KEY in my .env (never commit the real key). Use this placeholder until I paste the real value:
RELOOP_API_KEY=rl_your_api_key_here

Do the following:
1. Detect this project's framework and language.
2. Install the official Reloop SDK (Node/Python: reloop-email; Go: github.com/reloop-labs/reloop-go/v2; PHP: reloop/reloop-email; Java: sh.reloop:reloop-email; .NET: Reloop.Email; Ruby: reloop-email; Elixir: reloop), or call the REST API.
3. Wire the key from env and send a test transactional email:
   - from: sender@example.com
   - to: recipient@example.com
   - subject: Welcome to our app
   - html: <h1>Welcome!</h1><p>Thanks for signing up.</p>
4. Follow this repo's conventions and handle errors cleanly.

Useful docs:
- API Reference: https://reloop.sh/docs/api/mail/post-api-mail-v1send
- SDKs & Guides: https://reloop.sh/sdk
- API Keys: https://reloop.sh/docs/learn/api-keys

Show only the files/code I need to add or change.`;

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

export function TransactionalHero() {
	const [copied, setCopied] = useState(false);

	const handleCopyPrompt = async () => {
		try {
			await navigator.clipboard.writeText(TRANSACTIONAL_AI_PROMPT);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 2000);
		} catch {
			// ignore
		}
	};

	return (
		<div className="relative w-full overflow-hidden">
			{/* Hero Header */}
			<header className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-6 pt-28 pb-14 text-center sm:px-8 sm:pt-32 sm:pb-16 md:max-w-7xl lg:px-12 lg:pt-36 lg:pb-20">
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
						variant="primary"
						size="medium"
						className="h-11 rounded-xl px-6 font-medium text-[15.5px]"
					>
						<a href={hostedSignupHref}>Start for free</a>
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
							{/* Invisible phantom spacer permanently locks width to prevent layout shift */}
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
					Free plan: 3,000 emails a month. No credit card.
				</p>
			</header>

			{/* Overview Window Demo */}
			<section className="relative z-10 w-full px-3 pt-6 sm:px-6 sm:pt-8 sm:pb-16 lg:px-8 lg:pb-20">
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
