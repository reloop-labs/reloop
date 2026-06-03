import {
	FeatureCta,
	MarketingPageShell,
	PageSection,
} from "@reloop/web/components/page-shell";
import { FaqSection } from "@reloop/web/components/faq-section";
import {
	contactEmail,
	getSiteUrl,
	hostedSignupHref,
	socialProfiles,
} from "@reloop/web/lib/site";
import type { Metadata } from "next";
import Script from "next/script";
import { ContactForm } from "./contact-form";

const siteUrl = getSiteUrl();
const contactPageUrl = `${siteUrl}/company/contact-us`;

export const metadata: Metadata = {
	title: "Contact Us | Reloop",
	description:
		"Get in touch with Reloop Labs. Questions about our hosted email service, self-hosting, or the open-source project? Email us or join the community.",
	keywords: [
		"contact reloop",
		"reloop support",
		"email infrastructure support",
		"self-hosting help",
		"reloop labs contact",
	],
	openGraph: {
		title: "Contact Us | Reloop",
		description:
			"Questions about hosted email or self-hosting Reloop? Get in touch with Reloop Labs—we're here to help.",
		type: "website",
		url: contactPageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "Contact Us | Reloop",
		description:
			"Questions about hosted email or self-hosting Reloop? Get in touch with Reloop Labs.",
	},
	alternates: {
		canonical: contactPageUrl,
	},
	robots: {
		index: true,
		follow: true,
	},
};

const contactPageSchema = {
	"@context": "https://schema.org",
	"@type": "ContactPage",
	name: "Contact Reloop",
	description:
		"Get in touch with Reloop Labs for questions about hosted email infrastructure and self-hosting.",
	url: contactPageUrl,
	mainEntity: {
		"@type": "Organization",
		name: "Reloop Labs",
		url: siteUrl,
		email: contactEmail,
		contactPoint: [
			{
				"@type": "ContactPoint",
				contactType: "customer service",
				email: contactEmail,
				availableLanguage: ["English"],
			},
		],
	},
};

const breadcrumbSchema = {
	"@context": "https://schema.org",
	"@type": "BreadcrumbList",
	itemListElement: [
		{
			"@type": "ListItem",
			position: 1,
			name: "Home",
			item: siteUrl,
		},
		{
			"@type": "ListItem",
			position: 2,
			name: "Contact",
			item: contactPageUrl,
		},
	],
};

const contactMethods = [
	{
		tag: "Email",
		title: "General inquiries",
		description:
			"Hosted service, self-hosting, licensing, partnerships, and anything else—email is the best place to start.",
		href: `mailto:${contactEmail}`,
		label: contactEmail,
		external: false,
	},
	{
		tag: "Discord",
		title: "Community chat",
		description:
			"Fastest way to get informal help. Chat with the team and other self-hosters in real time.",
		href: socialProfiles.discord,
		label: "Join Discord",
		external: true,
	},
	{
		tag: "GitHub",
		title: "Bug reports",
		description:
			"Found a bug? Open an issue with steps to reproduce, your Reloop version, and deployment details.",
		href: `${socialProfiles.github}/issues`,
		label: "Open an issue",
		external: true,
	},
	{
		tag: "Discussions",
		title: "RFCs & architecture",
		description:
			"Roadmap threads, design questions, and longer-form conversations live on GitHub Discussions.",
		href: `${socialProfiles.github}/discussions`,
		label: "Start a discussion",
		external: true,
	},
];

