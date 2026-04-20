import { Icon } from "@reloop/ui/icon";
import { Logo } from "@reloop/ui/logo";
import Link from "next/link";

const links = [
	{
		group: "Product",
		items: [
			{
				title: "Campaigns",
				href: "/product/campaigns",
			},
			{
				title: "Email Analytics",
				href: "/product/email-analytics",
			},
			{
				title: "Transaction Emails",
				href: "/product/transaction-emails",
			},
			{
				title: "Email Validation",
				href: "/product/email-validation",
			},
			{
				title: "Email Templates",
				href: "/product/email-templates",
			},
			{
				title: "Deliverability",
				href: "/product/deliverability",
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
				href: "/resources/status",
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

export const Footer = () => {
	return (
		<footer className="bg-black text-white">
			<div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
				{/* Top: CTA + link columns */}
				<div className="flex flex-col gap-12 border-white/5 border-b py-16 sm:py-20 lg:flex-row lg:gap-20">
					{/* Left — branding / CTA */}
					<div className="lg:w-[340px] lg:shrink-0">
						<Link href="/" className="flex items-center">
							<Logo className="-ml-2 h-10 w-10 text-white" theme="dark" />
							<span className="font-semibold text-[18px] tracking-[0.04em]">
								Reloop
							</span>
						</Link>
						<p className="mt-2 max-w-[300px] font-medium text-sm text-white/50">
							Open, self-hosted email infrastructure for modern applications. No
							vendor lock-in. Just email that works.
						</p>
						<div className="mt-4 flex items-center gap-2">
							<Link
								href={twitterUrl}
								target="_blank"
								rel="noreferrer"
								className="text-white/40 transition-colors hover:text-white"
							>
								<Icon className="size-4.5" name="twitter" />
							</Link>
							<Link
								href={githubUrl}
								target="_blank"
								rel="noreferrer"
								className="text-white/40 transition-colors hover:text-white"
							>
								<Icon className="size-4.5" name="social-github" />
							</Link>
						</div>
						<div className="mt-6">
							<a
								href="/dashboard/login"
								className="inline-flex items-center justify-center rounded-[11px] bg-white px-5 py-2.5 font-semibold text-[#0a0d12] text-[13px] transition-colors hover:bg-white/88"
							>
								Get Started
							</a>
						</div>
					</div>
					<div className="grid flex-1 grid-cols-2 gap-8 sm:grid-cols-4">
						{links.map((group) => (
							<div key={group.group}>
								<h4 className="font-semibold text-sm text-white/40 uppercase">
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
												className="font-medium text-sm text-white/50 hover:text-white"
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
				<div className="flex items-center justify-between py-6">
					<p className="text-[13px] text-white/36">
						© {new Date().getFullYear()} Reloop. All rights reserved.
					</p>
				</div>
				<div className="relative overflow-hidden pb-10">
					<span className="whitespace-nowrap font-black text-[220px] text-white leading-none tracking-normal [-webkit-text-stroke:2px_white] [text-shadow:6px_6px_0px_rgba(255,255,255,0.12),_0_0_80px_rgba(200,150,255,0.3)]">
						Reloop
					</span>
				</div>
			</div>
		</footer>
	);
};
