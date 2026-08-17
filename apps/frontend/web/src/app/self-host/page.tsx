import { JsonLd } from "@reloop/web/components/json-ld";
import { BlogCta } from "@reloop/web/components/landing/blog/blog-cta";
import { getSiteUrl, siteName, socialProfiles } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import Convictions from "../(home)/components/convictions";
import { SectionSeparator } from "../(home)/components/section-separator";
import { SelfHostComparison } from "./components/self-host-comparison";
import { SelfHostFaq } from "./components/self-host-faq";
import { SelfHostHero } from "./components/self-host-hero";
import { SelfHostProviders } from "./components/self-host-providers";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
export const instant = false;

const siteUrl = getSiteUrl();
const pageUrl = `${siteUrl}/self-host`;
const pageTitle = "Self-Host Email Infrastructure | Reloop";
const pageDescription =
	"Deploy full-featured email infrastructure on your own servers. Apache 2.0 open-source transactional APIs, webhooks, SMTP routing, and agent inboxes with 100% data sovereignty.";

export const metadata: Metadata = {
	title: pageTitle,
	description: pageDescription,
	keywords: [
		"self-hosted email API",
		"open source email infrastructure",
		"self-host SMTP server",
		"docker email server",
		"coolify email server",
		"kubernetes email infrastructure",
		"Apache 2.0 email API",
		"transactional email self-host",
		"on-premise email server",
	],
	alternates: { canonical: pageUrl },
	openGraph: {
		title: pageTitle,
		description: pageDescription,
		type: "website",
		url: pageUrl,
		siteName,
	},
	twitter: {
		card: "summary_large_image",
		title: pageTitle,
		description: pageDescription,
	},
};

const pageSchema = {
	"@context": "https://schema.org" as const,
	"@type": "SoftwareApplication" as const,
	name: "Reloop Self-Hosted",
	applicationCategory: "DeveloperApplication",
	operatingSystem: "Linux, macOS, Docker, Kubernetes",
	offers: {
		"@type": "Offer" as const,
		price: "0",
		priceCurrency: "USD",
	},
	description: pageDescription,
	url: pageUrl,
};

export default function SelfHostPage() {
	return (
		<div className="relative w-full">
			<JsonLd data={pageSchema} />
			<SelfHostHero />
			<div className="relative mx-auto w-full max-w-5xl border-stroke-soft-200 border-x md:max-w-7xl dark:border-white/10">
				<SectionSeparator />
				<Convictions
					showHeading
					title="What Reloop Gives You"
					description="Full-featured email infrastructure with open-source sovereignty and zero vendor lock-in."
				/>
				<SectionSeparator />
				<SelfHostProviders />
				<SectionSeparator />
				<SelfHostComparison />
				<SectionSeparator />
				<SelfHostFaq />
			</div>
			<BlogCta
				category="Self-Hosting"
				headline="Deploy on your servers or run on Cloud."
				sub="Reloop is 100% open source. Same API and developer experience whether on your VPC or our infrastructure."
				primaryLabel="View GitHub Repo"
				primaryHref={socialProfiles.github}
				primaryExternal
				secondaryLabel="Start Building Free"
				secondaryHref="/dashboard/signup"
				accentColor="indigo"
			/>
		</div>
	);
}
