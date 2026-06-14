import { Icon } from "@reloop/ui/icon";
import { Logo } from "@reloop/ui/logo";
import Link from "next/link";

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
				title: "Terms & Conditions",
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

export function Footer() {
	return (
		<footer className="border-stroke-soft-100/60 border-t pt-10 pb-8 dark:border-white/5">
			<div className="flex flex-col gap-10">
				{/* Top Area: Logo, tagline, and socials */}
				<div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
					<div className="space-y-2.5">
						<Link href="/" className="flex items-center gap-1.5">
							<Logo className="-ml-1 h-7 w-7 text-[#0a0d12] dark:text-white" />
							<span className="font-semibold text-[#0a0d12] text-[17px] tracking-tight dark:text-white">
								Reloop
							</span>
						</Link>
						<p className="max-w-[420px] font-medium text-[#0a0d12]/65 text-[14px] leading-relaxed dark:text-white/60">
							Open-source email infrastructure for modern applications. Use
							Reloop hosted or self-host—no vendor lock-in.
						</p>
					</div>

					<div className="flex items-center gap-2 pt-1">
						<Link
							href={twitterUrl}
							target="_blank"
							rel="noreferrer"
							className="flex h-8 w-8 items-center justify-center rounded-lg border border-stroke-soft-100/60 text-[#0a0d12]/40 transition-colors hover:bg-bg-weak-50/50 hover:text-[#0a0d12] dark:border-white/5 dark:text-white/40 dark:hover:bg-white/[0.02] dark:hover:text-white"
						>
							<Icon className="size-4" name="twitter" />
						</Link>
						<Link
							href={githubUrl}
							target="_blank"
							rel="noreferrer"
							className="flex h-8 w-8 items-center justify-center rounded-lg border border-stroke-soft-100/60 text-[#0a0d12]/40 transition-colors hover:bg-bg-weak-50/50 hover:text-[#0a0d12] dark:border-white/5 dark:text-white/40 dark:hover:bg-white/[0.02] dark:hover:text-white"
						>
							<Icon className="size-4" name="social-github" />
						</Link>
					</div>
				</div>

				{/* Divider */}
				<div className="h-px w-full bg-stroke-soft-100/60 dark:bg-white/5" />

				{/* Middle Area: 4-Column Links Grid */}
				<div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
					{links.map((group) => (
						<div key={group.group} className="space-y-3.5">
							<h4 className="font-semibold text-[12px] uppercase tracking-wider">
								{group.group}
							</h4>
							<ul className="space-y-2.5">
								{group.items.map((link) => (
									<li key={link.title}>
										<Link
											href={link.href}
											{...(link.href.startsWith("http")
												? { target: "_blank", rel: "noreferrer" }
												: {})}
											className="font-medium text-[#0a0d12]/70 text-[13.5px] transition-colors hover:text-[#0a0d12] dark:text-white/60 dark:hover:text-white"
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
		</footer>
	);
}
