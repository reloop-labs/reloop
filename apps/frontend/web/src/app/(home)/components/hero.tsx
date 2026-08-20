"use client";

import { cn } from "@reloop/ui/cn";
import { CopyCodeBlock } from "@reloop/ui/copy-code-block";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { getLanguageIcon } from "@reloop/web/components/mdx/language-icons";
import { hostedSignupHref } from "@reloop/web/lib/site";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { HeroAtmosphere, HeroWindowChrome } from "./hero-chrome";
import { HeroDashboardShell } from "./hero-dashboard-shell";
import {
	HeroDemoPlaybackButton,
	HeroDemoPlaybackProvider,
} from "./hero-demo-playback";
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

const TABS: {
	id: HeroTabId;
	title: string;
	description: string;
	cloud?: boolean;
}[] = [
	{
		id: "overview",
		title: "Overview",
		description: "Live feed of sent emails, opens, clicks, and deliveries.",
	},
	{
		id: "analytics",
		title: "Analytics",
		description: "Deliverability and engagement for every send.",
	},
	{
		id: "domain",
		title: "Domain",
		description: "SPF, DKIM, and DMARC authentication for your domain.",
	},
	{
		id: "templates",
		title: "Templates",
		description: "Visual editor with dynamic variables and components.",
	},
	{
		id: "workflow",
		title: "Workflow",
		description: "Trigger automated sequences, webhooks, and logic.",
	},
];

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

export interface HeroProps {
	variant?: "default" | "self-host";
}

export function Hero({ variant = "default" }: HeroProps) {
	const [installMethod, setInstallMethod] = useState<InstallMethod>("curl");
	const [active, setActive] = useState<HeroTabId>("overview");
	const reduceMotion = useReducedMotion();
	const tablistId = useId();

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

	const selectByOffset = useCallback((offset: number) => {
		setActive((current) => {
			const index = TABS.findIndex((tab) => tab.id === current);
			const next = (index + offset + TABS.length) % TABS.length;
			return TABS[next]?.id ?? current;
		});
	}, []);

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
				<div className="relative mx-auto flex w-full max-w-5xl flex-col items-center border-stroke-soft-200 border-x px-6 pt-36 pb-20 text-center sm:px-8 sm:pt-44 sm:pb-24 md:max-w-7xl lg:px-12 lg:pt-52 lg:pb-28 dark:border-white/10">
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
				<div className="relative mx-auto flex w-full max-w-5xl flex-col items-center border-stroke-soft-200 border-x px-6 pt-28 pb-20 text-center sm:px-8 sm:pt-32 sm:pb-24 md:max-w-7xl lg:px-12 lg:pt-36 lg:pb-28 dark:border-white/10">
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
					<h1 className="max-w-4xl text-center font-semibold text-[2.5rem] text-text-strong-950 leading-[1.06] tracking-[-0.04em] sm:text-[3.5rem] lg:text-[4.25rem] dark:text-white">
						Email API for Developers
					</h1>
					<p className="mt-5 max-w-[46rem] text-balance text-center text-[16.5px] text-text-sub-600 leading-relaxed sm:mt-6 sm:text-[18.5px] lg:text-[20px] dark:text-white/60">
						Reloop is the open-source email platform for transactional mail,
						agent inboxes, and automated workflows.
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
				</div>
			)}

			<div className="relative mx-auto w-full max-w-5xl flex-1 flex-col border-stroke-soft-200 border-x md:max-w-7xl dark:border-white/10">
				<div
					role="tablist"
					aria-label="Product surfaces"
					className="flex overflow-x-auto border-stroke-soft-200 border-t border-b [scrollbar-width:none] lg:grid lg:grid-cols-5 dark:border-white/10 [&::-webkit-scrollbar]:hidden"
					onKeyDown={(event) => {
						if (event.key === "ArrowRight") {
							event.preventDefault();
							selectByOffset(1);
						} else if (event.key === "ArrowLeft") {
							event.preventDefault();
							selectByOffset(-1);
						}
					}}
				>
					{TABS.map((tab) => {
						const selected = tab.id === active;
						return (
							<button
								key={tab.id}
								type="button"
								role="tab"
								id={`${tablistId}-${tab.id}`}
								aria-selected={selected}
								aria-controls={`${tablistId}-panel`}
								tabIndex={selected ? 0 : -1}
								onClick={() => setActive(tab.id)}
								className={cn(
									"relative min-w-[11.5rem] flex-1 cursor-pointer border-stroke-soft-200 border-l px-5 py-4 text-left transition-colors duration-200 first:border-l-0 sm:min-w-[13rem] sm:px-6 sm:py-5 dark:border-white/10",
									selected
										? "bg-transparent"
										: "bg-transparent hover:bg-bg-weak-50/70 dark:hover:bg-white/[0.02]",
								)}
							>
								<span className="flex items-center gap-2">
									<span
										className={cn(
											"font-medium text-[14px] tracking-[-0.01em] transition-colors duration-200 sm:text-[15px]",
											selected
												? "text-text-strong-950 dark:text-white"
												: "text-text-sub-600 dark:text-white/55",
										)}
									>
										{tab.title}
									</span>
									{tab.cloud && (
										<span className="inline-flex items-center rounded-full bg-bg-weak-50 px-1.5 py-0.5 font-medium text-[10px] text-text-sub-600 leading-none dark:bg-white/[0.08] dark:text-white/55">
											Cloud
										</span>
									)}
								</span>
								<span
									className={cn(
										"mt-1.5 block max-w-[16rem] text-[13px] leading-snug transition-colors duration-200 sm:text-[14px]",
										selected
											? "text-text-sub-600 dark:text-white/50"
											: "text-text-soft-400 dark:text-white/35",
									)}
								>
									{tab.description}
								</span>
								{selected && (
									<motion.span
										layoutId={reduceMotion ? undefined : "hero-tab-underline"}
										className="absolute right-0 bottom-0 left-0 h-[2px] bg-text-strong-950 dark:bg-white"
										transition={
											reduceMotion
												? { duration: 0 }
												: { duration: 0.22, ease: EASE_OUT }
										}
									/>
								)}
							</button>
						);
					})}
				</div>
			</div>

			<div className="relative w-full flex-1 overflow-hidden bg-bg-white-0 dark:bg-black">
				<HeroAtmosphere />
				<div
					ref={panelRef}
					id={`${tablistId}-panel`}
					role="tabpanel"
					aria-labelledby={`${tablistId}-${active}`}
					className="relative z-10 mx-auto flex h-dvh w-full max-w-5xl flex-col px-3 pt-10 pb-10 sm:px-6 sm:pt-14 sm:pb-14 md:max-w-7xl lg:px-8 lg:pt-20 lg:pb-16"
				>
					{/* Left and Right vertical borders matching the HeroAtmosphere line color and vertical gradient */}
					<div
						aria-hidden
						className="pointer-events-none absolute inset-y-0 left-0 w-px bg-gradient-to-b from-[rgba(0,111,254,0.06)] via-[rgba(0,111,254,0.16)] to-[rgba(0,111,254,0.28)] dark:from-[rgba(0,111,254,0.1)] dark:via-[rgba(0,111,254,0.22)] dark:to-[rgba(0,111,254,0.38)]"
					/>
					<div
						aria-hidden
						className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-[rgba(0,111,254,0.06)] via-[rgba(0,111,254,0.16)] to-[rgba(0,111,254,0.28)] dark:from-[rgba(0,111,254,0.1)] dark:via-[rgba(0,111,254,0.22)] dark:to-[rgba(0,111,254,0.38)]"
					/>
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
