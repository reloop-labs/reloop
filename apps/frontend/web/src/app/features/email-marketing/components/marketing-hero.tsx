"use client";

import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { PixelBlast } from "@reloop/web/components/pixel-blast";
import { hostedSignupHref } from "@reloop/web/lib/site";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useState } from "react";

const MARKETING_AI_PROMPT = `Integrate Reloop marketing email into this project.

I will set RELOOP_API_KEY in my .env (never commit the real key). Use this placeholder until I paste the real value:
RELOOP_API_KEY=rl_your_api_key_here

Do the following:
1. Detect this project's framework and language.
2. Install the official Reloop SDK (Node/Python: reloop-email; Go: github.com/reloop-labs/reloop-go/v2; PHP: reloop/reloop-email; Java: sh.reloop:reloop-email; .NET: Reloop.Email; Ruby: reloop-email; Elixir: reloop), or call the REST API.
3. Create a broadcast campaign:
   - from: newsletter@example.com
   - subject: Our October newsletter
   - html: <h1>October update</h1><p>Here's what shipped.</p>
   - segment: engaged contacts from the last 30 days
4. Schedule a drip follow-up and track opens/clicks.
5. Follow this repo's conventions and handle errors cleanly.

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

export function MarketingHero() {
	const [copied, setCopied] = useState(false);
	const { resolvedTheme } = useTheme();

	const handleCopyPrompt = async () => {
		try {
			await navigator.clipboard.writeText(MARKETING_AI_PROMPT);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 2000);
		} catch {
			// ignore
		}
	};

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
							<Icon name="send-2" className="size-[11px]" />
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
			</div>
		</header>
	);
}
