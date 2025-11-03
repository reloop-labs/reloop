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

export const Footer = () => {
	return (
		<footer className="border-stroke-soft-100 border-t border-r">
			<div className="mx-auto max-w-7xl border-stroke-soft-100 border-r border-b border-l">
				<div className="grid gap-12 px-6 py-10 md:grid-cols-5">
					<div className="md:col-span-2">
						<div>
							<Link href="/" aria-label="go home" className="block size-fit">
								<Logo className="-ml-2 -mt-2 h-10 w-10" />
							</Link>
							<p className="mt-2 max-w-sm text-sm text-text-sub-600">
								An open-source & self-hostable SendGrid / Mailchimp / Resend /
								Loops alternative.
							</p>
							<div className="order-first mt-4 flex flex-wrap gap-4 text-sm md:order-last">
								<Link
									href="https://x.com/reloophq"
									target="_blank"
									rel="noopener noreferrer"
									aria-label="X/Twitter"
									className="block text-text-sub-600 transition-colors hover:text-text-strong-950"
								>
									<svg
										className="size-5"
										xmlns="http://www.w3.org/2000/svg"
										width="1em"
										height="1em"
										viewBox="0 0 24 24"
									>
										<path
											fill="currentColor"
											d="M10.488 14.651L15.25 21h7l-7.858-10.478L20.93 3h-2.65l-5.117 5.886L8.75 3h-7l7.51 10.015L2.32 21h2.65zM16.25 19L5.75 5h2l10.5 14z"
										/>
									</svg>
								</Link>
								<Link
									href="https://linkedin.com/company/reloophq"
									target="_blank"
									rel="noopener noreferrer"
									aria-label="LinkedIn"
									className="block text-text-sub-600 transition-colors hover:text-text-strong-950"
								>
									<svg
										className="size-5"
										xmlns="http://www.w3.org/2000/svg"
										width="1em"
										height="1em"
										viewBox="0 0 24 24"
									>
										<path
											fill="currentColor"
											d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93zM6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37z"
										/>
									</svg>
								</Link>
								<Link
									href="https://github.com/reloop-labs/reloop"
									target="_blank"
									rel="noopener noreferrer"
									aria-label="GitHub"
									className="block text-text-sub-600 transition-colors hover:text-text-strong-950"
								>
									<svg
										className="size-5"
										xmlns="http://www.w3.org/2000/svg"
										width="1em"
										height="1em"
										viewBox="0 0 24 24"
									>
										<path
											fill="currentColor"
											d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482c0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10"
										/>
									</svg>
								</Link>
							</div>
						</div>
					</div>
					<div className="grid grid-cols-2 gap-6 sm:grid-cols-4 md:col-span-3">
						{links.map((link, index) => (
							<div key={index} className="space-y-4 text-sm">
								<span className="block font-medium text-text-strong-950">
									{link.group}
								</span>
								{link.items.map((item, itemIndex) => (
									<Link
										key={itemIndex}
										href={item.href}
										className="block text-text-sub-600 transition-colors duration-150 hover:text-text-strong-950"
									>
										<span>{item.title}</span>
									</Link>
								))}
							</div>
						))}
					</div>
				</div>
				<div className="border-stroke-soft-100 border-t py-7" />
			</div>
			<div className="mx-auto max-w-7xl border-stroke-soft-100 border-r border-l py-10" />
		</footer>
	);
};
