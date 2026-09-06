"use client";

import { cn } from "@reloop/ui/cn";
import { FooterBrand } from "@reloop/web/components/footer-brand";
import { FooterPixelStrip } from "@reloop/web/components/footer-pixel-strip";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
		group: "Features",
		items: [
			{ title: "Transaction Emails", href: "/features/transaction-emails" },
			{ title: "SMTP Relay", href: "/features/smtp" },
			{ title: "Email Analytics", href: "/features/email-analytics" },
			{ title: "Email Validation", href: "/features/email-validation" },
			{ title: "Email Templates", href: "/features/email-templates" },
			{ title: "AI Agents", href: "/features/ai-agents" },
			{ title: "Webhooks", href: "/features/webhooks" },
			{ title: "Deliverability", href: "/features/deliverability" },
			{ title: "Engine", href: "/engine" },
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
			{ title: "Spoof Checker", href: "/tools/spoof-checker" },
			{ title: "Who Sends", href: "/tools/who-sends" },
			{
				title: "Deliverability Tester",
				href: "/tools/deliverability-tester",
			},
			{ title: "Auth Checker", href: "/tools/auth-checker" },
			{ title: "BIMI Checker", href: "/tools/bimi-checker" },
			{ title: "Email HTML Editor", href: "/tools/email-html-editor" },
		],
	},
	{
		group: "Resources",
		items: [
			{ title: "Blog", href: "/blog" },
			{ title: "Changelog", href: "/changelog" },
			{ title: "Product Beliefs", href: "/our-product-beliefs" },
			{ title: "Engineering", href: "/docs/setup" },
			{ title: "Why Open Source", href: "/why-open-source" },
			{ title: "vs Resend", href: "/compare/resend" },
			{ title: "vs SendGrid", href: "/compare/sendgrid" },
			{ title: "vs Mailgun", href: "/compare/mailgun" },
			{ title: "vs AWS SES", href: "/compare/aws-ses" },
			{ title: "vs Postmark", href: "/compare/postmark" },
			{ title: "All comparisons", href: "/compare" },
			{ title: "sitemap.md", href: "/sitemap.md" },
			{ title: "llms.txt", href: "/llms.txt" },
			{ title: "skills.md", href: "/skill.md" },
			{ title: "rss.xml", href: "/blog/feed.xml" },
		],
	},
	{
		group: "Company",
		items: [
			{ title: "About", href: "/about" },
			{ title: "Contact", href: "/contact" },
			{ title: "Pricing", href: "/pricing" },
			{ title: "Careers", href: "/careers" },
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

function FooterLinkItem({
	link,
	isLast,
}: {
	link: FooterLink;
	isLast: boolean;
}) {
	const isCrossDomain =
		link.href.startsWith("/docs") || link.href.startsWith("/dashboard");

	const className = cn(
		"flex min-h-[52px] items-center font-normal text-[14px] text-text-sub-600 transition-colors hover:text-text-strong-950 dark:text-white/55 dark:hover:text-white",
		!isLast && "border-stroke-soft-100 border-b dark:border-white/10",
	);

	if (isCrossDomain || link.external) {
		return (
			<li className="px-5 sm:px-6">
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
		<li className="px-5 sm:px-6">
			<Link href={link.href} className={className}>
				{link.title}
			</Link>
		</li>
	);
}

export const Footer = () => {
	const pathname = usePathname();
	if (pathname === "/twitter" || pathname?.startsWith("/twitter/")) {
		return null;
	}

	return (
		<footer className="w-full bg-bg-white-0 text-text-strong-950 dark:bg-black dark:text-white">
			<div className="mx-auto w-full max-w-5xl border-stroke-soft-100 md:max-w-7xl xl:border-x dark:border-white/10">
				<div aria-hidden className="h-24" />
				<FooterBrand />
				<div aria-hidden className="h-24" />
				<div className="grid grid-cols-2 border-stroke-soft-100 border-t border-b lg:grid-cols-5 dark:border-white/10">
					{columns.map((column, index) => (
						<nav
							key={column.group}
							aria-labelledby={`footer-heading-${column.group}`}
							className={cn(
								"border-stroke-soft-100 dark:border-white/10",
								"border-b lg:border-b-0",
								index % 2 === 0 && "max-lg:border-r",
								index !== 0 && "lg:border-l",
							)}
						>
							<h2
								id={`footer-heading-${column.group}`}
								className="border-stroke-soft-100 border-b px-5 py-4 font-medium text-[12px] text-text-strong-950 uppercase tracking-[0.04em] sm:px-6 sm:py-5 dark:border-white/10 dark:text-white"
							>
								{column.group}
							</h2>
							<ul>
								{column.items.map((link, linkIndex) => (
									<FooterLinkItem
										key={link.title}
										link={link}
										isLast={linkIndex === column.items.length - 1}
									/>
								))}
							</ul>
						</nav>
					))}
				</div>
				<div aria-hidden className="h-24" />
				<FooterPixelStrip />
			</div>
		</footer>
	);
};
