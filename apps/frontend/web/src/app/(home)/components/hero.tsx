"use client";

import { CopyCodeBlock } from "@reloop/ui/copy-code-block";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { getLanguageIcon } from "@reloop/web/components/mdx/language-icons";
import { hostedSignupHref } from "@reloop/web/lib/site";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { HeroWindowChrome } from "./hero-chrome";
import { HeroDashboardShell } from "./hero-dashboard-shell";
import {
	HeroDemoPlaybackButton,
	HeroDemoPlaybackProvider,
} from "./hero-demo-playback";
import { MacintoshHeroMonitorLazy } from "./hero-monitor-lazy";
import { HeroPreviewContent, type HeroTabId } from "./hero-preview-content";

const TAB_TO_NAV: Record<HeroTabId, string> = {
	overview: "emails",
	analytics: "metrics",
	domain: "domain",
	workflow: "workflow",
	templates: "templates",
	dashboard: "emails",
	sdk: "domain",
	cloud: "domain",
	agents: "inbox",
};

const NAV_TO_TAB: Record<string, HeroTabId> = {
	emails: "overview",
	inbox: "overview",
	contacts: "workflow",
	templates: "templates",
	workflow: "workflow",
	metrics: "analytics",
	logs: "analytics",
	"api-keys": "domain",
	domain: "domain",
	webhooks: "workflow",
	integrations: "workflow",
	smtp: "overview",
	settings: "overview",
};

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

type InstallMethod = "curl" | "docker" | "cli";

const INSTALL_TABS = [
	{ id: "curl", label: "curl", si: getLanguageIcon("bash")! },
	{ id: "docker", label: "docker", si: getLanguageIcon("docker")! },
	{ id: "cli", label: "cli", si: getLanguageIcon("bash")! },
];

const INSTALL_COMMANDS: Record<InstallMethod, string> = {
	curl: "curl -fsSL https://reloop.sh/install.sh | bash",
	docker:
		"docker run -d -p 3000:3000 -p 25:25 ghcr.io/reloop-labs/reloop:latest",
	cli: "npx reloop init",
};

