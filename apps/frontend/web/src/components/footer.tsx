"use client";

import { Icon } from "@reloop/ui/icon";
import { Logo } from "@reloop/ui/logo";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const links = [
	{
		group: "Product",
		items: [
			{
				title: "Campaigns",
				href: "/features/campaigns",
			},
			{
				title: "Email Analytics",
				href: "/features/email-analytics",
			},
			{
				title: "Transaction Emails",
				href: "/features/transaction-emails",
			},
			{
				title: "Email Validation",
				href: "/features/email-validation",
			},
			{
				title: "Email Templates",
				href: "/features/email-templates",
			},
			{
				title: "SMTP Relay",
				href: "/features/smtp",
			},
			{
				title: "Languages",
				href: "/features/languages",
			},
			{
				title: "Deliverability",
				href: "/features/deliverability",
			},
		],
	},
	{
		group: "Platform",
		items: [
			{
				title: "Getting Started",
				href: "/docs/getting-started",
			},
			{
				title: "API Reference",
				href: "/docs/api-reference",
			},
			{
				title: "Campaign Builder",
				href: "/docs/campaign-builder",
			},
			{
				title: "Integration",
				href: "/docs/integration",
			},
			{
				title: "Webhooks",
				href: "/docs/webhooks",
			},
			{
				title: "SDKs",
				href: "/docs/SDKs",
			},
		],
	},
	{
		group: "Company",
		items: [
			{
				title: "About Us",
				href: "/company/about-us",
			},
			{
				title: "Blog",
				href: "/company/blog",
			},
			{
				title: "Contact Us",
				href: "/company/contact-us",
			},
			{
				title: "Pricing",
				href: "/pricing",
			},
			{
				title: "Grosory",
				href: "/grosory",
			},
			{
				title: "Compare",
				href: "/compare",
			},
			{
				title: "Why Reloop",
				href: "/philosophy/why-reloop",
			},
			{
				title: "Why Open-source",
				href: "/philosophy/why-open-source",
			},
			{
				title: "Changelog",
				href: "/resources/changelog",
			},
		],
	},
	{
		group: "Legal",
		items: [
			{
				title: "Terms and Conditions",
				href: "/company/terms-and-conditions",
			},
			{
				title: "Privacy Policy",
				href: "/company/privacy",
			},
			{
				title: "License",
				href: "/company/license",
			},
			{
				title: "Self-hosting Guide",
				href: "/resources/self-hosting-guide",
			},
			{
				title: "Status",
				href: "https://status.reloop.sh/status/live",
			},
			{
				title: "Community",
				href: "/resources/community",
			},
		],
	},
];

const githubUrl = "https://github.com/reloop-labs/reloop";
const twitterUrl = "https://x.com/reloophq";
const discordUrl = "https://discord.gg/bHnkBcp7xR";

