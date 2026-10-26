import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { JsonLd } from "@reloop/web/components/json-ld";
import {
	getMigrationGuide,
	listMigrationGuides,
} from "@reloop/web/lib/migration-guides";
import { breadcrumbJsonLd } from "@reloop/web/lib/schema";
import { getSiteUrl, hostedSignupHref } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { InlineMarkdown } from "../components/inline-markdown";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

type Props = {
	params: Promise<{ slug: string }>;
};

/** One guide per "Reloop vs X" post with switching steps. */
export function generateStaticParams() {
	return listMigrationGuides().map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug } = await params;
	const guide = getMigrationGuide(slug);
	if (!guide) return {};

	const url = `${getSiteUrl()}/migrate/${guide.slug}`;
	const title = `Migrate from ${guide.competitor} to Reloop`;
	return {
		title: `${title} | Step-by-step guide`,
		description: guide.description,
		keywords: [
			`migrate from ${guide.competitor}`,
			`${guide.competitor} to Reloop`,
			`${guide.competitor} alternative`,
			`switch from ${guide.competitor}`,
		],
		openGraph: {
			title,
			description: guide.description,
			type: "website",
			url,
			siteName: "Reloop",
			images: guide.image ? [{ url: guide.image, alt: title }] : undefined,
		},
		twitter: {
			card: "summary_large_image",
			title,
			description: guide.description,
			images: guide.image ? [guide.image] : undefined,
		},
		alternates: { canonical: url },
	};
}

/** Drops inline markdown for JSON-LD text. */
function plain(text: string): string {
	return text
		.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
		.replace(/\*\*([^*]+)\*\*/g, "$1")
		.replace(/`([^`]+)`/g, "$1");
}

export default async function MigrationGuidePage({ params }: Props) {
	const { slug } = await params;
	const guide = getMigrationGuide(slug);
	if (!guide) notFound();

	const pagePath = `/migrate/${guide.slug}`;
	const title = `Migrate from ${guide.competitor} to Reloop`;

	return (
		<>
			<JsonLd
				data={[
					breadcrumbJsonLd([
						{ name: "Compare", path: "/compare" },
						{
							name: `Reloop vs ${guide.competitor}`,
							path: `/compare/${guide.slug}`,
						},
						{ name: title, path: pagePath },
					]),
					{
						"@context": "https://schema.org",
						"@type": "HowTo",
						name: title,
						description: guide.description,
						url: `${getSiteUrl()}${pagePath}`,
						step: guide.steps.map((step, index) => ({
							"@type": "HowToStep",
							position: index + 1,
							name: plain(step.title),
							text: plain(step.detail || step.title),
						})),
					},
				]}
			/>
			<div className="mx-auto flex w-full max-w-5xl flex-col border-stroke-soft-100 border-x md:max-w-7xl dark:border-white/10">
				<header className="border-stroke-soft-100 border-b dark:border-white/10">
					<div className="flex flex-col items-center px-4 pt-28 pb-16 text-center sm:px-8 sm:pt-40 sm:pb-20 lg:px-12">
						<Link
							href={`/compare/${guide.slug}`}
							className="font-medium text-[13px] text-text-sub-600 transition-colors hover:text-text-strong-950 dark:text-white/50 dark:hover:text-white"
						>
							Reloop vs {guide.competitor}
						</Link>
						<h1 className="mt-4 max-w-4xl text-balance font-semibold text-[2rem] text-text-strong-950 leading-[1.06] tracking-[-0.04em] sm:text-[3.5rem] lg:text-[4.1rem] dark:text-white">
							{title}.
						</h1>
						<p className="mt-4 max-w-[42rem] text-balance text-[15px] text-text-sub-600 leading-relaxed sm:mt-6 sm:text-[18.5px] dark:text-white/60">
							{guide.intro.length > 0 ? (
								<InlineMarkdown text={guide.intro.join(" ")} />
							) : (
								`${guide.steps.length} steps. Keep ${guide.competitor} running until the last one, so nothing breaks while you switch.`
							)}
						</p>
						<div className="mt-7 flex flex-wrap items-center justify-center gap-3 sm:mt-9 sm:gap-4">
							<FancyButton.Root
								asChild
								variant="neutral"
								size="medium"
								className="h-10 rounded-xl px-5 font-medium text-[14.5px] sm:h-11 sm:px-6 sm:text-[15.5px]"
							>
								<a href={hostedSignupHref}>Start for free</a>
							</FancyButton.Root>
							<FancyButton.Root
								asChild
								variant="basic"
								size="medium"
								className="h-10 rounded-xl px-5 font-medium text-[14.5px] sm:h-11 sm:px-6 sm:text-[15.5px]"
							>
								<Link href={`/compare/${guide.slug}`}>Compare first</Link>
							</FancyButton.Root>
						</div>
					</div>
				</header>

				<ol>
					{guide.steps.map((step, index) => (
						<li
							key={step.title}
							className="grid gap-4 border-stroke-soft-100 border-b px-4 py-10 sm:grid-cols-[4rem_1fr_auto] sm:gap-8 sm:px-10 lg:px-12 dark:border-white/10"
						>
							<span className="flex size-9 items-center justify-center rounded-full border border-stroke-soft-100 font-medium text-[14px] text-text-strong-950 tabular-nums dark:border-white/10 dark:text-white">
								{index + 1}
							</span>
							<div className="min-w-0 max-w-2xl">
								<h2 className="font-semibold text-[18px] text-text-strong-950 tracking-tight dark:text-white">
									<InlineMarkdown text={step.title} />
								</h2>
								{step.detail ? (
									<p className="mt-2 text-pretty text-[15px] text-text-sub-600 leading-relaxed dark:text-white/60">
										<InlineMarkdown text={step.detail} />
									</p>
								) : null}
							</div>
							{step.effort ? (
								<span className="h-fit self-start rounded-full bg-bg-weak-50 px-2.5 py-1 text-[12.5px] text-text-sub-600 dark:bg-white/[0.06] dark:text-white/55">
									{step.effort}
								</span>
							) : null}
						</li>
					))}
				</ol>

				<section className="flex flex-col gap-4 border-stroke-soft-100 border-b px-4 py-12 sm:px-10 lg:px-12 dark:border-white/10">
					{guide.notes.map((note) => (
						<p
							key={note}
							className="max-w-3xl text-pretty text-[15px] text-text-sub-600 leading-relaxed dark:text-white/60"
						>
							<InlineMarkdown text={note} />
						</p>
					))}
					<div className="flex flex-wrap gap-x-6 gap-y-2 text-[14px]">
						{guide.fullGuideSlug ? (
							<Link
								href={`/blog/${guide.fullGuideSlug}`}
								className="group inline-flex items-center gap-1.5 font-medium text-text-strong-950 dark:text-white"
							>
								Full {guide.competitor} migration playbook
								<Icon
									name="arrow-right"
									className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
									aria-hidden="true"
								/>
							</Link>
						) : null}
						<Link
							href={`/compare/${guide.slug}`}
							className="group inline-flex items-center gap-1.5 font-medium text-text-strong-950 dark:text-white"
						>
							Reloop vs {guide.competitor}
							<Icon
								name="arrow-right"
								className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
								aria-hidden="true"
							/>
						</Link>
						<Link
							href={`/blog/${guide.postSlug}`}
							className="text-text-sub-600 transition-colors hover:text-text-strong-950 dark:text-white/55 dark:hover:text-white"
						>
							Read the full comparison post
						</Link>
					</div>
				</section>
			</div>
		</>
	);
}
