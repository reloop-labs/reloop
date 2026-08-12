/** biome-ignore-all lint/a11y/useAnchorContent: <explanation> */
"use client";

import { Icon } from "@reloop/ui/icon";
import { Logo } from "@reloop/ui/logo";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

type FooterLink = {
	title: string;
	href: string;
	external?: boolean;
};

type FooterColumn = {
	group: string;
	items: FooterLink[];
};

const columns: FooterColumn[] = [
	// --- Row 1: Product & Developer ---
	{
		group: "Email",
		items: [
			{ title: "Transaction Emails", href: "/features/transaction-emails" },
			{ title: "SMTP Relay", href: "/features/smtp" },
			{ title: "Email Analytics", href: "/features/email-analytics" },
			{ title: "Email Validation", href: "/features/email-validation" },
			{ title: "Email Templates", href: "/features/email-templates" },
		],
	},
	{
		group: "Feather",
		items: [
			{ title: "AI Agents", href: "/features/ai-agents" },
			{ title: "Webhooks", href: "/features/webhooks" },
			{ title: "Deliverability", href: "/features/deliverability" },
		],
	},
	{
		group: "Developers",
		items: [
			{ title: "SDKs", href: "/languages" },
			{ title: "Frameworks", href: "/frameworks" },
			{ title: "API Reference", href: "/docs/api" },
			{ title: "Webhooks", href: "/docs/webhooks" },
		],
	},
	{
		group: "Docs",
		items: [
			{ title: "Documentation", href: "/docs" },
			{ title: "Self-host", href: "/docs/self-host" },
			{ title: "SMTP", href: "/docs/examples/smtp/introduction" },
		],
	},
	{
		group: "Compare",
		items: [
			{ title: "vs Resend", href: "/compare/resend" },
			{ title: "vs SendGrid", href: "/compare/sendgrid" },
			{ title: "vs Mailgun", href: "/compare/mailgun" },
			{ title: "vs AWS SES", href: "/compare/aws-ses" },
			{ title: "vs Postmark", href: "/compare/postmark" },
			{ title: "All comparisons", href: "/compare" },
		],
	},
	{
		group: "Agents",
		items: [
			{ title: "llms.txt", href: "/llms.txt" },
			{ title: "llms-docs.txt", href: "/llms-docs.txt" },
			{ title: "llms-full.txt", href: "/llms-full.txt" },
			{ title: "llms-full-docs.txt", href: "/llms-full-docs.txt" },
			{ title: "skill.md", href: "/skill.md" },
			{ title: "pricing.md", href: "/pricing.md" },
			{ title: "sitemap.md", href: "/sitemap.md" },
			{ title: "rss.xml", href: "/blog/feed.xml" },
		],
	},
	// --- Row 2: Company & Info ---
	{
		group: "Learn",
		items: [
			{ title: "Blog", href: "/blog" },
			{ title: "Changelog", href: "/changelog" },
			{ title: "Glossary", href: "/glossary" },
		],
	},
	{
		group: "Company",
		items: [
			{ title: "About", href: "/about" },
			{ title: "Contact", href: "/contact" },
			{ title: "Pricing", href: "/pricing" },
			{ title: "Careers", href: "/careers" },
		],
	},
	{
		group: "Open Source",
		items: [
			{ title: "Why Open Source", href: "/philosophy/why-open-source" },
			{ title: "Integrations", href: "/docs/integrations" },
			{ title: "Self-host", href: "/docs/self-host" },
		],
	},
	{
		group: "Philosophy",
		items: [
			{ title: "Why Reloop", href: "/philosophy/why-reloop" },
			{ title: "What We Stand For", href: "/philosophy/what-we-stand-for" },
			{ title: "Product Beliefs", href: "/philosophy/our-product-beliefs" },
			{ title: "Engineering", href: "/philosophy/engineering" },
		],
	},
	{
		group: "Legal & Trust",
		items: [
			{ title: "Privacy Policy", href: "/privacy" },
			{ title: "Terms of Service", href: "/terms-and-conditions" },
			{ title: "License", href: "/license" },
			{
				title: "Status",
				href: "https://status.reloop.sh/status/live",
				external: true,
			},
		],
	},
	{
		group: "Social",
		items: [
			{
				title: "GitHub",
				href: "https://github.com/reloop-labs/reloop",
				external: true,
			},
			{ title: "X", href: "https://x.com/reloophq", external: true },
			{
				title: "Discord",
				href: "https://discord.gg/bHnkBcp7xR",
				external: true,
			},
		],
	},
];

function FooterLinkItem({ link }: { link: FooterLink }) {
	const isCrossDomain =
		link.href.startsWith("/docs") || link.href.startsWith("/dashboard");

	if (isCrossDomain) {
		return (
			<li>
				<a
					href={link.href}
					{...(link.external ? { target: "_blank", rel: "noreferrer" } : {})}
					className="text-[14px] text-text-sub-600 transition-colors hover:text-text-strong-950 dark:text-white/55 dark:hover:text-white"
				>
					{link.title}
				</a>
			</li>
		);
	}

	return (
		<li>
			<Link
				href={link.href}
				{...(link.external ? { target: "_blank", rel: "noreferrer" } : {})}
				className="text-[14px] text-text-sub-600 transition-colors hover:text-text-strong-950 dark:text-white/55 dark:hover:text-white"
			>
				{link.title}
			</Link>
		</li>
	);
}

const statusUrl = "https://status.reloop.sh/status/live";

