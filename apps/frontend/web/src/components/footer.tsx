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
	{
		group: "Email",
		items: [
			{ title: "Campaigns", href: "/features/campaigns" },
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
			{ title: "Marketing Teams", href: "/features/marketing-teams" },
			{ title: "Developers", href: "/features/developers" },
			{ title: "Integrations", href: "/features/integration" },
		],
	},
	{
		group: "Developers",
		items: [
			{ title: "SDKs", href: "/docs/resources/sdks" },
			{ title: "API Reference", href: "/docs/api" },
			{ title: "Getting Started", href: "/docs" },
			{ title: "Campaign Builder", href: "/docs/features/templates" },
			{ title: "Languages", href: "/features/languages" },
			{ title: "Webhooks", href: "/docs/webhooks" },
		],
	},
	{
		group: "Docs",
		items: [
			{ title: "Documentation", href: "/docs" },
			{ title: "Self-host", href: "/docs/self-host" },
			{ title: "Integration", href: "/docs/integrations" },
			{ title: "SMTP", href: "/docs/examples/smtp/introduction" },
			{ title: "API", href: "/docs/api" },
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
		group: "Tools",
		items: [
			{ title: "Free tools", href: "/resources/tools" },
			{ title: "Email validator", href: "/tools/email-validator" },
			{ title: "Subject tester", href: "/tools/subject-tester" },
			{ title: "Template generator", href: "/tools/template-generator" },
			{ title: "Deliverability tester", href: "/tools/deliverability-tester" },
		],
	},
	{
		group: "Learn",
		items: [
			{ title: "Blog", href: "/blog" },
			{ title: "Changelog", href: "/changelog" },
			{ title: "Glossary", href: "/resources/glossary" },
			{ title: "Sitemap", href: "/glossary" },
			{ title: "Community", href: "/resources/community" },
			{
				title: "Status",
				href: "https://status.reloop.sh/status/live",
				external: true,
			},
		],
	},
	{
		group: "Company",
		items: [
			{ title: "About", href: "/about" },
			{ title: "Contact", href: "/contact" },
			{ title: "Pricing", href: "/pricing" },
			{ title: "Compare", href: "/compare" },
			{ title: "Get started", href: "/dashboard/signup" },
		],
	},
	{
		group: "Open Source",
		items: [
			{ title: "Why Open Source", href: "/philosophy/why-open-source" },
			{ title: "Self-host", href: "/docs/self-host" },
			{ title: "License", href: "/license" },
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
		<footer className="border-stroke-soft-200 bg-bg-white-0 text-text-strong-950 dark:bg-black dark:text-white">
			<div className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
				<div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-20">
					<div className="flex shrink-0 flex-col lg:w-48">
						<Link href="/" className="shrink-0" aria-label="Reloop home">
							<Logo className="-mt-2 size-12 text-text-strong-950 dark:text-white" />
						</Link>
					</div>

					<div className="min-w-0 flex-1">
						<div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-6 lg:gap-x-8 lg:gap-y-12">
							{columns.map((column) => (
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

				<div className="mt-12 flex items-center justify-between">
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
			</div>
		</footer>
	);
};
