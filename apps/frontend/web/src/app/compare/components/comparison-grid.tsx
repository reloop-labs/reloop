import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { BlogPostCoverImage } from "@reloop/web/components/landing/blog/blog-post-cover-image";
import { listBlogComparePages } from "@reloop/web/lib/blog-compare-pages";
import { listMigrationGuides } from "@reloop/web/lib/migration-guides";
import Link from "next/link";
import { type CostMode, formatUsd, quoteCosts } from "../compare-hero-costs";
import { competitorBrands } from "../competitor-brands";

type CardQuote = { reloop: string; theirs: string; plan: string };

type BrandCard = {
	mode: CostMode;
	volume: number;
	blurb: (quote: CardQuote) => string;
};

/** Card copy per competitor; prices come from the same quotes as the calculator. */
const BRAND_CARDS: Record<string, BrandCard> = {
	Resend: {
		mode: "transactional",
		volume: 100_000,
		blurb: (q) =>
			`Resend's free plan sends 3,000 emails a month; Reloop's sends 6,000. At 100,000 emails Reloop costs ${q.reloop} a month and Resend ${q.theirs}, and Reloop is open source.`,
	},
	Mailgun: {
		mode: "transactional",
		volume: 100_000,
		blurb: (q) =>
			`Mailgun bills $1.10 to $1.80 per 1,000 emails past the plan. At 100,000 emails Reloop costs ${q.reloop} a month and Mailgun ${q.plan} ${q.theirs}.`,
	},
	SendGrid: {
		mode: "transactional",
		volume: 100_000,
		blurb: (q) =>
			`SendGrid's free plan is a 60-day trial at 100 emails a day. At 100,000 emails Reloop costs ${q.reloop} a month and SendGrid ${q.plan} ${q.theirs}.`,
	},
	"AWS SES": {
		mode: "transactional",
		volume: 100_000,
		blurb: (q) =>
			`SES is the cheapest pipe at $0.10 per 1,000 emails, with no dashboard, templates or contacts. Reloop adds all three for ${q.reloop} a month at 100,000.`,
	},
	Postmark: {
		mode: "transactional",
		volume: 100_000,
		blurb: (q) =>
			`Postmark's free plan is 100 emails a month. At 100,000 emails Reloop costs ${q.reloop} a month and Postmark ${q.plan} ${q.theirs}.`,
	},
	Loops: {
		mode: "marketing",
		volume: 10_000,
		blurb: (q) =>
			`Loops prices by contacts. At 10,000 contacts and a weekly send, Reloop costs ${q.reloop} a month and Loops ${q.theirs}, with no limit on contacts.`,
	},
	Mailchimp: {
		mode: "marketing",
		volume: 10_000,
		blurb: (q) =>
			`Mailchimp charges for every contact on the list. At 10,000 contacts and a weekly send, Reloop costs ${q.reloop} a month and Mailchimp ${q.plan} ${q.theirs}.`,
	},
};

const compactCount = (value: number) =>
	new Intl.NumberFormat("en-US").format(value);

function quoteFor(card: BrandCard, providerId: string): CardQuote {
	const rows = quoteCosts(card.mode, card.volume);
	const reloop = rows.find((row) => row.id === "reloop");
	const theirs = rows.find((row) => row.id === providerId);
	return {
		reloop: formatUsd(reloop?.usd ?? 0).toLowerCase(),
		theirs: formatUsd(theirs?.usd ?? 0).toLowerCase(),
		plan: theirs?.plan ?? "",
	};
}

type ComparisonEntry = {
	name: string;
	href: string;
	/** Cover image from the matching "Reloop vs X" blog post. */
	image: string;
	description: string;
	pricing?: { card: BrandCard; quote: CardQuote };
	migrationHref?: string;
};

/** Hand-written /compare pages first, then the pages built from "Reloop vs X" posts. */
function getComparisonEntries(includeBlogPosts: boolean): ComparisonEntry[] {
	const guideSlugs = new Set(listMigrationGuides().map((guide) => guide.slug));
	const dedicated = competitorBrands.map((brand): ComparisonEntry => {
		const slug = brand.href.replace("/compare/", "");
		const card = BRAND_CARDS[brand.name];
		const quote = card ? quoteFor(card, slug) : null;
		return {
			name: brand.name,
			href: brand.href,
			image: `/blog/images/reloop-vs-${slug}.png`,
			description:
				card && quote
					? card.blurb(quote)
					: "Compare Reloop's open-source engine, pricing and features.",
			pricing: card && quote ? { card, quote } : undefined,
			migrationHref: guideSlugs.has(slug) ? `/migrate/${slug}` : undefined,
		};
	});
	if (!includeBlogPosts) return dedicated;

	const fromBlog = listBlogComparePages()
		.filter((page) => page.image)
		.map(
			(page): ComparisonEntry => ({
				name: page.competitor,
				href: `/compare/${page.slug}`,
				image: page.image ?? "",
				description: page.description,
				migrationHref: guideSlugs.has(page.slug)
					? `/migrate/${page.slug}`
					: undefined,
			}),
		);

	return [...dedicated, ...fromBlog];
}

