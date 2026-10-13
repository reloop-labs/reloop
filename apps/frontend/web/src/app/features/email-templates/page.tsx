import { JsonLd } from "@reloop/web/components/json-ld";
import { LandingDeveloperProof } from "@reloop/web/components/landing/landing-developer-proof";
import { breadcrumbJsonLd, faqPageJsonLd } from "@reloop/web/lib/schema";
import { getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import { SectionSeparator } from "../../(home)/components/section-separator";
import { UseCasesSection } from "../transaction-emails/components/use-cases-section";
import { FeaturesSection } from "./components/features-section";
import { SendSection } from "./components/send-section";
import { TemplatesCta } from "./components/templates-cta";
import { TemplatesFaq, templatesFaq } from "./components/templates-faq";
import { TemplatesHero } from "./components/templates-hero";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const pagePath = "/features/email-templates";
const pageUrl = `${getSiteUrl()}${pagePath}`;
const description =
	"Design email templates in a visual editor, publish versions, and send them from your code by ID with variables. Starter templates, HTML view, version history and test sends. Free to start.";
const shortDescription =
	"Design emails in a visual editor and send them from your code by ID. Copy changes never need a deploy.";

export const metadata: Metadata = {
	title: "Email Templates",
	description,
	keywords: [
		"email templates",
		"email template editor",
		"transactional email templates",
		"email template API",
		"React Email templates",
		"HTML email templates",
		"open source email templates",
	],
	alternates: { canonical: pageUrl },
	openGraph: {
		title: "Email Templates | Reloop",
		description: shortDescription,
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "Email Templates | Reloop",
		description: shortDescription,
	},
};

const EmailTemplatesPage = () => {
	return (
		<div className="relative min-h-screen overflow-x-hidden bg-bg-white-0 font-sans text-text-strong-950 selection:bg-neutral-200 dark:bg-black dark:text-white dark:selection:bg-neutral-800">
			<JsonLd
				data={[
					breadcrumbJsonLd([
						{ name: "Features", path: "/features" },
						{ name: "Email templates", path: pagePath },
					]),
					faqPageJsonLd(templatesFaq),
				]}
			/>
			<TemplatesHero />
			<div className="relative mx-auto w-full max-w-5xl border-stroke-soft-100 border-x md:max-w-7xl dark:border-white/10">
				<div
					aria-hidden
					className="h-24 border-stroke-soft-100 border-t sm:h-24 dark:border-white/10"
				/>
			</div>
			<LandingDeveloperProof />
			<div className="relative mx-auto w-full max-w-5xl border-stroke-soft-100 border-x md:max-w-7xl dark:border-white/10">
				<SectionSeparator hideTop className="h-24 sm:h-24" />
				<FeaturesSection />
				<SectionSeparator className="h-24 sm:h-24" />
				<SendSection />
				<SectionSeparator className="h-24 sm:h-24" />
				<UseCasesSection
					title="Start from a ready-made template"
					description="Welcome, password reset, receipts and dozens more. Open one in the editor, make it yours, and send it."
				/>
				<SectionSeparator className="h-24 sm:h-24" />
				<TemplatesFaq />
				<SectionSeparator className="h-24 sm:h-24" />
				<TemplatesCta />
			</div>
		</div>
	);
};

export default EmailTemplatesPage;
