"use client";

import * as Button from "@reloop/ui/button";
import type { SimpleIcon } from "simple-icons";
import * as Icons from "simple-icons";

interface Integration {
	name: string;
	description: string;
	logo_url: string;
	icon?: SimpleIcon;
}

const integrations: Integration[] = [
	{
		name: "Zapier",
		description:
			"No-code automation platform connecting your email infrastructure to 5,000+ apps instantly.",
		logo_url:
			"https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/zapier.svg",
		icon: Icons.siZapier,
	},

	{
		name: "n8n",
		description:
			"Open-source workflow automation tool popular with self-hosting teams for email pipeline automation.",
		logo_url:
			"https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/n8n.svg",
		icon: Icons.siN8n,
	},
	{
		name: "Shopify",
		description:
			"Leading e-commerce platform requiring transactional emails for orders, shipping, and receipts.",
		logo_url:
			"https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/shopify.svg",
		icon: Icons.siShopify,
	},
];

const IntegrationsPage = () => {
	return (
		<div className="w-full space-y-8 pt-5">
			<div>
				<div className="mb-6">
					<p className="font-medium text-label-md text-text-strong-950">
						Integrations
					</p>
					<p className="text-paragraph-sm text-text-sub-600">
						Connect your favorite tools and automate your workflows.
					</p>
				</div>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{integrations.map((integration) => (
						<div
							key={integration.name}
							className="group relative flex cursor-pointer flex-col rounded-xl border border-stroke-soft-200 bg-white p-4 transition-all"
						>
							<div className="flex items-start justify-between">
								<div className="flex h-10 w-10 items-center justify-center rounded-lg border border-stroke-soft-200 bg-neutral-alpha-5 p-2">
									{integration.icon ? (
										<svg
											role="img"
											viewBox="0 0 24 24"
											className="h-full w-full"
											style={{ fill: `#${integration.icon.hex}` }}
										>
											<path d={integration.icon.path} />
										</svg>
									) : (
										<img
											src={integration.logo_url}
											alt={integration.name}
											className="h-full w-full object-contain"
										/>
									)}
								</div>
								<div className="rounded-full bg-warning-lighter px-2 py-0.5 font-medium text-warning-base text-xs">
									Coming Soon
								</div>
							</div>
							<div className="mt-4 flex-1">
								<p className="font-medium text-label-sm text-text-strong-950">
									{integration.name}
								</p>
								<p className="mt-1 text-paragraph-xs text-text-sub-600">
									{integration.description}
								</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default IntegrationsPage;
