"use client";

import { CopyCodeBlock } from "@reloop/ui/copy-code-block";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { getLanguageIcon } from "@reloop/web/components/mdx/language-icons";
import { PixelBlast } from "@reloop/web/components/pixel-blast";
import { hostedSignupHref } from "@reloop/web/lib/site";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTheme } from "next-themes";
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

export interface HeroProps {
	variant?: "default" | "self-host";
}

export function Hero({ variant = "default" }: HeroProps) {
	const [installMethod, setInstallMethod] = useState<InstallMethod>("curl");
	const [active, setActive] = useState<HeroTabId>("overview");
	const reduceMotion = useReducedMotion();
	const { resolvedTheme } = useTheme();

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
				<div className="relative mx-auto grid w-full max-w-5xl items-center gap-10 overflow-hidden border-stroke-soft-200 border-x px-6 pt-[224px] pb-40 sm:px-8 md:max-w-7xl lg:grid-cols-[1.1fr_1fr] lg:gap-6 lg:px-12 dark:border-white/10">
					<div
						aria-hidden="true"
						className="absolute inset-0 [-webkit-mask-image:linear-gradient(to_right,black_0%,black_28%,transparent_42%,transparent_58%,black_72%,black_100%)] [mask-image:linear-gradient(to_right,black_0%,black_28%,transparent_42%,transparent_58%,black_72%,black_100%)]"
					>
						<PixelBlast
							variant="square"
							pixelSize={2}
							color={resolvedTheme === "dark" ? "#93c5fd" : "#2563eb"}
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
					<div className="relative z-10 order-2 flex flex-col items-center text-center lg:order-1 lg:items-start lg:text-left">
						<h1 className="max-w-xl text-center font-semibold text-[2.5rem] text-text-strong-950 leading-[1.06] tracking-[-0.04em] sm:text-[3.5rem] lg:text-left lg:text-[4.25rem] dark:text-white">
							Email API for Developers
						</h1>
						<p className="mt-5 max-w-[30rem] text-balance text-center text-[16.5px] text-text-sub-600 leading-relaxed sm:mt-6 sm:text-[18.5px] lg:text-left lg:text-[20px] dark:text-white/60">
							Reloop is the open-source email platform for transactional mail,
							agent inboxes, and automated workflows.
						</p>
						<div className="mt-8 flex flex-wrap items-center justify-center gap-3.5 sm:mt-9 sm:gap-4 lg:justify-start">
							<FancyButton.Root
								asChild
								variant="primary"
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
								<a
									href="https://cal.com/pranavp/30"
									target="_blank"
									rel="noreferrer"
								>
									<Icon name="calendar" className="size-4 shrink-0" />
									<span>Schedule call</span>
								</a>
							</FancyButton.Root>
						</div>
					</div>
					{/* Optical offset: the CRT's 3/4 mass sits right and high of the bounding-box center. */}
					<div className="relative z-10 lg:-translate-x-16 order-1 h-[320px] w-full sm:h-[400px] lg:order-2 lg:h-[470px] lg:translate-y-4">
						<MacintoshHeroMonitorLazy />
					</div>
				</div>
			)}

			<div className="relative w-full flex-1 overflow-hidden border-stroke-soft-200 border-t bg-bg-white-0 dark:border-white/10 dark:bg-black">
				<div
					ref={panelRef}
					className="relative z-10 mx-auto flex h-dvh w-full max-w-5xl flex-col border-stroke-soft-200 border-x px-3 pt-10 pb-10 sm:px-6 sm:pt-14 sm:pb-14 md:max-w-7xl lg:px-8 lg:pt-20 lg:pb-16 dark:border-white/10"
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
