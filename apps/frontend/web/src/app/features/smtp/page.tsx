import {
	MarketingPageShell,
	PageSection,
} from "@reloop/web/components/page-shell";
import { getSiteUrl, hostedSignupHref } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import ConnectionSettings from "./components/connection-settings";
import CTA from "./components/cta";
import Features from "./components/features";
import Sandbox from "./components/sandbox";
import { SmtpFaq } from "./components/smtp-faq";
import WorksWith from "./components/works-with";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = {
	title: "High-Deliverability SMTP Relay & Email Service | Reloop",
	description:
		"Connect your existing applications to Reloop's fast, high-deliverability SMTP relay. No SDK migration required. Get credentials and start sending in under 2 minutes.",
	keywords: [
		"SMTP relay",
		"SMTP email service",
		"managed SMTP",
		"Nodemailer SMTP",
		"Laravel SMTP",
		"email SMTP server",
		"open source SMTP relay",
	],
	alternates: { canonical: `${getSiteUrl()}/features/smtp` },
	openGraph: {
		title: "High-Deliverability SMTP Relay & Email Service | Reloop",
		description:
			"Connect your existing applications to Reloop's fast, high-deliverability SMTP relay. No SDK migration required. Get credentials and start sending in under 2 minutes.",
		type: "website",
		url: `${getSiteUrl()}/features/smtp`,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "High-Deliverability SMTP Relay & Email Service | Reloop",
		description:
			"Connect your existing applications to Reloop's fast, high-deliverability SMTP relay. No SDK migration required. Get credentials and start sending in under 2 minutes.",
	},
};

const SmtpPage = () => {
	return (
		<MarketingPageShell
			titleLines={["Drop-in SMTP relay.", "Zero code changes."]}
			description="Point your existing mailer, application, or CRM at Reloop's high-deliverability SMTP relay. No APIs or SDKs to integrate—just copy your credentials and send immediately."
			primaryCta={{
				label: "Get SMTP credentials",
				href: hostedSignupHref,
			}}
			secondaryCta={{ label: "See how to connect", href: "#setup" }}
			fullViewportHero
		>
			<WorksWith />

			<PageSection>
				<ConnectionSettings />
			</PageSection>
			<Sandbox />
			<Features />

			<CTA />
			<SmtpFaq />
		</MarketingPageShell>
	);
};

export default SmtpPage;