const contactFaq = [
	{
		question: "Do you offer a hosted email service?",
		answer:
			"Yes. Reloop delivers the same email infrastructure as proprietary platforms—transactional email, campaigns, SMTP relay, templates, webhooks, and more. Use our hosted service from Reloop Labs, or self-host the open-source codebase on your own servers (Docker, Kubernetes, etc.).",
	},
	{
		question: "How quickly do you respond?",
		answer: `We aim to reply to email at ${contactEmail} within a few business days. Discord is usually faster for community help.`,
	},
	{
		question: "Where should I report bugs?",
		answer:
			"Open a GitHub issue with steps to reproduce, your Reloop version, and deployment details (Docker, K8s, etc.).",
	},
	{
		question: "Can I contribute to Reloop?",
		answer:
			"Yes—check CONTRIBUTING in the repo, pick an issue, and open a PR. We welcome documentation and code contributions.",
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
			<Script
				id="breadcrumb-schema"
				type="application/ld+json"
				strategy="afterInteractive"
			>
				{JSON.stringify(breadcrumbSchema)}
			</Script>

			<MarketingPageShell
				titleLines={["Contact us"]}
				description="We're a small open-source team. Reach out about our hosted service, self-hosting, or the codebase—we read every message."
				primaryCta={{
					label: `Email ${contactEmail}`,
					href: `mailto:${contactEmail}`,
				}}
				secondaryCta={{
					label: "Join Discord",
					href: socialProfiles.discord,
					external: true,
				}}
				compactHero
			>
				<PageSection>
					<div className="flex flex-col gap-16 lg:flex-row lg:items-start lg:gap-24">
						<div className="lg:w-[480px] lg:shrink-0">
							<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em]">
								Send a message
							</p>
							<h2 className="mt-4 font-serif text-[2.6rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem] dark:text-white">
								Drop us{" "}
								<span className="text-primary-base">a line.</span>
							</h2>
							<p className="mt-6 max-w-[420px] text-[15px] text-text-sub-600 leading-7 sm:text-[16px] dark:text-white/50">
								Whether you&apos;re evaluating Reloop hosted, deploying
								self-hosted, or contributing to the project—we&apos;d love to
								hear from you.
							</p>
							<p className="mt-6 max-w-[420px] text-[14px] text-text-sub-600 leading-7 dark:text-white/40">
								Prefer email directly?{" "}
								<a
									href={`mailto:${contactEmail}`}
									className="font-semibold text-primary-base underline decoration-primary-base/30 underline-offset-4 transition-opacity hover:opacity-80"
								>
									{contactEmail}
								</a>
							</p>
						</div>

						<div className="flex-1">
							<div className="overflow-hidden rounded-2xl border border-stroke-soft-200 p-8 lg:p-10 dark:border-white/10">
								<ContactForm />
							</div>
						</div>
					</div>
				</PageSection>

				<PageSection>
					<div className="text-center">
						<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em]">
							Other channels
						</p>
						<h2 className="mt-4 font-serif text-[2.6rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem] dark:text-white">
							Ways to{" "}
							<span className="text-primary-base">reach us.</span>
						</h2>
						<p className="mx-auto mt-6 max-w-2xl text-[15px] text-text-sub-600 leading-7 sm:text-[16px] dark:text-white/50">
							Not every question needs a form. Pick the channel that fits—bugs on
							GitHub, quick questions on Discord, everything else by email.
						</p>
					</div>
					<div className="mx-auto mt-14 grid max-w-4xl gap-4 sm:grid-cols-2">
						{contactMethods.map((method) => (
							<a
								key={method.title}
								href={method.href}
								target={method.external ? "_blank" : undefined}
								rel={method.external ? "noopener noreferrer" : undefined}
								className="group rounded-2xl border border-stroke-soft-200 p-6 transition-colors hover:border-stroke-soft-300 dark:border-white/10 dark:hover:border-white/20"
							>
								<span className="font-semibold text-[11px] text-primary-base uppercase tracking-[0.14em]">
									{method.tag}
								</span>
								<h3 className="mt-3 font-semibold text-[17px] text-text-strong-950 leading-snug group-hover:text-primary-base dark:text-white">
									{method.title}
								</h3>
								<p className="mt-2 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/50">
									{method.description}
								</p>
								<span className="mt-4 inline-block font-semibold text-primary-base text-sm">
									{method.label} →
								</span>
							</a>
						))}
					</div>
				</PageSection>

				<FaqSection
					items={contactFaq}
					id="contact-faq"
					eyebrow="FAQ"
					title="Common questions"
					plain
				/>

				<FeatureCta
					title="Ready to get started?"
					titleMuted="Hosted or self-hosted."
					description="Sign up for Reloop as a service, or deploy the open-source platform on infrastructure you control."
					primary={{
						label: "Get started",
						href: hostedSignupHref,
					}}
					secondary={{
						label: "Self-hosting guide",
						href: "/resources/self-hosting-guide",
					}}
				/>
			</MarketingPageShell>
		</>
	);
};

export default ContactUsPage;