export const Footer = () => {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	return (
		<footer className="w-full border-stroke-soft-200 border-t border-b bg-bg-white-0 text-text-strong-950 dark:border-white/10 dark:bg-black dark:text-white">
			<div className="mx-auto w-full max-w-5xl border-stroke-soft-200 border-x md:max-w-7xl dark:border-white/10">
				<div className="px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
					<div className="flex h-full flex-col gap-12 lg:flex-row lg:items-stretch lg:gap-20">
						<div className="flex flex-col justify-between gap-8 lg:w-48 lg:self-stretch">
							<div className="flex shrink-0 flex-col">
								<Link
									href="/"
									className="-ml-[11px] inline-flex shrink-0 items-center gap-2.5"
									aria-label="Reloop home"
								>
									<Logo className="size-11 text-text-strong-950 dark:text-white" />
									<span className="-ml-3 font-semibold text-[17px] text-text-strong-950 tracking-tight dark:text-white">
										Reloop
									</span>
								</Link>
							</div>
							<Link
								href={statusUrl}
								target="_blank"
								rel="noreferrer"
								className="inline-flex items-center gap-2 transition-opacity hover:opacity-80"
							>
								<span className="size-2 shrink-0 rounded-full bg-[#0070F3]" />
								<span className="font-mono text-[#0070F3] text-[11px] uppercase tracking-wide">
									System Status
								</span>
							</Link>
						</div>

						<div className="flex min-w-0 flex-1 flex-col gap-10 lg:gap-12">
							{/* Row 1: Primary columns */}
							<div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-6 lg:gap-x-8">
								{columns.slice(0, 6).map((column) => (
									<div key={column.group}>
										<h4 className="font-medium text-[14px] text-text-strong-950 dark:text-white">
											{column.group}
										</h4>
										<ul className="mt-4 flex flex-col gap-2.5">
											{column.items.map((link) => (
												<FooterLinkItem key={link.title} link={link} />
											))}
										</ul>
									</div>
								))}
							</div>

							{/* Row 2: Secondary info columns */}
							<div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-6 lg:gap-x-8">
								{columns.slice(6).map((column) => (
									<div key={column.group}>
										<h4 className="font-medium text-[14px] text-text-strong-950 dark:text-white">
											{column.group}
										</h4>
										<ul className="mt-4 flex flex-col gap-2.5">
											{column.items.map((link) => (
												<FooterLinkItem key={link.title} link={link} />
											))}
										</ul>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Full-width Divider Line across the entire viewport */}
			<div className="w-full border-stroke-soft-200 border-t dark:border-white/10">
				<div className="mx-auto flex w-full max-w-5xl flex-col border-stroke-soft-200 border-x sm:flex-row sm:items-stretch sm:justify-between md:max-w-7xl dark:border-white/10">
					{/* Left: Theme Switcher Icons */}
					<div className="flex items-center px-4 py-3">
						<div className="inline-flex items-center rounded-full border border-stroke-soft-200 bg-bg-weak-50 p-0.5 dark:border-white/10 dark:bg-white/[0.04]">
							<button
								type="button"
								onClick={() => setTheme("system")}
								className={`flex items-center rounded-full px-1.5 py-1.5 font-semibold text-[12px] transition-all duration-200 ${
									mounted && theme === "system"
										? "bg-white text-black shadow-sm"
										: "text-text-sub-600 hover:text-text-strong-950 dark:text-white/55 dark:hover:text-white/80"
								}`}
								aria-label="System theme"
							>
								<Icon className="size-3.5" name="laptop" />
							</button>
							<button
								type="button"
								onClick={() => setTheme("light")}
								className={`flex items-center rounded-full px-1.5 py-1.5 font-semibold text-[12px] transition-all duration-200 ${
									mounted && theme === "light"
										? "bg-white text-black shadow-sm dark:bg-white dark:text-black"
										: "text-text-sub-600 hover:text-text-strong-950 dark:text-white/55 dark:hover:text-white/80"
								}`}
								aria-label="Light mode"
							>
								<Icon className="size-3.5" name="sun" />
							</button>
							<button
								type="button"
								onClick={() => setTheme("dark")}
								className={`flex items-center rounded-full px-1.5 py-1.5 font-semibold text-[12px] transition-all duration-200 ${
									mounted && theme === "dark"
										? "bg-white text-black shadow-sm"
										: "text-text-sub-600 hover:text-text-strong-950 dark:text-white/55 dark:hover:text-white/80"
								}`}
								aria-label="Dark mode"
							>
								<Icon className="size-3.5" name="moon" />
							</button>
						</div>
					</div>

					{/* Right: Social Media Icons with Box Dividers */}
					<div className="flex items-stretch text-text-sub-600 dark:text-white/60">
						<a
							href="https://github.com/reloop-labs/reloop"
							target="_blank"
							rel="noreferrer"
							className="flex h-14 w-14 items-center justify-center border-stroke-soft-200 border-t transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 sm:border-t-0 sm:border-l dark:border-white/10 dark:hover:bg-white/[0.04] dark:hover:text-white"
							aria-label="GitHub"
						>
							<Icon name="github" className="size-4" />
						</a>
						<a
							href="https://x.com/reloophq"
							target="_blank"
							rel="noreferrer"
							className="flex h-14 w-14 items-center justify-center border-stroke-soft-200 border-l transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:border-white/10 dark:hover:bg-white/[0.04] dark:hover:text-white"
							aria-label="X"
						>
							<Icon name="twitter" className="size-4" />
						</a>
						<a
							href="https://linkedin.com/company/reloop"
							target="_blank"
							rel="noreferrer"
							className="flex h-14 w-14 items-center justify-center border-stroke-soft-200 border-l transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:border-white/10 dark:hover:bg-white/[0.04] dark:hover:text-white"
							aria-label="LinkedIn"
						>
							<Icon name="linkedin" className="size-4" />
						</a>
					</div>
				</div>
			</div>
		</footer>
	);
};
