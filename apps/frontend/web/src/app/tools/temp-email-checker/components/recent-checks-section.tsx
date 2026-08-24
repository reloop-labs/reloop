"use client";

import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { hostedSignupHref } from "@reloop/web/lib/site";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
	type TestedEmailRecord,
	useTestedEmails,
} from "../tested-emails-store";

function formatRelativeTime(timestamp: number): string {
	const seconds = Math.floor((Date.now() - timestamp) / 1000);
	if (seconds < 60) return "Just now";
	const minutes = Math.floor(seconds / 60);
	if (minutes < 60) return `${minutes}m ago`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours}h ago`;
	const days = Math.floor(hours / 24);
	return `${days}d ago`;
}

function getVerdictConfig(verdict: TestedEmailRecord["verdict"]) {
	switch (verdict) {
		case "disposable":
			return {
				label: "Disposable",
				dotColor: "bg-rose-500",
				badgeStyles:
					"border-rose-500/20 bg-rose-500/[0.08] text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-400",
			};
		case "deliverable":
			return {
				label: "Deliverable",
				dotColor: "bg-emerald-500",
				badgeStyles:
					"border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400",
			};
		case "risky":
			return {
				label: "Shared Role",
				dotColor: "bg-amber-500",
				badgeStyles:
					"border-amber-500/20 bg-amber-500/[0.08] text-amber-600 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-400",
			};
		default:
			return {
				label: "Invalid",
				dotColor: "bg-neutral-400",
				badgeStyles:
					"border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 dark:border-white/10 dark:bg-[#0b0b0b] dark:text-white/70",
			};
	}
}

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

export function RecentChecksSection() {
	const { list } = useTestedEmails();
	const [mounted, setMounted] = useState(false);
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

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) return null;

	const displayedList = list.slice(0, 10);

	if (displayedList.length === 0) return null;

	return (
		<section
			id="recent-checks-section"
			className="relative z-10 w-full border-stroke-soft-200 border-t bg-bg-white-0 dark:border-white/10 dark:bg-black"
		>
			<div className="grid grid-cols-1 divide-y divide-stroke-soft-200 lg:grid-cols-2 lg:divide-x lg:divide-y-0 dark:divide-white/10">
				{/* Left Column: Email API CTA */}
				<div className="flex flex-col items-start justify-center px-6 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-14 xl:px-14">
					<h2 className="font-semibold text-2xl text-text-strong-950 leading-[1.18] tracking-tight sm:text-3xl dark:text-white">
						Send emails that reliably reach the inbox.
					</h2>

					<p className="mt-3.5 text-[14.5px] text-text-sub-600 leading-relaxed dark:text-white/60">
						Deliver welcome emails, password resets, and notifications with
						sub-second speed. High deliverability, modern REST API, and SDKs for
						every stack.
					</p>

					<div className="mt-5 space-y-2.5">
						<div className="flex items-center gap-2.5 text-[13px] text-text-strong-950 dark:text-white/80">
							<Icon
								name="check-circle"
								className="size-4 shrink-0 text-emerald-500"
							/>
							<span>Sub-second delivery via REST API & SMTP</span>
						</div>
						<div className="flex items-center gap-2.5 text-[13px] text-text-strong-950 dark:text-white/80">
							<Icon
								name="check-circle"
								className="size-4 shrink-0 text-emerald-500"
							/>
							<span>Official SDKs for Node.js, Python, Go, and more</span>
						</div>
						<div className="flex items-center gap-2.5 text-[13px] text-text-strong-950 dark:text-white/80">
							<Icon
								name="check-circle"
								className="size-4 shrink-0 text-emerald-500"
							/>
							<span>Free plan: 3,000 emails / month included</span>
						</div>
					</div>

					<div className="mt-7 flex flex-wrap items-center gap-3">
						<FancyButton.Root
							asChild
							variant="primary"
							size="small"
							className="h-9.5 rounded-lg px-4.5 font-medium text-xs sm:text-[13px]"
						>
							<a
								href={hostedSignupHref}
								className="inline-flex items-center gap-1.5"
							>
								<span>Start for free</span>
								<FancyButton.Icon
									as={Icon}
									name="arrow-right"
									className="size-3.5"
								/>
							</a>
						</FancyButton.Root>

						<FancyButton.Root
							type="button"
							variant="basic"
							size="small"
							onClick={handleCopyPrompt}
							className="h-9.5 rounded-lg px-4 font-medium text-xs sm:text-[13px]"
							aria-label={copied ? "Copied" : "Copy agent prompt"}
						>
							<span className="relative inline-flex items-center justify-center">
								<span
									aria-hidden="true"
									className="pointer-events-none invisible flex items-center justify-center gap-1.5"
								>
									<PromptIcon className="size-3.5 shrink-0" />
									<span>Copy agent prompt</span>
								</span>

								<AnimatePresence mode="wait" initial={false}>
									<motion.span
										key={copied ? "copied" : "idle"}
										transition={{ type: "spring", duration: 0.22, bounce: 0 }}
										initial={{ opacity: 0, y: -6 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: 6 }}
										className="absolute inset-0 flex items-center justify-center gap-1.5 whitespace-nowrap"
									>
										{copied ? (
											<Icon
												name="check-circle"
												className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400"
											/>
										) : (
											<PromptIcon className="size-3.5 shrink-0" />
										)}
										<span>{copied ? "Copied!" : "Copy agent prompt"}</span>
									</motion.span>
								</AnimatePresence>
							</span>
						</FancyButton.Root>
					</div>
				</div>

				{/* Right Column: Recent Checks Card */}
				<div className="flex flex-col justify-center px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-14 xl:px-14">
					<div className="overflow-hidden rounded-[18px] border border-stroke-soft-200 bg-bg-weak-50 p-0.5 dark:border-white/10 dark:bg-white/[0.03]">
						<div className="px-3 pt-2 pb-2.5 sm:px-4 sm:pt-2.5">
							<p className="font-mono font-semibold text-[11px] text-text-strong-950 uppercase tracking-wider dark:text-white">
								Recent Checks
							</p>
						</div>

						<div className="divide-y divide-stroke-soft-200/50 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 px-4 py-1 dark:divide-white/5 dark:border-white/10 dark:bg-[#070707]">
							<AnimatePresence initial={false}>
								{displayedList.map((item) => {
									const config = getVerdictConfig(item.verdict);
									return (
										<motion.div
											key={item.id}
											initial={{ opacity: 0, y: -4 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, height: 0 }}
											transition={{ duration: 0.15 }}
											className="flex items-center justify-between py-2.5 transition-colors hover:bg-bg-weak-50/50 dark:hover:bg-white/[0.02]"
										>
											{/* Left: Colored Dot + Email */}
											<div className="flex min-w-0 items-center gap-2.5 pr-3">
												<span
													className={cn(
														"size-2 shrink-0 rounded-full",
														config.dotColor,
													)}
												/>
												<span className="truncate font-medium text-text-strong-950 text-xs sm:text-[13px] dark:text-white">
													{item.email}
												</span>
											</div>

											{/* Right: Timestamp & Status Badge */}
											<div className="flex shrink-0 items-center gap-3">
												<span className="hidden font-mono text-[11px] text-text-soft-400 sm:inline-block dark:text-white/40">
													{formatRelativeTime(item.timestamp)}
												</span>
												<code
													className={cn(
														"rounded-md border px-2 py-0.5 font-medium font-mono text-[11px] tracking-tight",
														config.badgeStyles,
													)}
												>
													{config.label}
												</code>
											</div>
										</motion.div>
									);
								})}
							</AnimatePresence>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
