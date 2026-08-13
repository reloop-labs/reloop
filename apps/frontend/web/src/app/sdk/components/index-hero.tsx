"use client";

import * as Button from "@reloop/ui/button";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

const INDEX_AI_PROMPT = `Integrate Reloop email into this project.

I will set RELOOP_API_KEY in my .env (never commit the real key). Use this placeholder until I paste the real value:
RELOOP_API_KEY=rl_your_api_key_here

Do the following:
1. Detect this project's language and framework.
2. Install the correct Reloop SDK if one exists (Node/Python: reloop-email; Go: github.com/reloop-labs/reloop-go/v2; PHP: reloop/reloop-email), or call the REST API with Authorization: Bearer <key>.
3. Wire the key from env and send a test transactional email:
   - from: sender@example.com
   - to: recipient@example.com
   - subject: Hello from Reloop
   - text: Hello World!
4. Follow this repo's conventions and handle errors cleanly.

Useful docs:
- SDKs & frameworks: https://reloop.sh/sdk
- API keys: https://reloop.sh/docs/learn/api-keys
- Send email: https://reloop.sh/docs/api/mail/post-api-mail-v1send
- SMTP: https://reloop.sh/docs/examples/smtp/introduction

Show only the files/code I need to add or change.`;

/** Prompt/matrix mark used on SMTP + framework copy-prompt controls. */
function PromptIcon({ className }: { className?: string }) {
	return (
		<svg viewBox="0 0 16 16" className={className} aria-hidden>
			<path
				fill="currentColor"
				d="M6.75 14a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5m3.75 0a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5m3.75 0a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5m-7.5-3.25a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5m7.5 0a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5M8.25.5C9.22.5 10 1.28 10 2.25V3H8.5v-.75A.25.25 0 0 0 8.25 2h-5.5a.25.25 0 0 0-.25.25v7.5c0 .14.11.25.25.25H4.5v1.5H2.75C1.78 11.5 1 10.72 1 9.75v-7.5C1 1.28 1.78.5 2.75.5zm-1.5 7.25a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5m7.5 0a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5M6.75 4.5a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5m3.75 0a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5m3.75 0a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5"
			/>
		</svg>
	);
}

export default function IndexHero() {
	const [copied, setCopied] = useState(false);

	const handleCopyPrompt = async () => {
		try {
			await navigator.clipboard.writeText(INDEX_AI_PROMPT);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 2000);
		} catch {
			// ignore
		}
	};

	return (
		// Careers-style header: title + description (no SectionTitle icon)
		<section className="relative w-full max-w-full overflow-x-clip bg-bg-white-0 text-text-strong-950 dark:bg-black dark:text-white">
			<div className="mx-auto w-full max-w-5xl border-stroke-soft-200 xl:border-x px-6 pt-28 pb-14 text-left sm:px-10 sm:pt-32 sm:pb-16 md:max-w-7xl lg:px-12 dark:border-white/10">
				<h1 className="max-w-3xl font-semibold text-3xl text-text-strong-950 leading-[1.15] tracking-tight sm:text-4xl lg:text-[2.6rem] dark:text-white">
					Send email in your language.
				</h1>

				<p className="mt-4 max-w-2xl text-[15px] text-text-sub-600 leading-relaxed sm:text-[16px] dark:text-white/60">
					Framework guides for Next.js, Django, Laravel, and more—plus official
					SDKs for Node.js, Python, Go, Rust, PHP, Ruby, Elixir, Java, and .NET.
				</p>

				<div className="mt-8 flex flex-wrap items-center gap-3">
					<FancyButton.Root
						asChild
						variant="neutral"
						size="medium"
						className="rounded-full! px-6!"
					>
						<a href="/dashboard/signup">Get started</a>
					</FancyButton.Root>
					<button
						type="button"
						onClick={handleCopyPrompt}
						aria-label={copied ? "Copied" : "Copy prompt"}
						className={`${Button.buttonVariants({
							variant: "neutral",
							mode: "stroke",
						}).root()} inline-flex h-10! min-w-[9.5rem] cursor-pointer items-center justify-center gap-2! overflow-hidden rounded-full! px-6! font-medium text-sm! active:scale-[0.98]`}
					>
						{/* Same spring swap as the Login CTA */}
						<AnimatePresence mode="popLayout" initial={false}>
							<motion.span
								key={copied ? "copied" : "idle"}
								transition={{ type: "spring", duration: 0.25, bounce: 0 }}
								initial={{ opacity: 0, y: -14 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: 14 }}
								className="flex items-center justify-center gap-1.5"
							>
								{copied ? (
									<Icon name="check-circle" className="h-4 w-4 shrink-0" />
								) : (
									<PromptIcon className="size-4 shrink-0" />
								)}
								<span>{copied ? "Copied!" : "Copy prompt"}</span>
							</motion.span>
						</AnimatePresence>
					</button>
				</div>
			</div>
		</section>
	);
}
