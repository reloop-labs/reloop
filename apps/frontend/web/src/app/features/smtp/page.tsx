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
	title: "Fast, Reliable SMTP Relay & Email Service | Reloop",
	description:
		"Connect your existing applications to Reloop's fast, reliable SMTP relay. No SDK migration required. Get credentials and start sending in under 2 minutes.",
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
		title: "Fast, Reliable SMTP Relay & Email Service | Reloop",
		description:
			"Connect your existing applications to Reloop's fast, reliable SMTP relay. No SDK migration required. Get credentials and start sending in under 2 minutes.",
		type: "website",
		url: `${getSiteUrl()}/features/smtp`,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "Fast, Reliable SMTP Relay & Email Service | Reloop",
		description:
			"Connect your existing applications to Reloop's fast, reliable SMTP relay. No SDK migration required. Get credentials and start sending in under 2 minutes.",
	},
};

const SmtpPage = () => {
	return (
		<MarketingPageShell
			titleLines={["Fast and reliable", "SMTP service."]}
			description="Point your existing application, mailer, or CRM at Reloop's lightning-fast SMTP relay. Zero code changes."
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