const HERO_AI_PROMPT = `Integrate Reloop into this project.

I will set RELOOP_API_KEY in my .env (never commit the real key). Use this placeholder until I paste the real value:
RELOOP_API_KEY=rl_your_api_key_here

Do the following:
1. Detect this project's framework and language.
2. Install the official Reloop SDK (Node/Python: reloop-email; Go: github.com/reloop-labs/reloop-go/v2; PHP: reloop/reloop-email; Java: sh.reloop:reloop-email; .NET: Reloop.Email; Ruby: reloop-email; Elixir: reloop), or call the REST API.
3. Wire the key from env and send a test email:
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

export interface HeroProps {
	variant?: "default" | "self-host";
}

export function Hero({ variant = "default" }: HeroProps) {
	const [installMethod, setInstallMethod] = useState<InstallMethod>("curl");
	const [active, setActive] = useState<HeroTabId>("overview");
	const [copied, setCopied] = useState(false);
	const reduceMotion = useReducedMotion();

	const handleCopyPrompt = async () => {
		try {
			await navigator.clipboard.writeText(HERO_AI_PROMPT);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 2000);
		} catch {
			// ignore
		}
	};

	const heroRef = useRef<HTMLElement>(null);
	const panelRef = useRef<HTMLDivElement>(null);
	const [isScrolledHalf, setIsScrolledHalf] = useState(false);

	useEffect(() => {
		const checkScroll = () => {
			if (isScrolledHalf) return;
			const heroEl = heroRef.current;
			const panelEl = panelRef.current;
			if (!heroEl && !panelEl) return;

			const vh = window.innerHeight || 800;

			// Method 1: Hero element scroll position
			if (heroEl) {
				const heroRect = heroEl.getBoundingClientRect();
				if (
					-heroRect.top >= vh * 0.5 ||
					-heroRect.top >= heroRect.height * 0.5
				) {
					setIsScrolledHalf(true);
					return;
				}
			}

			// Method 2: Dashboard panel scroll position
			if (panelEl) {
				const panelRect = panelEl.getBoundingClientRect();
				if (panelRect.top <= vh * 0.5) {
					setIsScrolledHalf(true);
					return;
				}
			}
		};

		checkScroll();
		window.addEventListener("scroll", checkScroll, { passive: true });
		window.addEventListener("resize", checkScroll, { passive: true });

		return () => {
			window.removeEventListener("scroll", checkScroll);
			window.removeEventListener("resize", checkScroll);
		};
	}, [isScrolledHalf]);

	const activeNav = TAB_TO_NAV[active] ?? "emails";

	const handleSidebarClick = useCallback((id: string) => {
		const targetTab = NAV_TO_TAB[id];
		if (targetTab) {
			setActive(targetTab);
		}
	}, []);

	return (
		<section
			id="features"
			ref={heroRef}
			className="relative flex min-h-dvh flex-col bg-transparent"
		>
			{variant === "self-host" ? (
				<div className="relative mx-auto flex w-full max-w-5xl flex-col items-center px-6 pt-36 pb-20 text-center sm:px-8 sm:pt-44 sm:pb-24 md:max-w-7xl lg:px-12 lg:pt-52 lg:pb-28">
					<h1 className="max-w-4xl text-center font-semibold text-[2.5rem] text-text-strong-950 leading-[1.06] tracking-[-0.04em] sm:text-[3.5rem] lg:text-[4.25rem] dark:text-white">
						Self-Host Reloop
						<br />
						On your own server
					</h1>

					<div className="mt-10 w-full max-w-xl text-left sm:mt-12 lg:mt-14">
						<CopyCodeBlock
							code={INSTALL_COMMANDS[installMethod]}
							lang="bash"
							tabs={INSTALL_TABS}
							activeTab={installMethod}
							onTabChange={(id) => setInstallMethod(id as InstallMethod)}
							hideLineNumbers
						/>
						<p className="mt-4 text-center text-[13px] text-text-sub-600 sm:text-[13.5px] dark:text-white/50">
							Prefer a managed solution?{" "}
							<Link
								href={hostedSignupHref}
								className="group inline-flex items-center gap-1 font-medium text-text-strong-950 underline decoration-text-sub-600/30 underline-offset-4 transition-colors hover:text-blue-600 hover:decoration-blue-600 dark:text-white dark:hover:text-blue-400 dark:hover:decoration-blue-400"
							>
								<span>Get started on Reloop Cloud</span>
								<Icon
									name="arrow-up-right"
									className="size-3.5 rotate-45 transition-transform duration-200"
									aria-hidden="true"
								/>
							</Link>
						</p>
					</div>
				</div>
			) : (
				<div className="relative mx-auto grid w-full max-w-5xl items-center gap-10 px-6 pt-24 pb-14 sm:px-8 sm:pt-28 sm:pb-16 md:max-w-7xl lg:grid-cols-[1.1fr_1fr] lg:gap-6 lg:px-12 lg:pt-32 lg:pb-20">
					<div className="flex flex-col items-start text-left">
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
						<h1 className="max-w-xl text-left font-semibold text-[2.5rem] text-text-strong-950 leading-[1.06] tracking-[-0.04em] sm:text-[3.5rem] lg:text-[4.25rem] dark:text-white">
							Email API for Developers
						</h1>
						<p className="mt-5 max-w-[30rem] text-balance text-left text-[16.5px] text-text-sub-600 leading-relaxed sm:mt-6 sm:text-[18.5px] lg:text-[20px] dark:text-white/60">
							Reloop is the open-source email platform for transactional mail,
							agent inboxes, and automated workflows.
						</p>
						<div className="mt-8 flex flex-wrap items-center justify-start gap-3.5 sm:mt-9 sm:gap-4">
							<FancyButton.Root
								asChild
								variant="primary"
								size="medium"
								className="h-11 rounded-xl px-6 font-medium text-[15.5px]"
							>
								<a href={hostedSignupHref}>Get Started</a>
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
					</div>
					{/* Optical offset: the CRT's 3/4 mass sits right and high of the bounding-box center. */}
					<div className="lg:-translate-x-16 relative h-[320px] w-full sm:h-[400px] lg:h-[470px] lg:translate-y-4">
						<MacintoshHeroMonitorLazy />
					</div>
				</div>
			)}

			<div className="relative w-full flex-1 overflow-hidden bg-bg-white-0 dark:bg-black">
				<div
					ref={panelRef}
					className="relative z-10 mx-auto flex h-dvh w-full max-w-5xl flex-col px-3 pt-10 pb-10 sm:px-6 sm:pt-14 sm:pb-14 md:max-w-7xl lg:px-8 lg:pt-20 lg:pb-16"
				>
					<HeroDemoPlaybackProvider started={isScrolledHalf}>
						<HeroWindowChrome
							action={
								active === "overview" ||
								active === "sdk" ||
								active === "domain" ? (
									<HeroDemoPlaybackButton />
								) : undefined
							}
						>
							<HeroDashboardShell
								activeItem={activeNav}
								onItemClick={handleSidebarClick}
							>
								<AnimatePresence mode="wait">
									<motion.div
										key={active}
										className="h-full w-full"
										initial={
											reduceMotion
												? { opacity: 1 }
												: { opacity: 0, filter: "blur(2px)" }
										}
										animate={{ opacity: 1, filter: "blur(0px)" }}
										exit={
											reduceMotion
												? { opacity: 0 }
												: { opacity: 0, filter: "blur(2px)" }
										}
										transition={
											reduceMotion
												? { duration: 0 }
												: { duration: 0.2, ease: EASE_OUT }
										}
									>
										<HeroPreviewContent tab={active} />
									</motion.div>
								</AnimatePresence>
							</HeroDashboardShell>
						</HeroWindowChrome>
					</HeroDemoPlaybackProvider>
				</div>
			</div>
		</section>
	);
}

export default Hero;
