import { JsonLd } from "@reloop/web/components/json-ld";
import { glossaryTerms } from "@reloop/web/lib/landing/glossary";
import { getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import { GlossaryBrowser } from "./components/glossary-browser";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const siteUrl = getSiteUrl();
const pageUrl = `${siteUrl}/glossary`;

export const metadata: Metadata = {
	title: "Email Glossary | Reloop",
	description:
		"Browse email infrastructure terms—deliverability, authentication, analytics, and more. Clear definitions for the concepts that show up when you ship email.",
	keywords: [
		"email glossary",
		"email marketing terms",
		"email deliverability glossary",
		"SPF DKIM DMARC explained",
		"email infrastructure terminology",
		"email authentication terms",
	],
	alternates: { canonical: pageUrl },
	openGraph: {
		title: "Email Glossary | Reloop",
		description:
			"Browse email infrastructure terms—deliverability, authentication, analytics, and more.",
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "Email Glossary | Reloop",
		description:
			"Browse email infrastructure terms—deliverability, authentication, analytics, and more.",
	},
};

const GlossaryPage = () => {
	const terms = [...glossaryTerms]
		.sort((a, b) =>
			a.title.localeCompare(b.title, "en", { sensitivity: "base" }),
		)
		.map(({ slug, title, description }) => ({ slug, title, description }));

	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "DefinedTermSet",
		name: "Email Glossary",
		description:
			"Comprehensive glossary of email marketing and infrastructure terms.",
		url: pageUrl,
		hasDefinedTerm: terms.map((term) => ({
			"@type": "DefinedTerm",
			name: term.title,
			description: term.description,
			url: `${siteUrl}/glossary/${term.slug}`,
			inDefinedTermSet: pageUrl,
		})),
	};

	return (
		<>
			<JsonLd data={jsonLd} />
			<div className="pt-6">
				{/* Hero */}
				<section className="mx-auto w-full max-w-7xl border-stroke-soft-200 border-x dark:border-white/10">
					<div className="px-4 pt-16 pb-12 sm:px-6 sm:pt-20 sm:pb-14 lg:px-8">
						<div className="mx-auto text-center">
							<h1 className="font-serif text-[2.4rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.6rem] dark:text-white">
								Explore email terms.
							</h1>
							<p className="mx-auto mt-3 max-w-2xl text-balance text-[15px] text-text-sub-600 leading-relaxed sm:text-[17px] dark:text-white/50">
								Browse the terms and definitions that show up when you build,
								send, and debug email infrastructure.
							</p>
						</div>
					</div>
				</section>

				<GlossaryBrowser terms={terms} />

				{/* CTA */}
				<section
					id="cta"
					className="mx-auto w-full max-w-7xl border-stroke-soft-200 border-x dark:border-white/10"
				>
					<div className="px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
						<div className="mx-auto max-w-[920px] text-center">
							<h2 className="font-serif text-[2.6rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem] dark:text-white">
								Ready to put it into practice?
								<br />
								<span className="text-primary-base">Start free today.</span>
							</h2>
							<p className="mx-auto mt-6 max-w-[550px] font-medium text-[15px] text-text-sub-600 leading-7 sm:text-[17px] dark:text-white/60">
								3,000 emails per month on the Free plan—no credit card. Or read
								the docs and deploy Reloop yourself.
							</p>
							<div className="mt-8 flex flex-wrap items-center justify-center gap-4">
								<a
									href="/dashboard/signup"
									className="inline-flex h-12 items-center justify-center rounded-full bg-[#0a0d12] px-8 font-semibold text-[15px] text-white transition-colors hover:bg-[#0a0d12]/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
								>
									Get started free
								</a>
								<a
									href="/docs"
									className="inline-flex h-12 items-center justify-center gap-2.5 rounded-full border border-[#0a0d12]/10 px-8 font-semibold text-[#0a0d12] text-[15px] transition-colors hover:bg-[#0a0d12]/10 dark:border-white/10 dark:text-white dark:hover:bg-white/10"
								>
									Read documentation
								</a>
							</div>
						</div>
					</div>
				</section>
			</div>
		</>
	);
};

export default GlossaryPage;
