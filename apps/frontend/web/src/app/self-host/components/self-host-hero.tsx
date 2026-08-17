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
import {
	HeroDemoPlaybackButton,
	HeroDemoPlaybackProvider,
} from "../../(home)/components/hero-demo-playback";
import {
	HeroPreview,
	type HeroTabId,
} from "../../(home)/components/hero-preview";

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
		icon: "activity" | "layout" | "globe" | "server" | "headset";
	};
}[] = [
	{
		id: "cloud",
		title: "Infrastructure",
		description: "Self-host on your own hardware or cloud VPS.",
		cloud: true,
		banner: {
			title: "Infrastructure",
			description: "Self-host or run on Reloop Cloud.",
			href: "/self-host",
			icon: "server",
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
		id: "dashboard",
		title: "Dashboard",
		description: "Customizable console for your email.",
		banner: {
			title: "Dashboard",
			description: "Customizable console for your email.",
			href: hostedSignupHref,
			icon: "layout",
		},
	},
	{
		id: "sdk",
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
		id: "agents",
		title: "Agent Inbox",
		description: "MCP, CLI, Skills, and Agent Previews.",
		cloud: true,
		banner: {
			title: "Agent Inbox",
			description: "MCP, CLI, Skills, and agent previews.",
			href: "/features/ai-agents",
			icon: "headset",
		},
	},
];

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

export function SelfHostHero() {
	const [installMethod, setInstallMethod] = useState<InstallMethod>("curl");
	const [active, setActive] = useState<HeroTabId>("cloud");
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
			className="relative flex min-h-dvh flex-col bg-transparent pt-28 sm:pt-32 lg:pt-36"
		>
			{/* Top Hero Centered Title & Code Block with Shell/Icons & Copy Toolbar */}
			<div className="relative mx-auto flex w-full max-w-5xl flex-col items-center px-6 text-center sm:px-8 md:max-w-7xl lg:px-12">
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
					<p className="mt-3.5 text-center text-[13px] text-text-sub-600 sm:text-[13.5px] dark:text-white/50">
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

			{/* Interactive Modern Tabs Bar */}
			<div className="relative mx-auto mt-10 w-full max-w-4xl px-4 sm:mt-12">
				<div
					role="tablist"
					aria-label="Product surfaces"
					className="flex items-center justify-between gap-1 overflow-x-auto rounded-2xl border border-stroke-soft-200 bg-bg-weak-50/80 p-1.5 backdrop-blur-md [scrollbar-width:none] dark:border-white/10 dark:bg-white/[0.04] [&::-webkit-scrollbar]:hidden"
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
									"relative flex flex-1 items-center justify-center gap-2 rounded-xl px-3.5 py-2.5 font-medium text-[13px] transition-all duration-200 sm:px-4 sm:py-3 sm:text-sm",
									selected
										? "text-text-strong-950 dark:text-white"
										: "text-text-sub-600 hover:text-text-strong-950 dark:text-white/60 dark:hover:text-white",
								)}
							>
								{selected && (
									<motion.div
										layoutId={
											reduceMotion ? undefined : "self-host-hero-tab-pill"
										}
										className="absolute inset-0 rounded-xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.04)] dark:bg-[#1a1c20] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)]"
										transition={
											reduceMotion
												? { duration: 0 }
												: { type: "spring", stiffness: 350, damping: 30 }
										}
									/>
								)}
								<span className="relative z-10 flex items-center gap-2">
									<Icon
										name={tab.banner.icon}
										className={cn(
											"size-4 transition-colors",
											selected
												? "text-text-strong-950 dark:text-white"
												: "text-text-sub-600/70 dark:text-white/40",
										)}
									/>
									<span className="whitespace-nowrap">{tab.title}</span>
								</span>
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
					className="relative z-10 mx-auto flex h-[32rem] w-full max-w-5xl flex-col px-3 pt-10 pb-10 sm:h-[40rem] sm:px-6 sm:pt-14 sm:pb-14 md:max-w-7xl lg:h-[48rem] lg:px-8 lg:pt-20 lg:pb-16"
				>
					<HeroDemoPlaybackProvider>
						<HeroWindowChrome
							action={active === "sdk" ? <HeroDemoPlaybackButton /> : undefined}
						>
							<AnimatePresence mode="wait" initial={false}>
								<motion.div
									key={active}
									className="absolute inset-0"
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
									<HeroPreview tab={active} />
								</motion.div>
							</AnimatePresence>
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
