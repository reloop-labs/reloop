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

export function Footer() {
	return (
		<footer className="pt-10 pb-8">
			<div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-6 lg:gap-x-8 lg:gap-y-12">
				{columns.map((column) => (
					<div key={column.group}>
						<h4 className="font-medium text-[#0a0d12] text-[14px] dark:text-white">
							{column.group}
						</h4>
						<ul className="mt-4 flex flex-col gap-2.5">
							{column.items.map((link) => (
								<li key={link.title}>
									<a
										href={link.href}
										{...(link.external
											? { target: "_blank", rel: "noreferrer" }
											: {})}
										className="text-[#0a0d12]/70 text-[14px] transition-colors hover:text-[#0a0d12] dark:text-white/55 dark:hover:text-white"
									>
										{link.title}
									</a>
								</li>
							))}
						</ul>
					</div>
				))}
			</div>
		</footer>
	);
}
