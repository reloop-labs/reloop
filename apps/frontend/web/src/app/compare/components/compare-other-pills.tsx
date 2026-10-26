import { Icon } from "@reloop/ui/icon";
import { listBlogComparePages } from "@reloop/web/lib/blog-compare-pages";
import Link from "next/link";
import { competitorBrands } from "../competitor-brands";

/** "Other comparisons" as a bordered link grid, plus the trademark and freshness note. */
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
		<section>
			<h2 className="px-4 pt-16 pb-6 font-medium text-[15px] text-text-strong-950 sm:px-8 sm:pt-20 lg:px-12 dark:text-white">
				Other comparisons
			</h2>
			{/* Bordered cells like the price table; the last column drops its right edge into the frame. */}
			<ul className="grid grid-cols-2 border-stroke-soft-100 border-t sm:grid-cols-3 lg:grid-cols-4 dark:border-white/10 max-sm:[&>li:nth-child(2n)]:border-r-0 sm:max-lg:[&>li:nth-child(3n)]:border-r-0 lg:[&>li:nth-child(4n)]:border-r-0">
				{links.map((link) => (
					<li
						key={link.href}
						className="border-stroke-soft-100 border-r border-b dark:border-white/10"
					>
						<Link
							href={link.href}
							className="group flex h-full min-h-[64px] items-center justify-between gap-3 px-4 py-4 text-[14px] text-text-strong-950 transition-colors hover:bg-bg-weak-50 sm:px-8 lg:px-12 dark:text-white dark:hover:bg-white/[0.04]"
						>
							<span>
								<span className="text-text-sub-600 dark:text-white/50">
									Reloop vs{" "}
								</span>
								{link.name}
							</span>
							<Icon
								name="arrow-up-right"
								className="group-hover:-translate-y-0.5 size-3.5 shrink-0 text-text-sub-600 transition-transform duration-200 group-hover:translate-x-0.5 dark:text-white/50"
								aria-hidden="true"
							/>
						</Link>
					</li>
				))}
			</ul>
			<p className="max-w-3xl px-4 py-10 text-[13px] text-text-sub-600 leading-relaxed sm:px-8 lg:px-12 dark:text-white/45">
				{competitorName} is a trademark of its owner, shown here to name the
				product compared. Reloop isn&apos;t affiliated with {competitorName}.
				Prices and features come from{" "}
				{sourceHost ?? `${competitorName}'s website`} as of {checkedOn} and may
				have changed since.
			</p>
		</section>
	);
}
