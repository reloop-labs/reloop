import { JsonLd } from "@reloop/web/components/json-ld";
import { BlogCta } from "@reloop/web/components/landing/blog/blog-cta";
import {
	getSiteUrl,
	siteName,
	socialImage,
	socialProfiles,
} from "@reloop/web/lib/site";
import type { Metadata } from "next";
import { SectionSeparator } from "../(home)/components/section-separator";
import ShipFast from "../(home)/components/ship-fast";
import { SelfHostComparison } from "./components/self-host-comparison";
import { SelfHostHero } from "./components/self-host-hero";
import { SelfHostProviders } from "./components/self-host-providers";
import { SelfHostRequirements } from "./components/self-host-requirements";
import { SelfHostSponsors } from "./components/self-host-sponsors";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
export const instant = false;

const siteUrl = getSiteUrl();
const pageUrl = `${siteUrl}/self-host`;
const pageTitle = "Self-Host Transactional Email";
const socialTitle = `${pageTitle} | Reloop`;
const pageDescription =
	"Install Reloop on an Ubuntu or Debian server with one command. Transactional email API, SMTP, inbound mail, and campaigns, with your data on that machine.";

export const metadata: Metadata = {
	title: pageTitle,
	description: pageDescription,
	keywords: [
		"self-hosted email API",
		"self-hosted transactional email",
		"open source email infrastructure",
		"open source Resend alternative",
		"self-host SMTP server",
		"transactional email self-host",
	],
	alternates: { canonical: pageUrl },
	openGraph: {
		title: socialTitle,
		description: pageDescription,
		images: [socialImage],
		type: "website",
		url: pageUrl,
		siteName,
	},
	twitter: {
		card: "summary_large_image",
		title: socialTitle,
		description: pageDescription,
		images: [socialImage.url],
	},
};

const pageSchema = {
	"@context": "https://schema.org" as const,
	"@type": "SoftwareApplication" as const,
	name: "Reloop Self-Hosted",
	applicationCategory: "DeveloperApplication",
	operatingSystem: "Linux",
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
				<SelfHostSponsors />
				<SectionSeparator />
				<SelfHostRequirements />
				<SectionSeparator />
				<SelfHostProviders />
				<SectionSeparator />
				<SelfHostComparison />
				<SectionSeparator hideTop />
				<ShipFast />
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