export const Footer = () => {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	const [year, setYear] = useState(2026);

	useEffect(() => {
		setMounted(true);
		setYear(new Date().getFullYear());
	}, []);

	return (
		<footer className="bg-[#f8f8f8] text-[#0a0d12] transition-colors duration-300 dark:bg-black dark:text-white">
			<div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
				{/* Top: CTA + link columns */}
				<div className="flex flex-col gap-12 border-stroke-soft-200 border-b py-12 sm:py-16 lg:flex-row lg:gap-20 dark:border-stroke-soft-100">
					{/* Left — branding / CTA */}
					<div className="lg:w-[340px] lg:shrink-0">
						<Link href="/" className="flex items-center">
							<Logo className="-ml-2 h-10 w-10 text-[#0a0d12] dark:text-white" />
							<span className="font-semibold text-[18px] tracking-[0.04em]">
								Reloop
							</span>
						</Link>
						<p className="mt-2 max-w-[300px] font-medium text-[#0a0d12]/50 text-sm dark:text-white/50">
							Open-source email infrastructure for modern applications. Use
							Reloop hosted or self-host—no vendor lock-in.
						</p>
						<div className="mt-4 flex items-center gap-2">
							<Link
								href={twitterUrl}
								target="_blank"
								rel="noreferrer"
								className="text-[#0a0d12]/40 transition-colors hover:text-[#0a0d12] dark:text-white/40 dark:hover:text-white"
							>
								<Icon className="size-4.5" name="twitter" />
							</Link>
							<Link
								href={githubUrl}
								target="_blank"
								rel="noreferrer"
								className="text-[#0a0d12]/40 transition-colors hover:text-[#0a0d12] dark:text-white/40 dark:hover:text-white"
							>
								<Icon className="size-4.5" name="social-github" />
							</Link>
							<Link
								href={discordUrl}
								target="_blank"
								rel="noreferrer"
								className="text-[#0a0d12]/40 transition-colors hover:text-[#0a0d12] dark:text-white/40 dark:hover:text-white"
							>
								<Icon className="size-5" name="social-discord" />
							</Link>
						</div>
					</div>
					<div className="grid flex-1 grid-cols-2 gap-8 sm:grid-cols-4">
						{links.map((group) => (
							<div key={group.group}>
								<h4 className="font-semibold text-[#0a0d12]/40 text-sm uppercase dark:text-white/40">
									{group.group}
								</h4>
								<ul className="mt-4 flex flex-col gap-2.5">
									{group.items.map((link) => (
										<li key={link.title}>
											<Link
												href={link.href}
												{...(link.href.startsWith("http")
													? { target: "_blank", rel: "noreferrer" }
													: {})}
												className="font-medium text-[#0a0d12]/50 text-sm hover:text-[#0a0d12] dark:text-white/50 dark:hover:text-white"
											>
												{link.title}
											</Link>
										</li>
									))}
								</ul>
							</div>
						))}
					</div>
				</div>
				<div className="flex flex-col-reverse items-center justify-between gap-4 py-6 sm:flex-row">
					<p className="text-[#0a0d12]/36 text-[13px] dark:text-white/36">
						© {year} Reloop. All rights reserved.
					</p>
					<div className="inline-flex items-center rounded-full border border-[#0a0d12]/10 bg-[#0a0d12]/5 p-0.5 dark:border-white/5 dark:bg-white/[0.03]">
						<button
							type="button"
							onClick={() => setTheme("light")}
							className={`flex items-center rounded-full px-1.5 py-1.5 font-semibold text-[12px] transition-all duration-200 ${
								mounted && theme === "light"
									? "bg-white text-black shadow-sm"
									: "text-[#0a0d12]/40 hover:text-[#0a0d12]/80 dark:text-white/40 dark:hover:text-white/80"
							}`}
						>
							<Icon className="size-3.5" name="sun" />
						</button>
						<button
							type="button"
							onClick={() => setTheme("dark")}
							className={`flex items-center gap-1.5 rounded-full px-1.5 py-1.5 font-semibold text-[12px] transition-all duration-200 ${
								mounted && theme === "dark"
									? "bg-white text-black shadow-sm"
									: "text-[#0a0d12]/40 hover:text-[#0a0d12]/80 dark:text-white/40 dark:hover:text-white/80"
							}`}
						>
							<Icon className="size-3.5" name="moon" />
						</button>
						<button
							type="button"
							onClick={() => setTheme("system")}
							className={`flex items-center gap-1.5 rounded-full px-1.5 py-1.5 font-semibold text-[12px] transition-all duration-200 ${
								mounted && theme === "system"
									? "bg-white text-black shadow-sm"
									: "text-[#0a0d12]/40 hover:text-[#0a0d12]/80 dark:text-white/40 dark:hover:text-white/80"
							}`}
						>
							<Icon className="size-3.5" name="laptop" />
						</button>
					</div>
				</div>
				<div className="relative overflow-hidden pb-6 sm:pb-10">
					<span className="block w-full max-w-full font-black text-[#0a0d12] text-[clamp(3.5rem,calc((100vw-2rem)/3.6),13.75rem)] leading-[0.85] tracking-normal [-webkit-text-stroke:1px_#0a0d12] [text-shadow:3px_3px_0px_rgba(10,13,18,0.06),_0_0_20px_rgba(200,150,255,0.08)] dark:text-white sm:[-webkit-text-stroke:2px_#0a0d12] sm:[text-shadow:6px_6px_0px_rgba(10,13,18,0.06),_0_0_30px_rgba(200,150,255,0.1)] dark:[-webkit-text-stroke:1px_white] dark:[text-shadow:3px_3px_0px_rgba(255,255,255,0.12),_0_0_20px_rgba(200,150,255,0.15)] dark:sm:[-webkit-text-stroke:2px_white] dark:sm:[text-shadow:6px_6px_0px_rgba(255,255,255,0.12),_0_0_30px_rgba(200,150,255,0.2)]">
						Reloop
					</span>
				</div>
			</div>
		</footer>
	);
};
