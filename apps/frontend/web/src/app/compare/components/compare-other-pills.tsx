import { Icon } from "@reloop/ui/icon";
import { listBlogComparePages } from "@reloop/web/lib/blog-compare-pages";
import Link from "next/link";
import { competitorBrands } from "../competitor-brands";

/** "Other comparisons" as pill links, plus the trademark and freshness note. */
export function CompareOtherPills({
	currentHref,
	competitorName,
	sourceHost,
	checkedOn,
}: {
	currentHref: string;
	competitorName: string;
	/** e.g. "resend.com" */
	sourceHost?: string;
	checkedOn: string;
}) {
	const links = [
		...competitorBrands.map((brand) => ({
			name: brand.name,
			href: brand.href,
		})),
		...listBlogComparePages().map((page) => ({
			name: page.competitor,
			href: `/compare/${page.slug}`,
		})),
	].filter((link) => link.href !== currentHref);

	return (
		<section className="px-4 py-12 sm:px-8 sm:py-16 lg:px-12">
			<h2 className="font-medium text-[15px] text-text-strong-950 dark:text-white">
				Other comparisons
			</h2>
			<ul className="mt-5 flex flex-wrap gap-2.5">
				{links.map((link) => (
					<li key={link.href}>
						<Link
							href={link.href}
							className="group inline-flex h-10 items-center gap-2 rounded-full border border-stroke-soft-100 bg-bg-white-0 px-4 text-[14px] text-text-strong-950 transition-colors hover:bg-bg-weak-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:hover:bg-white/[0.07]"
						>
							Reloop vs {link.name}
							<Icon
								name="arrow-up-right"
								className="group-hover:-translate-y-0.5 size-3.5 text-text-sub-600 transition-transform duration-200 group-hover:translate-x-0.5 dark:text-white/50"
								aria-hidden="true"
							/>
						</Link>
					</li>
				))}
			</ul>
			<p className="mt-8 max-w-3xl text-[13px] text-text-sub-600 leading-relaxed dark:text-white/45">
				{competitorName} is a trademark of its owner, shown here to name the
				product compared. Reloop isn&apos;t affiliated with {competitorName}.
				Prices and features come from{" "}
				{sourceHost ?? `${competitorName}'s website`} as of {checkedOn} and may
				have changed since.
			</p>
		</section>
	);
}
