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
	// --- Row 1: Product & developer ---
	{
		group: "Product",
		items: [
			{ title: "Transaction Emails", href: "/features/transaction-emails" },
			{ title: "SMTP Relay", href: "/features/smtp" },
			{ title: "Email Analytics", href: "/features/email-analytics" },
			{ title: "Email Validation", href: "/features/email-validation" },
			{ title: "Email Templates", href: "/features/email-templates" },
			{ title: "AI Agents", href: "/features/ai-agents" },
			{ title: "Webhooks", href: "/features/webhooks" },
			{ title: "Deliverability", href: "/features/deliverability" },
			{ title: "Domains", href: "/domain" },
		],
	},
	{
		group: "Developers",
		items: [
			{ title: "SDKs", href: "/sdk" },
			{ title: "Frameworks", href: "/frameworks" },
			{ title: "Documentation", href: "/docs" },
			{ title: "API Reference", href: "/docs/api" },
			{ title: "Webhooks", href: "/docs/webhooks" },
			{ title: "Self-host", href: "/self-host" },
			{ title: "SMTP", href: "/docs/examples/smtp/introduction" },
			{ title: "Integrations", href: "/docs/integrations" },
		],
	},
	{
		group: "Tools",
		items: [
			{ title: "Free Tools", href: "/tools" },
			{ title: "Email Validator", href: "/tools/email-validator" },
			{ title: "Subject Tester", href: "/tools/subject-tester" },
			{ title: "Template Generator", href: "/tools/template-generator" },
			{
				title: "Deliverability Tester",
				href: "/tools/deliverability-tester",
			},
			{ title: "Auth Checker", href: "/tools/auth-checker" },
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
	// --- Row 2: Agents & company ---
	{
		group: "Agents",
		items: [
			{ title: "sitemap.md", href: "/sitemap.md" },
			{ title: "llms.txt", href: "/llms.txt" },
			{ title: "skills.md", href: "/skill.md" },
			{ title: "rss.xml", href: "/blog/feed.xml" },
		],
	},
	{
		group: "Learn",
		items: [
			{ title: "Blog", href: "/blog" },
			{ title: "Changelog", href: "/changelog" },
			{ title: "Product Beliefs", href: "/our-product-beliefs" },
			{ title: "Engineering", href: "/docs/setup" },
			{ title: "Why Open Source", href: "/why-open-source" },
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
];

function FooterLinkItem({ link }: { link: FooterLink }) {
	const isCrossDomain =
		link.href.startsWith("/docs") || link.href.startsWith("/dashboard");

	const className =
		"text-[12px] font-medium text-text-sub-600 transition-colors hover:text-text-strong-950 sm:text-[14px] dark:text-white/55 dark:hover:text-white";

	if (isCrossDomain) {
		return (
			<li>
				<a
					href={link.href}
					{...(link.external ? { target: "_blank", rel: "noreferrer" } : {})}
					className={className}
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
				className={className}
			>
				{link.title}
			</Link>
		</li>
	);
}

export const Footer = () => {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	return (
		<footer className="w-full border-stroke-soft-200 border-t border-b bg-bg-white-0 text-text-strong-950 dark:border-white/10 dark:bg-black dark:text-white">
			<div className="mx-auto w-full max-w-5xl border-stroke-soft-200 md:max-w-7xl xl:border-x dark:border-white/10">
				<div className="px-6 py-10 sm:px-10 sm:py-16 lg:px-12 lg:py-20">
					<div className="flex h-full flex-col gap-8 sm:gap-12 lg:flex-row lg:items-stretch lg:gap-20">
						<div className="flex shrink-0 lg:w-48">
							<div className="-ml-2 -mt-2 flex shrink-0 flex-col">
								<Link
									href="/"
									className="inline-flex shrink-0 items-center gap-2 sm:gap-2.5"
									aria-label="Reloop home"
								>
									<Logo className="size-9 text-text-strong-950 sm:size-11 dark:text-white" />
									<span className="-ml-1.5 sm:-ml-3 font-semibold text-[15px] text-text-strong-950 tracking-tight sm:text-[17px] dark:text-white">
										Reloop
									</span>
								</Link>
							</div>
						</div>

						<div className="min-w-0 flex-1">
							{/* Single continuous grid — reflows cleanly at 2/3/4 cols (no orphan row) */}
							<div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-4 lg:gap-x-8">
								{columns.map((column) => (
									<div key={column.group}>
										<h4 className="font-medium text-[13px] text-text-strong-950 sm:text-[14px] dark:text-white">
											{column.group}
										</h4>
										<ul className="mt-2.5 flex flex-col gap-2 sm:mt-4 sm:gap-2.5">
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
				<div className="mx-auto flex w-full max-w-5xl flex-row items-stretch justify-between border-stroke-soft-200 md:max-w-7xl xl:border-x dark:border-white/10">
					{/* Left: Theme Switcher Icons */}
					<div className="flex items-center px-6 py-3 sm:px-10 lg:px-12">
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
							className="flex w-12 items-center justify-center border-stroke-soft-200 border-l transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 sm:w-14 dark:border-white/10 dark:hover:bg-white/[0.04] dark:hover:text-white"
							aria-label="GitHub"
						>
							<Icon name="github" className="size-4" />
						</a>
						<a
							href="https://x.com/reloop_labs"
							target="_blank"
							rel="noreferrer"
							className="flex w-12 items-center justify-center border-stroke-soft-200 border-l transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 sm:w-14 dark:border-white/10 dark:hover:bg-white/[0.04] dark:hover:text-white"
							aria-label="X"
						>
							<Icon name="twitter" className="size-4" />
						</a>
						<a
							href="https://www.linkedin.com/company/reloop-labs"
							target="_blank"
							rel="noreferrer"
							className="flex w-12 items-center justify-center border-stroke-soft-200 border-l transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 sm:w-14 dark:border-white/10 dark:hover:bg-white/[0.04] dark:hover:text-white"
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
