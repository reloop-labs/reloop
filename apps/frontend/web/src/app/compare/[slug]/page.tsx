import { JsonLd } from "@reloop/web/components/json-ld";
import {
	getBlogComparePage,
	listBlogComparePages,
} from "@reloop/web/lib/blog-compare-pages";
import { breadcrumbJsonLd } from "@reloop/web/lib/schema";
import { getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CompareFeatureGrid } from "../components/compare-feature-grid";
import { CompareFeaturesHeading } from "../components/compare-features-heading";
import { CompareOtherPills } from "../components/compare-other-pills";
import { ComparisonPageShell } from "../components/comparison-page-shell";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

type Props = {
	params: Promise<{ slug: string }>;
};

/** Competitors with a "Reloop vs X" post; hand-written pages under app/compare win over this route. */
export function generateStaticParams() {
	return listBlogComparePages().map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug } = await params;
	const page = getBlogComparePage(slug);
	if (!page) return {};

	const url = `${getSiteUrl()}/compare/${page.slug}`;
	const title = `${page.title} | Email Provider Comparison`;
	return {
		title,
		description: page.description,
		keywords: [
			page.title,
			`${page.competitor} alternative`,
			`${page.competitor} pricing`,
			`open source ${page.competitor} alternative`,
		],
		openGraph: {
			title: page.title,
			description: page.description,
			type: "website",
			url,
			siteName: "Reloop",
			images: page.image ? [{ url: page.image, alt: page.title }] : undefined,
		},
		twitter: {
			card: "summary_large_image",
			title,
			description: page.description,
			images: page.image ? [page.image] : undefined,
		},
		alternates: { canonical: url },
	};
}

export default async function BlogComparePage({ params }: Props) {
	const { slug } = await params;
	const page = getBlogComparePage(slug);
	if (!page) notFound();

	const pagePath = `/compare/${page.slug}`;

	return (
		<>
			<JsonLd
				data={[
					breadcrumbJsonLd([
						{ name: "Compare", path: "/compare" },
						{ name: page.title, path: pagePath },
					]),
				]}
			/>
			<ComparisonPageShell
				pagePath={pagePath}
				competitorName={page.competitor}
				titleLines={[page.title]}
				description={page.description}
				updatedAt={page.publishedAt}
				openSourceNote={`${page.competitor} isn't open source: you can't run it on your own server.`}
				afterHero={
					<section className="border-stroke-soft-100 border-b dark:border-white/10">
						<CompareFeaturesHeading
							competitorName={page.competitor}
							checkedOn={page.publishedAt}
						/>
						<CompareFeatureGrid
							competitorName={page.competitor}
							features={page.features}
						/>
					</section>
				}
			>
				<CompareOtherPills
					currentHref={pagePath}
					competitorName={page.competitor}
					checkedOn={page.publishedAt}
				/>
			</ComparisonPageShell>
		</>
	);
}
