"use client";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { cn } from "@reloop/ui/cn";

const integrations = [
	{
		name: "Slack",
		description: "Send notifications and alerts directly to your Slack channels.",
		icon: "github", // Placeholder icon
		connected: false,
	},
	{
		name: "Discord",
		description: "Integrate with Discord to keep your team updated on events.",
		icon: "github", // Placeholder icon
		connected: true,
	},
	{
		name: "Webhooks",
		description: "Configure custom webhooks to send data to any service.",
		icon: "webhook",
		connected: true,
	},
	{
		name: "GitHub",
		description: "Connect your repositories to automate workflows.",
		icon: "github",
		connected: false,
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

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					{integrations.map((integration) => (
						<div
							key={integration.name}
							className="group relative rounded-xl border border-stroke-soft-200 bg-white p-4 transition-all hover:border-stroke-strong-950/20 hover:shadow-sm"
						>
							<div className="flex items-start justify-between">
								<div className="flex h-10 w-10 items-center justify-center rounded-lg border border-stroke-soft-200 bg-neutral-alpha-5">
									<Icon name={integration.icon} className="h-5 w-5" />
								</div>
								<Button.Root
									variant={integration.connected ? "neutral" : "neutral"}
									mode={integration.connected ? "outline" : "filled"}
									size="xsmall"
								>
									{integration.connected ? "Configure" : "Connect"}
								</Button.Root>
							</div>
							<div className="mt-4">
								<p className="font-medium text-label-sm text-text-strong-950">
									{integration.name}
								</p>
								<p className="mt-1 text-paragraph-xs text-text-sub-600">
									{integration.description}
								</p>
							</div>
							{integration.connected && (
								<div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full bg-green-50 px-2 py-0.5">
									<div className="h-1.5 w-1.5 rounded-full bg-green-500" />
									<span className="font-medium text-[10px] text-green-700 uppercase tracking-wider">
										Connected
									</span>
								</div>
							)}
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default IntegrationsPage;
