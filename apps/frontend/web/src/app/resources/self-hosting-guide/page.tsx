import {
	CodeBlock,
	ContentCard,
	FeatureCta,
	MarketingPageShell,
	PageSection,
	SectionHeading,
} from "@reloop/web/components/page-shell";
import { getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const pageUrl = `${getSiteUrl()}/resources/self-hosting-guide`;

export const metadata: Metadata = {
	title: "Self-Hosting Guide | Reloop",
	description:
		"Deploy Reloop on your own infrastructure with Docker Compose, Kubernetes, or bare metal. Full control over your email stack.",
	keywords: [
		"self-host email",
		"self-hosted email server",
		"deploy email infrastructure",
		"Docker email server",
		"Kubernetes email",
		"open source email self-hosting",
		"email server setup",
	],
	alternates: { canonical: pageUrl },
	openGraph: {
		title: "Self-Hosting Guide | Reloop",
		description:
			"Deploy Reloop on your own infrastructure with Docker Compose, Kubernetes, or bare metal.",
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "Self-Hosting Guide | Reloop",
		description:
			"Deploy Reloop on your own infrastructure with Docker Compose, Kubernetes, or bare metal.",
	},
};

const dockerSteps = `# Clone the repository
git clone https://github.com/reloop-labs/reloop.git
cd reloop

# Configure backend environment files
bun env:setup

# Start all services
docker compose up -d`;

const k8sSteps = `# Add Helm repository
helm repo add reloop https://charts.reloop.com
helm repo update

# Install Reloop
helm install reloop reloop/reloop`;

const SelfHostingGuidePage = () => {
	return (
		<MarketingPageShell
			titleLines={["Self-Hosting Guide"]}
			description="Deploy Reloop on your own infrastructure with Docker, Kubernetes, or bare metal—your data stays on your network."
			primaryCta={{ label: "Get started", href: "/dashboard/signup" }}
			secondaryCta={{
				label: "View on GitHub",
				href: "https://github.com/reloop-labs/reloop",
			}}
		>
			<PageSection>
				<SectionHeading
					title="Before you begin"
					description="Ensure your environment meets minimum requirements."
				/>
				<div className="grid gap-6 sm:grid-cols-2">
					<ContentCard>
						<h3 className="mb-2 font-semibold text-lg text-text-strong-950 dark:text-white">
							Hardware
						</h3>
						<ul className="list-disc space-y-1 pl-5 text-sm text-text-sub-600 dark:text-white/50">
							<li>4+ CPU cores recommended</li>
							<li>8 GB RAM minimum (16 GB for production)</li>
							<li>50 GB SSD storage</li>
						</ul>
					</ContentCard>
					<ContentCard>
						<h3 className="mb-2 font-semibold text-lg text-text-strong-950 dark:text-white">
							Software
						</h3>
						<ul className="list-disc space-y-1 pl-5 text-sm text-text-sub-600 dark:text-white/50">
							<li>Docker & Docker Compose</li>
							<li>PostgreSQL, Redis, ClickHouse</li>
							<li>SMTP server (Postfix) for outbound mail</li>
						</ul>
					</ContentCard>
				</div>
			</PageSection>

			<PageSection alt narrow>
				<SectionHeading
					title="Installation methods"
					description="Choose the path that fits your deployment."
				/>
				<div className="space-y-8">
					<div>
						<h3 className="mb-2 font-semibold text-text-strong-950 text-xl dark:text-white">
							Docker Compose{" "}
							<span className="font-normal text-primary-base text-sm">
								(Recommended)
							</span>
						</h3>
						<p className="mb-4 text-sm text-text-sub-600 dark:text-white/50">
							Fastest way to run Reloop locally or on a single server.
						</p>
						<CodeBlock>{dockerSteps}</CodeBlock>
					</div>
					<div>
						<h3 className="mb-2 font-semibold text-text-strong-950 text-xl dark:text-white">
							Kubernetes
						</h3>
						<p className="mb-4 text-sm text-text-sub-600 dark:text-white/50">
							Production deployments with Helm charts and HA configurations.
						</p>
						<CodeBlock>{k8sSteps}</CodeBlock>
					</div>
				</div>
			</PageSection>

			<PageSection narrow>
				<SectionHeading
					title="Environment variables"
					description="Essential settings for a production deployment."
					center={false}
				/>
				<CodeBlock>{`DATABASE_URL=postgresql://user:pass@localhost:5432/reloop
REDIS_URL=redis://localhost:6379
SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
RELOOP_API_KEY=your-secret-key`}</CodeBlock>
			</PageSection>

			<FeatureCta
				title="Ready to self-host?"
				titleMuted="You're in control."
				description="Fork the repository, follow the guide, and join the community if you need help."
				primary={{ label: "Get started", href: "/dashboard/signup" }}
				secondary={{
					label: "Read full guide",
					href: "/docs",
				}}
			/>
		</MarketingPageShell>
	);
};

export default SelfHostingGuidePage;
