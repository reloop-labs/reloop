"use client";

import { ApiKeyDisplay } from "@fe/dashboard/components/api-key-display";
import { FeatureCard } from "@fe/dashboard/components/feature-card";
import { ScrapedPagesChart } from "@fe/dashboard/components/scraped-pages-chart";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";

const features = [
	{
		title: "API Key",
		description: "Generate and manage your API keys for seamless integration.",
		href: "api-keys",
	},
	{
		title: "Domain",
		description: "Add and configure your domains to start collecting data.",
		href: "domain",
		badge: "NEW",
	},
	{
		title: "Audience",
		description: "Build and segment your audience for targeted campaigns.",
		href: "audience",
	},
	{
		title: "Settings",
		description: "Configure your organization preferences and notifications.",
		href: "settings",
	},
];

export default function Home() {
	const { user, activeOrganization } = useUserOrganization();

	return (
		<div className="flex-1 overflow-y-auto p-8">
			{/* Welcome Header */}
			<div className="mb-8">
				<h1 className="font-semibold text-2xl text-text-strong-950">
					Welcome {user.name}!
				</h1>
				<p className="mt-1 text-text-sub-600">
					Manage your organization and track performance with our comprehensive
					dashboard
				</p>
			</div>

			{/* Feature Cards Grid */}
			<div className="mb-8 flex flex-col overflow-hidden rounded-lg border border-stroke-soft-200 bg-bg-white-0 md:flex-row md:items-stretch">
				{features.map((feature, index) => (
					<FeatureCard
						key={feature.title}
						title={feature.title}
						description={feature.description}
						href={`/${activeOrganization.slug}/${feature.href}`}
						badge={feature.badge}
						isLast={index === features.length - 1}
					/>
				))}
			</div>

			{/* Chart and API Key Section */}
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				<ScrapedPagesChart />
				<ApiKeyDisplay />
			</div>
		</div>
	);
}
