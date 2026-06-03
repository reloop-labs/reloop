import {
	FeatureCta,
	MarketingPageShell,
	PageSection,
} from "@reloop/web/components/page-shell";
import { FaqSection } from "@reloop/web/components/faq-section";
import { contactEmail, socialProfiles } from "@reloop/web/lib/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Contact Us | Reloop",
	description:
		"Get in touch with Reloop Labs for hosted service, self-hosting help, and community support.",
	openGraph: {
		title: "Contact Us | Reloop",
		description:
			"Get in touch with Reloop Labs for hosted service, self-hosting help, and community support.",
		type: "website",
	},
};

const contactMethods = [
	{
		title: "Email",
		description:
			"General questions, hosted service, self-hosting help, licensing, and feedback.",
		href: `mailto:${contactEmail}`,
		label: contactEmail,
	},
	{
		title: "GitHub",
		description:
			"Bug reports, feature requests, and code contributions belong on GitHub.",
		href: `${socialProfiles.github}/issues`,
		label: "Open an issue",
		external: true,
	},
	{
		title: "Discord",
		description:
			"Chat with the team and community—fastest way to get informal help.",
		href: socialProfiles.discord,
		label: "Join Discord",
		external: true,
	},
	{
		title: "GitHub Discussions",
		description:
			"RFCs, architecture questions, and roadmap conversations.",
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
		<MarketingPageShell
			titleLines={["Contact us"]}
			description="We're a small open-source team. Reach out by email or join the community on GitHub and Discord."
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
				<div className="text-center">
					<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em]">
						Get in touch
					</p>
					<h2 className="mt-4 font-serif text-[2.6rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem] dark:text-white">
						How can we
						<br />
						<span className="text-primary-base">help?</span>
					</h2>
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
							<h3 className="font-semibold text-[17px] text-text-strong-950 group-hover:text-primary-base dark:text-white">
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
					href: "/dashboard/signup",
				}}
				secondary={{
					label: "Self-hosting guide",
					href: "/resources/self-hosting-guide",
				}}
			/>
		</MarketingPageShell>
	);
};

export default ContactUsPage;
