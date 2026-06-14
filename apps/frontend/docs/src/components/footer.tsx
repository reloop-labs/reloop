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

export function Footer() {
	return (
		<footer>
			{/* Top: link columns */}
			<div className="pt-5 pb-12">
				<div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
					{links.map((group) => (
						<div key={group.group}>
							<h4 className="font-semibold text-sm uppercase">{group.group}</h4>
							<ul className="mt-4 flex flex-col gap-3.5">
								{group.items.map((link) => (
									<li key={link.title}>
										<Link
											href={link.href}
											{...(link.href.startsWith("http")
												? { target: "_blank", rel: "noreferrer" }
												: {})}
											className="font-medium text-[#0a0d12]/65 text-[15px] hover:text-[#0a0d12] dark:text-white/60 dark:hover:text-white"
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
