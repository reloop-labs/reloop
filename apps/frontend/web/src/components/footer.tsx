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
			{ title: "SDKs", href: "/docs/resources/sdks" },
			{ title: "API Reference", href: "/docs/api" },
			{ title: "Getting Started", href: "/docs" },
			{ title: "Languages", href: "/languages" },
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
		<footer className="w-full border-stroke-soft-200 border-t bg-bg-white-0 text-text-strong-950 dark:border-white/10 dark:bg-black dark:text-white">
			<div className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
				<div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-20">
					<div className="flex shrink-0 flex-col lg:w-48">
						<Link href="/" className="shrink-0" aria-label="Reloop home">
							<Logo className="-mt-2 size-12 text-text-strong-950 dark:text-white" />
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

				<div className="mt-16 flex flex-col gap-6 border-stroke-soft-200 border-t pt-8 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
					{/* Left: Theme Switcher Icons & Status Badge */}
					<div className="flex flex-wrap items-center gap-4">
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

						<Link
							href={statusUrl}
							target="_blank"
							rel="noreferrer"
							className="inline-flex items-center gap-2 transition-opacity hover:opacity-80"
						>
							<span className="size-2 shrink-0 rounded-full bg-[#0070F3]" />
							<span className="font-mono text-[#0070F3] text-[11px] uppercase tracking-wide">
								All systems normal.
							</span>
						</Link>
					</div>

					{/* Right: Social Media Icons */}
					<div className="flex items-center gap-5 text-text-sub-600 dark:text-white/60">
						<a
							href="https://github.com/reloop-labs/reloop"
							target="_blank"
							rel="noreferrer"
							className="transition-colors hover:text-text-strong-950 dark:hover:text-white"
							aria-label="GitHub"
						>
							<svg
								className="size-4"
								fill="currentColor"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<path
									fillRule="evenodd"
									clipRule="evenodd"
									d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
								/>
							</svg>
						</a>
						<a
							href="https://x.com/reloophq"
							target="_blank"
							rel="noreferrer"
							className="transition-colors hover:text-text-strong-950 dark:hover:text-white"
							aria-label="X"
						>
							<svg
								className="size-4"
								fill="currentColor"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
							</svg>
						</a>
						<a
							href="https://linkedin.com/company/reloop"
							target="_blank"
							rel="noreferrer"
							className="transition-colors hover:text-text-strong-950 dark:hover:text-white"
							aria-label="LinkedIn"
						>
							<svg
								className="size-4"
								fill="currentColor"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<path
									fillRule="evenodd"
									clipRule="evenodd"
									d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.78a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24z"
								/>
							</svg>
						</a>
					</div>
				</div>
			</div>
		</footer>
	);
};
