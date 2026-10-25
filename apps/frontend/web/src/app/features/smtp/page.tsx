import { JsonLd } from "@reloop/web/components/json-ld";
import { LandingDeveloperProof } from "@reloop/web/components/landing/landing-developer-proof";
import { breadcrumbJsonLd, faqPageJsonLd } from "@reloop/web/lib/schema";
import { getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import { SectionSeparator } from "../../(home)/components/section-separator";
import { ConnectServicesSection } from "../transaction-emails/components/connect-services-section";
import { ObservabilitySection } from "../transaction-emails/components/observability-section";
import { TransactionalCta } from "../transaction-emails/components/transactional-cta";
import { ByoSmtpSection } from "./components/byo-smtp-section";
import { CredentialsSection } from "./components/credentials-section";
import { MailersSection } from "./components/mailers-section";
import { PipelineSection } from "./components/pipeline-section";
import { SmtpFaq, smtpFaq } from "./components/smtp-faq";
import { SmtpHero } from "./components/smtp-hero";
import { SMTP_SERVICES } from "./components/smtp-services";

const pagePath = "/features/smtp";
const pageUrl = `${getSiteUrl()}${pagePath}`;
const description =
	"Point any app, framework, or no-code tool at smtp.reloop.sh and start sending. Delivery logs, webhooks, DKIM, and bounce suppression included. 6,000 emails a month free. Open source.";

export const metadata: Metadata = {
	title: "SMTP Relay Service",
	description,
	keywords: [
		"SMTP relay",
		"SMTP relay service",
		"SMTP email service",
		"managed SMTP",
		"Nodemailer SMTP",
		"Laravel SMTP",
		"Django SMTP",
		"open source SMTP relay",
		"sendgrid SMTP alternative",
	],
	alternates: { canonical: pageUrl },
	openGraph: {
		title: "SMTP Relay Service | Reloop",
		description:
			"An SMTP relay your existing app already speaks. Change four settings, keep your code, and see every delivery.",
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "SMTP Relay Service | Reloop",
		description:
			"An SMTP relay your existing app already speaks. Change four settings, keep your code, and see every delivery.",
	},
};

const SmtpPage = () => {
	return (
		<div className="relative min-h-screen overflow-x-hidden bg-bg-white-0 font-sans text-text-strong-950 selection:bg-neutral-200 dark:bg-black dark:text-white dark:selection:bg-neutral-800">
			<JsonLd
				data={[
					breadcrumbJsonLd([
						{ name: "Features", path: "/features" },
						{ name: "SMTP relay", path: pagePath },
					]),
					faqPageJsonLd(smtpFaq),
				]}
			/>
			<SmtpHero />
			<div className="relative mx-auto w-full max-w-5xl border-stroke-soft-100 border-x md:max-w-7xl dark:border-white/10">
				<div
					aria-hidden
					className="h-24 border-stroke-soft-100 border-t sm:h-24 dark:border-white/10"
				/>
			</div>
			<LandingDeveloperProof />
			<div className="relative mx-auto w-full max-w-5xl border-stroke-soft-100 border-x md:max-w-7xl dark:border-white/10">
				<SectionSeparator hideTop className="h-24 sm:h-24" />
				<CredentialsSection />
				<SectionSeparator className="h-24 sm:h-24" />
				<MailersSection />
				<SectionSeparator className="h-24 sm:h-24" />
				<ConnectServicesSection
					services={SMTP_SERVICES}
					title={
						<>
							Plug into any tool
							<br />
							with an SMTP setting
						</>
					}
					description="CMSs, auth providers, and dashboards already have an SMTP field. Paste in Reloop and they send like the rest of your app."
				/>
				<SectionSeparator className="h-24 sm:h-24" />
				<PipelineSection />
				<SectionSeparator className="h-24 sm:h-24" />
				<ObservabilitySection
					title="Know what happened after 250 OK"
					description="An SMTP server only tells your app the message was accepted. Reloop shows whether it was delivered, opened, or bounced, and streams every event to your webhooks."
				/>
				<SectionSeparator className="h-24 sm:h-24" />
				<ByoSmtpSection />
				<SectionSeparator className="h-24 sm:h-24" />
				<SmtpFaq />
				<SectionSeparator className="h-24 sm:h-24" />
				<TransactionalCta />
			</div>
		</div>
	);
};

export default SmtpPage;
