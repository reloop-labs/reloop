import {
	MarketingPageShell,
	PageSection,
} from "@reloop/web/components/page-shell";
import { contactEmail, getSiteUrl, socialProfiles } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import Script from "next/script";
import { ContactForm } from "./contact-form";

const siteUrl = getSiteUrl();
const contactPageUrl = `${siteUrl}/company/contact-us`;

export const metadata: Metadata = {
	title: "Contact Us | Reloop",
	description: "Contact Reloop Labs by email, Discord, or GitHub.",
	keywords: [
		"contact Reloop",
		"Reloop support",
		"email platform contact",
		"Reloop Labs email",
		"open source email support",
	],
	openGraph: {
		title: "Contact Us | Reloop",
		description: "Contact Reloop Labs by email, Discord, or GitHub.",
		type: "website",
		url: contactPageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "Contact Us | Reloop",
		description: "Contact Reloop Labs by email, Discord, or GitHub.",
	},
	alternates: {
		canonical: contactPageUrl,
	},
};

const contactPageSchema = {
	"@context": "https://schema.org",
	"@type": "ContactPage",
	name: "Contact Reloop",
	url: contactPageUrl,
	mainEntity: {
		"@type": "Organization",
		name: "Reloop Labs",
		url: siteUrl,
		email: contactEmail,
	},
};

const contactMethods = [
	{
		tag: "Email",
		label: contactEmail,
		href: `mailto:${contactEmail}`,
		external: false,
	},
	{
		tag: "Discord",
		label: "Join Discord",
		href: socialProfiles.discord,
		external: true,
	},
	{
		tag: "GitHub",
		label: "Open an issue",
		href: `${socialProfiles.github}/issues`,
		external: true,
	},
	{
		tag: "Discussions",
		label: "Start a discussion",
		href: `${socialProfiles.github}/discussions`,
		external: true,
	},
];

const ContactUsPage = () => {
	return (
		<>
			<Script
				id="contact-page-schema"
				type="application/ld+json"
				strategy="afterInteractive"
			>
				{JSON.stringify(contactPageSchema)}
			</Script>

			<MarketingPageShell titleLines={["Contact us"]} compactHero>
				<PageSection narrow flushTop>
					<div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-16">
						<div className="flex-1 overflow-hidden rounded-3xl border border-stroke-soft-200 bg-[#f8f8f8] p-6 dark:border-white/10 dark:bg-[#0a0a0a]">
							<ContactForm />
						</div>
					</div>
				</PageSection>

				<PageSection narrow>
					<div className="text-center">
						<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em]">
							Other channels
						</p>
						<h2 className="mt-3 font-serif text-[2rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[2.6rem] dark:text-white">
							Ways to <span className="text-primary-base">reach us.</span>
						</h2>
					</div>
					<div className="mx-auto mt-8 grid max-w-3xl gap-3 sm:grid-cols-2">
						{contactMethods.map((method) => (
							<a
								key={method.tag}
								href={method.href}
								target={method.external ? "_blank" : undefined}
								rel={method.external ? "noopener noreferrer" : undefined}
								className="group flex items-center justify-between rounded-2xl border border-stroke-soft-200 px-5 py-4 transition-colors hover:border-stroke-soft-300 dark:border-white/10 dark:hover:border-white/20"
							>
								<div>
									<span className="font-semibold text-[11px] text-primary-base uppercase tracking-[0.14em]">
										{method.tag}
									</span>
									<p className="mt-1 font-semibold text-[15px] text-text-strong-950 group-hover:text-primary-base dark:text-white">
										{method.label}
									</p>
								</div>
								<span className="text-lg text-primary-base" aria-hidden="true">
									→
								</span>
							</a>
						))}
					</div>
				</PageSection>
			</MarketingPageShell>
		</>
	);
};

export default ContactUsPage;
