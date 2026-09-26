"use client";

import { CopyCodeBlock } from "@reloop/ui/copy-code-block";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { getLanguageIcon } from "@reloop/web/components/mdx/language-icons";
import { hostedSignupHref } from "@reloop/web/lib/site";
import Link from "next/link";
import { useState } from "react";

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

	return (
		<section id="features" className="relative flex flex-col bg-transparent">
			{variant === "self-host" ? (
				<div className="relative mx-auto flex w-full max-w-5xl flex-col items-center border-stroke-soft-100 border-x px-6 pt-36 pb-20 text-center sm:px-8 sm:pt-44 sm:pb-24 md:max-w-7xl lg:px-12 lg:pt-52 lg:pb-28 dark:border-white/10">
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
				<div className="relative mx-auto flex w-full max-w-5xl flex-col items-start border-stroke-soft-100 border-x px-6 pt-36 pb-20 text-left sm:px-8 sm:pt-44 sm:pb-24 md:max-w-7xl lg:px-12 lg:pt-52 lg:pb-28 dark:border-white/10">
					<h1 className="max-w-[38rem] text-balance text-left font-medium text-3xl text-text-strong-950 leading-[1.1] tracking-tight sm:text-3xl md:text-4xl lg:text-5xl dark:text-white">
						Email Infrastructure for Developers
					</h1>
					<p className="mt-6 max-w-2xl text-pretty text-left text-lg text-text-sub-600 leading-normal md:text-xl dark:text-white/60">
						SES like infrastructure with the DX you already love. Agent inboxes,
						marketing campaigns, drip automations, built in.
					</p>
					<div className="mt-8 flex flex-wrap items-center justify-start gap-3.5 sm:mt-9 sm:gap-4">
						<FancyButton.Root
							asChild
							variant="primary"
							size="medium"
							className="h-11 rounded-xl px-6 font-medium text-[15.5px] dark:bg-white dark:text-black dark:hover:bg-white/90 dark:[--primary-base:#ffffff]"
						>
							<a href={hostedSignupHref}>Get Started</a>
						</FancyButton.Root>
						<FancyButton.Root
							asChild
							variant="basic"
							size="medium"
							className="h-11 rounded-xl px-6 font-medium text-[15.5px]"
						>
							<Link href="/self-host">Self-host Reloop</Link>
						</FancyButton.Root>
					</div>
				</div>
			)}
		</section>
	);
}

export default Hero;
