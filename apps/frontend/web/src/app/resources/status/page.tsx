import {
	ContentCard,
	FeatureCta,
	MarketingPageShell,
	metricsGridClass,
	PageSection,
	SectionHeading,
} from "@reloop/web/components/page-shell";
import { getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";

const pageUrl = `${getSiteUrl()}/resources/status`;

export const metadata: Metadata = {
	title: "System Status | Reloop",
	description:
		"Real-time system status and uptime for Reloop email infrastructure. Service health, incident history, and performance metrics.",
	keywords: [
		"Reloop status",
		"email service status",
		"system uptime",
		"email infrastructure status",
		"service health",
	],
	alternates: { canonical: pageUrl },
	openGraph: {
		title: "System Status | Reloop",
		description: "Real-time system status and uptime for Reloop email infrastructure.",
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "System Status | Reloop",
		description: "Real-time system status and uptime for Reloop email infrastructure.",
	},
};

const services = [
	{ name: "API Services", status: "Operational", uptime: "100%" },
	{ name: "Email Delivery", status: "Operational", uptime: "99.99%" },
	{ name: "SMTP Relay", status: "Operational", uptime: "99.99%" },
	{ name: "Webhooks", status: "Operational", uptime: "100%" },
];

const StatusPage = () => {
	return (
		<MarketingPageShell
			titleLines={["System Status"]}
			description="Real-time monitoring of our email infrastructure. Check service health, uptime, and incident history."
			primaryCta={{ label: "Get started", href: "/dashboard/signup" }}
			secondaryCta={{ label: "Documentation", href: "/docs" }}
		>
			<PageSection>
				<SectionHeading
					title="All systems operational"
					description="We target 99.99% uptime with real-time monitoring and incident response."
				/>
				<div className={metricsGridClass}>
					{services.map((service) => (
						<ContentCard key={service.name} className="text-center">
							<div className="mb-2 inline-flex size-2.5 rounded-full bg-primary-base" />
							<h3 className="mb-2 font-semibold text-text-strong-950 dark:text-white">
								{service.name}
							</h3>
							<div className="mb-1 font-bold text-2xl text-primary-base">
								{service.uptime}
							</div>
							<p className="text-sm text-text-sub-600 dark:text-white/50">
								{service.status}
							</p>
						</ContentCard>
					))}
				</div>
			</PageSection>

			<PageSection alt narrow>
				<SectionHeading
					title="Uptime commitment"
					description="Production SLAs backed by edge routing and automated failover."
				/>
				<div className="grid gap-6 sm:grid-cols-3">
					{[
						{ value: "99.99%", label: "Uptime SLA" },
						{ value: "<15ms", label: "API latency" },
						{ value: "24/7", label: "Monitoring" },
					].map((stat) => (
						<div key={stat.label} className="text-center">
							<div className="font-bold text-3xl text-primary-base">
								{stat.value}
							</div>
							<div className="mt-1 text-sm text-text-sub-600 dark:text-white/50">
								{stat.label}
							</div>
						</div>
					))}
				</div>
			</PageSection>

			<PageSection narrow>
				<SectionHeading title="Recent incidents" center={false} />
				<ContentCard>
					<p className="text-sm text-text-sub-600 leading-relaxed dark:text-white/50">
						No active incidents. Subscribe to status updates via our{" "}
						<a
							href="https://github.com/reloop-labs/reloop"
							className="text-primary-base hover:underline"
							target="_blank"
							rel="noopener noreferrer"
						>
							GitHub repository
						</a>{" "}
						or{" "}
						<a
							href="https://discord.gg/bHnkBcp7xR"
							className="text-primary-base hover:underline"
							target="_blank"
							rel="noopener noreferrer"
						>
							join Discord
						</a>{" "}
						for maintenance announcements.
					</p>
				</ContentCard>
			</PageSection>

			<FeatureCta
				title="Build on reliable infrastructure"
				description="Create an account to receive delivery webhooks and monitor sends from your dashboard."
				primary={{ label: "Get started", href: "/dashboard/signup" }}
				secondary={{ label: "View docs", href: "/docs" }}
			/>
		</MarketingPageShell>
	);
};

export default StatusPage;
