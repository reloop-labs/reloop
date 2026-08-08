import { JsonLd } from "@reloop/web/components/json-ld";
import { BlogCta } from "@reloop/web/components/landing/blog/blog-cta";
import { glossaryTerms } from "@reloop/web/lib/landing/glossary";
import {
	buildGlossaryIndexJsonLd,
	createGlossaryIndexMetadata,
} from "@reloop/web/lib/landing/glossary/seo";
import Link from "next/link";
import { GlossaryBrowser } from "./components/glossary-browser";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata = createGlossaryIndexMetadata();

const GlossaryPage = () => {
	const terms = [...glossaryTerms]
		.sort((a, b) =>
			a.title.localeCompare(b.title, "en", { sensitivity: "base" }),
		)
		.map(({ slug, title, description }) => ({ slug, title, description }));

	const jsonLd = buildGlossaryIndexJsonLd(terms);

	return (
		<>
			<JsonLd data={jsonLd} />
			<div className="pt-6">
				{/* Breadcrumb for internal linking + a11y */}
				<nav
					aria-label="Breadcrumb"
					className="mx-auto flex w-full max-w-7xl items-center gap-2 border-stroke-soft-200 border-x px-4 py-4 text-[13px] text-text-sub-600 sm:px-6 lg:px-8 dark:border-white/10 dark:text-white/55"
				>
					<Link
						href="/"
						className="transition-colors hover:text-text-strong-950 dark:hover:text-white"
					>
						Home
					</Link>
					<span className="text-text-sub-600/40 dark:text-white/25" aria-hidden>
						/
					</span>
					<span className="font-medium text-text-strong-950 dark:text-white">
						Email Glossary
					</span>
				</nav>

				{/* Hero */}
				<section className="mx-auto w-full max-w-7xl border-stroke-soft-200 border-x dark:border-white/10">
					<div className="px-4 pt-12 pb-12 sm:px-6 sm:pt-16 sm:pb-14 lg:px-8">
						<div className="mx-auto text-center">
							<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em] dark:text-white/55">
								Email glossary
							</p>
							<h1 className="mt-3 font-sans font-semibold text-[2.4rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.6rem] dark:text-white">
								Email terms, explained.
							</h1>
							<p className="mx-auto mt-3 max-w-2xl text-balance text-[15px] text-text-sub-600 leading-relaxed sm:text-[17px] dark:text-white/50">
								Short definitions for the words you run into when you set up
								sending, fix deliverability, or dig through docs. From SPF and
								DKIM to bounces, reputation, and webhooks.
							</p>
						</div>
					</div>
				</section>

				<GlossaryBrowser terms={terms} />

				{/* CTA */}
				<BlogCta category="Glossary" />
			</div>
		</>
	);
};

export default GlossaryPage;
