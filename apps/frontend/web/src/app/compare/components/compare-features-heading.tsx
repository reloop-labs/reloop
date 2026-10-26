import { cn } from "@reloop/ui/cn";
import { costsCheckedAt } from "../compare-hero-costs";
import { getCompareSource } from "../compare-sources";

/** "2026-09-17" -> "on September 17, 2026"; no verified date falls back to the month we checked. */
function checkedPhrase(competitorName: string, checkedOn?: string): string {
	const iso = checkedOn ?? getCompareSource(competitorName)?.verifiedAt;
	if (!iso || !/^\d{4}-\d{2}-\d{2}/.test(iso)) return `in ${costsCheckedAt}`;
	const date = new Intl.DateTimeFormat("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
		timeZone: "UTC",
	}).format(new Date(iso));
	return `on ${date}`;
}

/**
 * Numbered section heading that introduces the feature table on every compare page.
 * Same type scale as the feature pages' section headings (e.g. "Developer first"), left-aligned.
 */
export function CompareFeaturesHeading({
	competitorName,
	checkedOn,
	className,
}: {
	competitorName: string;
	/** ISO date the comparison was checked, when it isn't the pricing source's date. */
	checkedOn?: string;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"px-4 py-16 text-left sm:px-8 sm:py-20 lg:px-12",
				className,
			)}
		>
			<span className="font-medium text-[13px] text-text-sub-600 dark:text-white/60">
				01 · Features
			</span>
			<h2 className="mt-3 text-balance font-semibold text-[2rem] text-text-strong-950 leading-[1.1] tracking-tight sm:text-[2.6rem] dark:text-white">
				Side by side
			</h2>
			<p className="mt-3 max-w-2xl text-pretty text-[15px] text-text-sub-600 leading-relaxed sm:text-base dark:text-white/60">
				From {competitorName}&apos;s pricing page and Reloop&apos;s,{" "}
				{checkedPhrase(competitorName, checkedOn)}. Where {competitorName} does
				more, the table says so.
			</p>
		</div>
	);
}
