"use client";

import { cn } from "@reloop/ui/cn";
import { CopyCodeBlock } from "@reloop/ui/copy-code-block";
import { Icon } from "@reloop/ui/icon";
import { getLanguageIcon } from "@reloop/web/components/mdx/language-icons";
import { hostedSignupHref } from "@reloop/web/lib/site";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useCallback, useId, useState } from "react";
import {
	HeroAtmosphere,
	HeroWindowChrome,
} from "../../(home)/components/hero-chrome";
import { HeroDashboardShell } from "../../(home)/components/hero-dashboard-shell";
import {
	HeroDemoPlaybackButton,
	HeroDemoPlaybackProvider,
} from "../../(home)/components/hero-demo-playback";
import {
	HeroPreviewContent,
	type HeroTabId,
} from "../../(home)/components/hero-preview-content";

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

const TABS: {
	id: HeroTabId;
	title: string;
	description: string;
	cloud?: boolean;
	banner: {
		title: string;
		description: string;
		href: string;
		icon: string;
	};
}[] = [
	{
		id: "overview",
		title: "Overview",
		description: "Live feed of sent emails, opens, clicks, and deliveries.",
		banner: {
			title: "Overview",
			description: "Live feed of sent emails, deliveries, opens, and clicks.",
			href: hostedSignupHref,
			icon: "layout",
		},
	},
	{
		id: "analytics",
		title: "Analytics",
		description: "Deliverability and engagement for every send.",
		banner: {
			title: "Analytics",
			description: "Deliverability and engagement for every send.",
			href: "/docs/learn/metrics",
			icon: "activity",
		},
	},
	{
		id: "domain",
		title: "Domain",
		description: "SPF, DKIM, and DMARC authentication for your domain.",
		banner: {
			title: "Domains",
			description: "Set up SPF, DKIM, and DMARC so every send authenticates.",
			href: "/domain",
			icon: "globe",
		},
	},
	{
		id: "workflow",
		title: "Workflow",
		description: "Trigger automated sequences, webhooks, and logic.",
		banner: {
			title: "Workflows",
			description: "Trigger automated sequences and event-driven email logic.",
			href: "/docs/learn/workflows",
			icon: "workflow",
		},
	},
	{
		id: "templates",
		title: "Templates",
		description: "Visual editor with dynamic variables and components.",
		banner: {
			title: "Templates",
			description: "Design and preview transactional and marketing email templates.",
			href: "/features/email-templates",
			icon: "layout",
		},
	},
];

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

export function SelfHostHero() {
	const [installMethod, setInstallMethod] = useState<InstallMethod>("curl");
	const [active, setActive] = useState<HeroTabId>("overview");
	const reduceMotion = useReducedMotion();
	const tablistId = useId();

	const selectByOffset = useCallback((offset: number) => {
		setActive((current) => {
			const index = TABS.findIndex((tab) => tab.id === current);
			const next = (index + offset + TABS.length) % TABS.length;
			return TABS[next]?.id ?? current;
		});
	}, []);

	return (
		<section
			id="features"
			className="relative flex min-h-dvh flex-col bg-transparent"
		>
			{/* Top Hero Centered Title & Code Block with Shell/Icons & Copy Toolbar */}
			<div className="relative mx-auto flex w-full max-w-5xl flex-col items-center border-stroke-soft-200 border-x px-6 pt-36 pb-12 text-center sm:px-8 sm:pt-44 sm:pb-16 md:max-w-7xl lg:px-12 lg:pt-52 dark:border-white/10">
				<h1 className="max-w-3xl text-center font-semibold text-[2rem] text-text-strong-950 leading-[1.08] tracking-[-0.035em] sm:text-[2.75rem] lg:text-[3.25rem] dark:text-white">
					Self-Host Reloop
					<br />
					On your own server
				</h1>

				{/* Copy Code Block with Shell/Brand Icons & Copy Button */}
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
										layoutId={
											reduceMotion ? undefined : "self-host-hero-tab-underline"
										}
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

			{/* Interactive Animated Preview Window */}
			<div className="relative w-full flex-1 overflow-hidden bg-bg-white-0 dark:bg-black">
				<HeroAtmosphere />
				<div
					id={`${tablistId}-panel`}
					role="tabpanel"
					aria-labelledby={`${tablistId}-${active}`}
					className="relative z-10 mx-auto flex h-[calc(100dvh-100px)] w-full max-w-5xl flex-col px-3 pt-10 pb-10 sm:px-6 sm:pt-14 sm:pb-14 md:max-w-7xl lg:px-8 lg:pt-20 lg:pb-16"
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
					<HeroDemoPlaybackProvider>
						<HeroWindowChrome
							action={active === "sdk" ? <HeroDemoPlaybackButton /> : undefined}
						>
							<HeroDashboardShell
								activeItem={activeNav}
								onItemClick={handleSidebarClick}
							>
								<AnimatePresence mode="wait" initial={false}>
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
							<SelfHostHeroTabBanner
								tabId={active}
								reduceMotion={Boolean(reduceMotion)}
							/>
						</HeroWindowChrome>
					</HeroDemoPlaybackProvider>
				</div>
			</div>
		</section>
	);
}

function SelfHostHeroTabBanner({
	tabId,
	reduceMotion,
}: {
	tabId: HeroTabId;
	reduceMotion: boolean;
}) {
	const tab = TABS.find((item) => item.id === tabId) ?? TABS[0]!;
	const { banner } = tab;

	return (
		<AnimatePresence mode="wait" initial={false}>
			<motion.div
				key={tab.id}
				className="pointer-events-none absolute inset-x-3 bottom-3 z-10 sm:inset-x-5 sm:bottom-5"
				initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
				animate={{ opacity: 1, y: 0 }}
				exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
				transition={
					reduceMotion ? { duration: 0 } : { duration: 0.2, ease: EASE_OUT }
				}
			>
				<div className="pointer-events-auto flex items-center gap-3 rounded-2xl bg-[#171717] px-3 py-2.5 text-white shadow-[0_8px_28px_rgba(0,0,0,0.18)] sm:gap-4 sm:rounded-[1.35rem] sm:px-4 sm:py-3 dark:bg-[#111]">
					<span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10 sm:size-11">
						<Icon name={banner.icon} className="size-5 text-white" />
					</span>
					<div className="min-w-0 flex-1">
						<p className="truncate font-semibold text-[14px] leading-tight tracking-tight sm:text-[15px]">
							{banner.title}
						</p>
						<p className="mt-0.5 truncate text-[12px] text-white/55 leading-snug sm:text-[13px]">
							{banner.description}
						</p>
					</div>
					<Link
						href={banner.href}
						className="inline-flex h-9 shrink-0 items-center rounded-full bg-white px-3.5 font-medium text-[#171717] text-[13px] transition-opacity hover:opacity-90 sm:h-10 sm:px-4"
					>
						Learn more
					</Link>
				</div>
			</motion.div>
		</AnimatePresence>
	);
}