function ComparisonBrandCard({
	entry,
	padded,
}: {
	entry: ComparisonEntry;
	padded: boolean;
}) {
	const { pricing } = entry;

	return (
		<article
			className={cn(
				"group relative flex h-full flex-col transition-colors duration-200",
				padded &&
					"px-4 py-12 hover:bg-bg-weak-50 sm:px-8 sm:py-14 lg:px-12 lg:py-16 dark:hover:bg-white/[0.04]",
			)}
		>
			<BlogPostCoverImage
				slug={entry.href}
				image={entry.image}
				alt={`Reloop vs ${entry.name}`}
				variant="list"
			/>

			<h3 className="mt-5 font-semibold text-[16px] text-text-strong-950 leading-[1.45] tracking-[-0.01em] dark:text-white">
				<Link
					href={entry.href}
					className="outline-none after:absolute after:inset-0 focus-visible:underline"
				>
					Reloop vs {entry.name}
				</Link>
			</h3>
			<p className="mt-2 line-clamp-4 flex-1 text-pretty text-[14px] text-text-sub-600 leading-relaxed dark:text-white/55">
				{entry.description}
			</p>

			{pricing ? (
				<p className="mt-5 rounded-lg bg-bg-weak-50 px-3 py-2 text-[13px] text-text-sub-600 tabular-nums dark:bg-white/[0.05] dark:text-white/50">
					{compactCount(pricing.card.volume)}{" "}
					{pricing.card.mode === "marketing" ? "contacts" : "emails"}:{" "}
					<span className="font-medium text-text-strong-950 dark:text-white">
						{pricing.quote.reloop}
					</span>{" "}
					vs{" "}
					<span className="font-medium text-text-strong-950 dark:text-white">
						{pricing.quote.theirs}
					</span>
				</p>
			) : null}

			<div className="relative z-10 mt-5 flex items-center gap-5 text-[14px]">
				<Link
					href={entry.href}
					tabIndex={-1}
					className="group/link inline-flex items-center gap-1.5 font-medium text-text-strong-950 dark:text-white"
				>
					Compare
					<Icon
						name="arrow-right"
						className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
						aria-hidden="true"
					/>
				</Link>
				{entry.migrationHref ? (
					<Link
						href={entry.migrationHref}
						className="text-text-sub-600 transition-colors hover:text-text-strong-950 dark:text-white/50 dark:hover:text-white"
					>
						Migration guide
						<span className="sr-only"> from {entry.name}</span>
					</Link>
				) : null}
			</div>
		</article>
	);
}

/**
 * "cells" draws blog-index style bordered cells that meet the page frame and
 * lists every comparison; "grid" is a plain gapped grid for padded sections
 * and lists only the dedicated /compare pages.
 */
export function ComparisonBrandCards({
	excludeHref,
	layout = "grid",
}: {
	excludeHref?: string;
	layout?: "cells" | "grid";
}) {
	const entries = getComparisonEntries(layout === "cells").filter(
		(entry) => entry.href !== excludeHref,
	);

	if (layout === "cells") {
		// -mb-px lets the last row's border sit under the next section's top rule.
		return (
			<ul className="-mb-px grid sm:grid-cols-2 lg:grid-cols-3">
				{entries.map((entry) => (
					<li
						key={entry.href}
						className="border-stroke-soft-100 border-b sm:border-r dark:border-white/10 sm:max-lg:[&:nth-child(2n)]:border-r-0 lg:[&:nth-child(3n)]:border-r-0"
					>
						<ComparisonBrandCard entry={entry} padded />
					</li>
				))}
			</ul>
		);
	}

	return (
		<ul className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
			{entries.map((entry) => (
				<li key={entry.href}>
					<ComparisonBrandCard entry={entry} padded={false} />
				</li>
			))}
		</ul>
	);
}

export function ComparisonGrid() {
	return (
		<section className="w-full bg-bg-white-0 text-text-strong-950 dark:bg-black dark:text-white">
			{/* Left-Aligned Header with Comparison Icon */}
			<div className="flex flex-col items-start gap-2.5 px-6 py-12 sm:px-10 sm:py-14 lg:px-12">
				<svg
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					className="size-5 text-text-strong-950 dark:text-white"
					aria-hidden="true"
				>
					<path
						d="M12 3L12 21M12 4.30969C11.0904 4.30969 10.1808 4.41019 9.28927 4.61121C6.82045 5.16789 4.89278 7.02094 4.31367 9.39419C3.89544 11.1081 3.89544 12.8918 4.31367 14.6058C4.89278 16.979 6.82045 18.8321 9.28928 19.3887C10.1808 19.5898 11.0904 19.6903 12 19.6903"
						stroke="currentColor"
						strokeWidth="1.5"
						strokeLinecap="round"
					/>
					<path
						d="M14.7107 19.3887C17.1795 18.8321 19.1072 16.979 19.6863 14.6058C20.1045 12.8918 20.1045 11.1081 19.6863 9.39419C19.1072 7.02094 17.1795 5.16789 14.7107 4.61121"
						stroke="currentColor"
						strokeWidth="1.5"
						strokeLinecap="round"
					/>
				</svg>
				<h2 className="font-semibold text-text-strong-950 text-xl tracking-tight sm:text-2xl lg:text-[1.65rem] dark:text-white">
					Explore dedicated provider comparisons.
				</h2>
			</div>

			{/* Full-width Divider & Grid Section */}
			<div className="border-stroke-soft-100 border-t dark:border-white/10">
				<ComparisonBrandCards layout="cells" />
			</div>
		</section>
	);
}
