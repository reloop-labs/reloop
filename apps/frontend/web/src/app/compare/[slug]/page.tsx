import { Icon } from "@reloop/ui/icon";
import { FaqSection } from "@reloop/web/components/faq-section";
import { JsonLd } from "@reloop/web/components/json-ld";
import { PageSection } from "@reloop/web/components/page-shell";
import {
	type CompareEdgePoint,
	getBlogComparePage,
	listBlogComparePages,
} from "@reloop/web/lib/blog-compare-pages";
import { breadcrumbJsonLd, faqPageJsonLd } from "@reloop/web/lib/schema";
import { getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CompareOtherLinks } from "../components/compare-other-links";
import { ComparisonPageShell } from "../components/comparison-page-shell";
import { ComparisonTable } from "../components/comparison-table";

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

function EdgeList({
	label,
	title,
	points,
}: {
	label: string;
	title: string;
	points: CompareEdgePoint[];
}) {
	return (
		<div className="lg:w-1/2">
			<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em]">
				{label}
			</p>
			<h2 className="mt-3 font-semibold text-[1.6rem] text-text-strong-950 tracking-tight sm:text-[1.9rem] dark:text-white">
				{title}
			</h2>
			<ul className="mt-5 space-y-3">
				{points.map((point) => (
					<li
						key={`${point.lead}${point.detail}`}
						className="text-[15px] text-text-sub-600 leading-relaxed dark:text-white/60"
					>
						{point.lead ? (
							<strong className="font-medium text-text-strong-950 dark:text-white">
								{point.lead}
							</strong>
						) : null}{" "}
						{point.detail}
					</li>
				))}
			</ul>
		</div>
	);
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
					...(page.faqs.length > 0 ? [faqPageJsonLd(page.faqs)] : []),
				]}
			/>
			<ComparisonPageShell
				pagePath={pagePath}
				competitorName={page.competitor}
				titleLines={[page.title]}
				description={page.description}
				updatedAt={page.publishedAt}
			>
				{page.competitorEdge.length > 0 || page.reloopEdge.length > 0 ? (
					<PageSection>
						<div className="flex flex-col gap-10 lg:flex-row lg:items-start">
							<EdgeList
								label={`${page.competitor}'s edge`}
								title={`Where ${page.competitor} is the better choice`}
								points={page.competitorEdge}
							/>
							<EdgeList
								label="Reloop's edge"
								title="Where Reloop is the better choice"
								points={page.reloopEdge}
							/>
						</div>
					</PageSection>
				) : null}

				<PageSection alt>
					<ComparisonTable
						competitorName={page.competitor}
						features={page.features}
					/>
				</PageSection>

				<PageSection narrow>
					<div className="flex justify-center">
						<Link
							href={`/blog/${page.postSlug}`}
							className="group inline-flex items-center gap-1.5 font-medium text-[15px] text-text-strong-950 dark:text-white"
						>
							Read the full {page.competitor} comparison and migration steps
							<Icon
								name="arrow-right"
								className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
								aria-hidden="true"
							/>
						</Link>
					</div>
				</PageSection>

				{page.faqs.length > 0 ? (
					<FaqSection
						id={`compare-${page.slug}-faq`}
						title={`${page.competitor} vs Reloop FAQ`}
						items={page.faqs}
						compact
						flush
					/>
				) : null}

				<PageSection>
					<CompareOtherLinks currentHref={pagePath} />
				</PageSection>
			</ComparisonPageShell>
		</>
	);
}
