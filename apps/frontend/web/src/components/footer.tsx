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
	const currentYear = new Date().getFullYear();

	return (
		<footer>
			<div className="border-stroke-soft-100 border-b">
				<div className="mx-auto max-w-7xl border-stroke-soft-100 border-r border-l">
					<div className="flex items-center justify-between border-stroke-soft-100 border-b px-10 py-4">
						<span className="text-sm text-text-sub-600">[04] Footer</span>
						<span className="text-sm text-text-sub-600">
							/ Socials + Resources
						</span>
					</div>
					<div className="grid grid-cols-1 gap-0 md:grid-cols-2">
						<div className="border-stroke-soft-100 px-6 py-12 md:border-r">
							<div className="flex items-center gap-3">
								<Logo className="h-20 w-20 rounded-full" />
								<span className="-ml-4 font-semibold text-text-strong-950 text-xl">
									Reloop
								</span>
							</div>
							<p className="max-w-xs pl-5 font-medium text-text-sub-600">
								The easiest way to manage transaction and marketing emails at
								scale
							</p>
						</div>

						<div>
							<div className="border-stroke-soft-100 border-b p-8">
								<p className="mb-4 text-sm text-text-sub-600">Not Backed by</p>
								<div className="flex items-center gap-3">
									<div className="flex h-10 w-10 items-center justify-center rounded bg-orange-500">
										<span className="font-bold text-lg text-white">Y</span>
									</div>
									<span className="font-semibold text-base text-text-strong-950">
										Y Combinator
									</span>
								</div>
							</div>
							<div className="grid grid-cols-2">
								<Link
									href="https://linkedin.com/company/reloophq"
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center gap-3 border-stroke-soft-100 border-r border-b p-4 text-sm text-text-sub-600 transition-colors hover:text-text-strong-950"
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
									<span>Linkedin</span>
								</Link>
								<Link
									href="https://x.com/reloophq"
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center gap-3 border-stroke-soft-100 border-r border-b p-4 text-sm text-text-sub-600 transition-colors hover:text-text-strong-950"
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
									<span>X (Twitter)</span>
								</Link>
								<Link
									href="https://github.com/reloop-labs/reloop"
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center gap-3 border-stroke-soft-100 border-r p-4 text-sm text-text-sub-600 transition-colors hover:text-text-strong-950"
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
									<span>Github</span>
								</Link>
								<Link
									href="https://discord.gg/reloop"
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center gap-3 border-stroke-soft-100 border-r p-4 text-sm text-text-sub-600 transition-colors hover:text-text-strong-950"
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
											d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"
										/>
									</svg>
									<span>Discord</span>
								</Link>
							</div>
						</div>
					</div>
				</div>
				<div className="mx-auto h-16 max-w-7xl border border-stroke-soft-100" />
				<div className="mx-auto max-w-7xl border-stroke-soft-100 border-r border-l">
					<div className="grid grid-cols-1 gap-0 border-stroke-soft-100 sm:grid-cols-2 md:grid-cols-4">
						{links.map((link, index) => (
							<div
								key={index}
								className={`border-stroke-soft-100 ${
									index < links.length - 1 ? "border-r" : ""
								}`}
							>
								<div className="space-y-0">
									<span className="block border-stroke-soft-100 border-b px-6 py-6 font-medium text-sm text-text-strong-950">
										{link.group}
									</span>
									<div className="space-y-0">
										{link.items.map((item, itemIndex) => (
											<div
												key={itemIndex}
												className={`border-stroke-soft-100 px-6 ${
													itemIndex < link.items.length - 1 ? "border-b" : ""
												}`}
											>
												<Link
													href={item.href}
													className="block py-3 text-[13px] text-text-sub-600 transition-colors duration-150 hover:text-text-strong-950"
												>
													{item.title}
												</Link>
											</div>
										))}
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Lower Footer Section - Copyright, Status, Legal */}
				<div className="mx-auto max-w-7xl border-stroke-soft-100 border-t border-r border-b border-l">
					<div className="flex flex-col items-start justify-between gap-4 px-6 py-6 sm:flex-row sm:items-center">
						<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
							<span className="text-sm text-text-sub-600">
								© {currentYear} Reloop
							</span>
							<div className="flex items-center gap-2">
								<div className="size-2 rounded-full bg-blue-500" />
								<span className="text-sm text-text-sub-600">
									All systems normal
								</span>
							</div>
						</div>
					</div>
				</div>
				<div className="mx-auto h-16 max-w-7xl border-stroke-soft-100 border-r border-l" />
			</div>
		</footer>
	);
};
