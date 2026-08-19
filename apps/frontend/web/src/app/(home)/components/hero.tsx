"use client";

import { CopyCodeBlock } from "@reloop/ui/copy-code-block";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { MorphingTabs, type MorphingTabsItem } from "@reloop/ui/morphing-tabs";
import { getLanguageIcon } from "@reloop/web/components/mdx/language-icons";
import { hostedSignupHref } from "@reloop/web/lib/site";
import Link from "next/link";
import { useCallback, useId, useMemo, useState } from "react";
import { HeroBrowserUrlBar } from "./hero-browser-url-bar";
import { HeroAtmosphere } from "./hero-chrome";
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
	icon: string;
}[] = [
	{ id: "overview", title: "Overview", icon: "mail-single" },
	{ id: "analytics", title: "Analytics", icon: "activity" },
	{ id: "domain", title: "Domain", icon: "globe" },
	{ id: "workflow", title: "Workflow", icon: "workflow" },
	{ id: "templates", title: "Templates", icon: "layout" },
];

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
	const tablistId = useId();

	const handleSidebarClick = useCallback((id: string) => {
		const targetTab = NAV_TO_TAB[id];
		if (targetTab) {
			setActive(targetTab);
		}
	}, []);

	const morphingItems: MorphingTabsItem[] = useMemo(
		() =>
			TABS.map((tab) => ({
				id: tab.id,
				label: tab.title,
				icon: <Icon name={tab.icon} className="size-4 shrink-0" />,
				content: (
					<HeroDashboardShell
						activeItem={TAB_TO_NAV[tab.id] ?? "emails"}
						onItemClick={handleSidebarClick}
					>
						<HeroPreviewContent tab={tab.id} />
					</HeroDashboardShell>
				),
			})),
		[handleSidebarClick],
	);

	return (
		<section
			id="features"
			className="relative flex min-h-dvh flex-col bg-transparent"
		>
			{variant === "self-host" ? (
				<div className="relative mx-auto flex w-full max-w-5xl flex-col items-center px-6 pt-36 pb-12 text-center sm:px-8 sm:pt-44 sm:pb-16 md:max-w-7xl lg:px-12 lg:pt-52">
					<h1 className="max-w-3xl text-center font-semibold text-[2rem] text-text-strong-950 leading-[1.08] tracking-[-0.035em] sm:text-[2.75rem] lg:text-[3.25rem] dark:text-white">
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
				<div className="relative mx-auto flex w-full max-w-5xl flex-col items-center px-6 pt-28 pb-12 text-center sm:px-8 sm:pt-32 sm:pb-14 md:max-w-7xl lg:px-12 lg:pt-36 lg:pb-16">
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
					<h1 className="max-w-3xl text-center font-semibold text-[2rem] text-text-strong-950 leading-[1.08] tracking-[-0.035em] sm:text-[2.75rem] lg:text-[3.25rem] dark:text-white">
						Email API for Developers
					</h1>
					<p className="mt-4 max-w-[42rem] text-balance text-center text-[15px] text-text-sub-600 leading-relaxed sm:mt-5 sm:text-[16.5px] dark:text-white/55">
						Reloop is the open-source email platform for transactional mail,
						agent inboxes, and automated workflows.
					</p>
					<div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:mt-7">
						<FancyButton.Root asChild variant="neutral" size="medium" className="h-12 px-6 text-[15px] rounded-xl">
							<a href={hostedSignupHref}>Get Started</a>
						</FancyButton.Root>
						<FancyButton.Root asChild variant="basic" size="medium" className="h-12 px-6 text-[15px] rounded-xl">
							<a href="/docs">Documentation</a>
						</FancyButton.Root>
					</div>
				</div>
			)}

			<div className="relative w-full flex-1 overflow-hidden bg-bg-white-0 dark:bg-black">
				<HeroAtmosphere />
				<div
					id={`${tablistId}-panel`}
					role="tabpanel"
					aria-labelledby={`${tablistId}-${active}`}
					className="relative z-10 mx-auto flex h-dvh w-full max-w-5xl flex-col px-3 pt-10 pb-10 sm:px-6 sm:pt-14 sm:pb-14 md:max-w-7xl lg:px-8 lg:pt-20 lg:pb-16"
				>
					<HeroDemoPlaybackProvider>
						<MorphingTabs
							items={morphingItems}
							value={active}
							onValueChange={(id) => id && setActive(id as HeroTabId)}
							ariaLabel="Product surfaces"
							leading={
								<div
									aria-hidden
									className="flex items-center gap-[7px]"
								>
									<span className="size-[11px] rounded-full bg-[#ff5f57] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.12)] sm:size-3" />
									<span className="size-[11px] rounded-full bg-[#febc2e] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.12)] sm:size-3" />
									<span className="size-[11px] rounded-full bg-[#28c840] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.12)] sm:size-3" />
								</div>
							}
							trailing={
								active === "overview" ||
								active === "sdk" ||
								active === "domain" ? (
									<HeroDemoPlaybackButton />
								) : undefined
							}
							toolbar={
								<HeroBrowserUrlBar
									activeItem={TAB_TO_NAV[active] ?? "emails"}
								/>
							}
							className="h-full w-full"
						/>
					</HeroDemoPlaybackProvider>
				</div>
			</div>
		</section>
	);
}

export default Hero;
