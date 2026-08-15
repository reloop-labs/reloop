"use client";

import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { siCursor } from "simple-icons";
import { buildFrameworkPrompt } from "../build-framework-prompt";
import type { FrameworkDefinition } from "../frameworks";
import {
	getBrandColorStyle,
	isDarkBrandColor,
	LanguageIcon,
} from "./language-icon";

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

export default function FrameworkHero({
	framework,
}: {
	framework: FrameworkDefinition;
}) {
	const [copied, setCopied] = useState(false);
	const prompt = buildFrameworkPrompt(framework);

	const handleCopyPrompt = async () => {
		try {
			await navigator.clipboard.writeText(prompt);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 2000);
		} catch {
			// ignore
		}
	};

	const handleOpenCursor = () => {
		window.open(`cursor://?prompt=${encodeURIComponent(prompt)}`, "_blank");
	};

	return (
		<section className="relative w-full border-stroke-soft-200 bg-bg-white-0 text-text-strong-950 dark:border-white/10 dark:bg-black dark:text-white">
			<div className="relative mx-auto w-full max-w-5xl border-stroke-soft-200 xl:border-x md:max-w-7xl dark:border-white/10">
				{/* Top meta row: breadcrumb + version */}
				<div className="flex items-center justify-between gap-4 border-stroke-soft-200 border-b border-dashed px-6 pt-28 pb-4 sm:px-10 sm:pt-32 lg:px-12 dark:border-white/10">
					<nav
						aria-label="Breadcrumb"
						className="flex flex-wrap items-center gap-1.5 font-mono text-[10px] text-text-sub-600 uppercase tracking-[0.14em] dark:text-white/45"
					>
						<Link
							href="/sdk"
							className="transition-colors hover:text-text-strong-950 dark:hover:text-white"
						>
							SDKs
						</Link>
						<span className="text-text-soft-400 dark:text-white/25">/</span>
						<Link
							href="/frameworks"
							className="transition-colors hover:text-text-strong-950 dark:hover:text-white"
						>
							Frameworks
						</Link>
						<span className="text-text-soft-400 dark:text-white/25">/</span>
						<span className="text-text-sub-600 dark:text-white/50">
							{framework.name}
						</span>
					</nav>
					<span className="shrink-0 font-mono text-[10px] text-text-sub-600 uppercase tracking-[0.12em] dark:text-white/40">
						[{framework.languageName} SDK]
					</span>
				</div>

				{/* Product fold: icon + title + sub + CTA */}
				<div className="relative px-6 py-10 sm:px-10 sm:py-12 lg:px-12 lg:py-14">
					<div className="relative z-10 flex items-start gap-4 sm:gap-5">
						{/* App icon tile — same height as the title row so they share one line */}
						<div
							className={cn(
								"flex size-16 shrink-0 items-center justify-center rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.12)] sm:size-20 dark:border-white/10 dark:bg-bg-black-950 dark:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.45)]",
								isDarkBrandColor(framework.icon.hex) &&
									"text-text-strong-950 dark:text-white",
							)}
							style={getBrandColorStyle(framework.icon.hex)}
						>
							<LanguageIcon
								icon={framework.icon}
								className="size-8 sm:size-10"
							/>
						</div>

						<div className="min-w-0 flex-1">
							<h1 className="flex min-h-16 items-center font-semibold text-3xl text-text-strong-950 tracking-tight sm:min-h-20 sm:text-4xl lg:text-[2.5rem] dark:text-white">
								{framework.name}
							</h1>
							<p className="mt-2 max-w-xl text-[15px] text-text-sub-600 leading-relaxed sm:text-[16px] dark:text-white/60">
								{framework.shortDescription}
							</p>

							<div className="mt-6 flex flex-wrap items-center gap-3">
								<button
									type="button"
									onClick={handleCopyPrompt}
									aria-label={copied ? "Copied" : "Copy prompt"}
									className={`${Button.buttonVariants({
										variant: "neutral",
										mode: "filled",
									}).root()} inline-flex h-9! min-w-[9.25rem] cursor-pointer items-center justify-center gap-2! overflow-hidden rounded-full! px-5! font-medium text-sm! active:scale-[0.98] dark:bg-white dark:text-black dark:hover:bg-white/90`}
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
												<Icon
													name="check-circle"
													className="h-4 w-4 shrink-0"
												/>
											) : (
												<PromptIcon className="size-4 shrink-0" />
											)}
											<span>{copied ? "Copied!" : "Copy prompt"}</span>
										</motion.span>
									</AnimatePresence>
								</button>
								<button
									type="button"
									onClick={handleOpenCursor}
									className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-full border border-stroke-soft-200 bg-bg-white-0 px-4 font-medium text-[13px] text-text-strong-950 transition-colors hover:bg-bg-weak-50 active:scale-[0.98] dark:border-white/15 dark:bg-black dark:text-white dark:hover:!bg-[#0A0A0A]"
								>
									<svg
										role="img"
										viewBox="0 0 24 24"
										width={14}
										height={14}
										aria-hidden
										className="shrink-0"
										fill="currentColor"
									>
										<path d={siCursor.path} />
									</svg>
									<span>Open in Cursor</span>
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
