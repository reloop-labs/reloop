import { cn } from "@reloop/ui/cn";
import Link from "next/link";
import { type ComparePriceCell, getComparePricing } from "../compare-pricing";

function PriceCell({
	cell,
	emphasize,
}: {
	cell: ComparePriceCell;
	emphasize?: boolean;
}) {
	return (
		<div className="min-w-0">
			<p
				className={cn(
					"font-semibold text-[15px] leading-snug tracking-tight sm:text-[16px]",
					emphasize
						? "text-text-strong-950 dark:text-white"
						: "text-text-sub-600 dark:text-white/70",
				)}
			>
				{cell.value}
			</p>
			{cell.note ? (
				<p className="mt-0.5 text-[12px] text-text-sub-600 leading-snug dark:text-white/40">
					{cell.note}
				</p>
			) : null}
		</div>
	);
}

export function CompareHeroPricing({
	competitorName,
}: {
	competitorName: string;
}) {
	const pricing = getComparePricing(competitorName);

	return (
		<div className="relative">
			<div className="flex items-center justify-between gap-4 border-stroke-soft-200 border-b border-dashed px-5 py-3 sm:px-8 dark:border-white/10">
				<div className="flex min-w-0 flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
					<span className="font-mono text-[10px] text-text-sub-600 uppercase tracking-[0.14em] dark:text-white/40">
						[Pricing]
					</span>
					<span className="truncate text-[12px] text-text-sub-600 dark:text-white/45">
						{pricing.model}
					</span>
				</div>
				<Link
					href="/pricing"
					className="shrink-0 font-mono text-[10px] text-text-sub-600 uppercase tracking-[0.12em] transition-colors hover:text-text-strong-950 dark:text-white/40 dark:hover:text-white"
				>
					Reloop plans ↗
				</Link>
			</div>

			<table className="w-full border-separate border-spacing-0 border-stroke-soft-200 border-b dark:border-white/10">
				<caption className="sr-only">
					Reloop vs {competitorName} list prices
				</caption>
				<thead>
					<tr className="grid grid-cols-2 sm:table-row">
						<th
							scope="col"
							className="hidden border-stroke-soft-200 border-b border-dashed px-5 py-3 text-left sm:table-cell sm:w-[22%] sm:px-8 dark:border-white/10"
						>
							<span className="sr-only">Plan</span>
						</th>
						<th
							scope="col"
							className="border-stroke-soft-200 border-b border-dashed bg-bg-weak-50/70 px-5 py-3 text-left sm:w-[39%] sm:border-l sm:px-6 dark:border-white/10 dark:bg-white/[0.03]"
						>
							<span className="font-semibold text-[13px] text-text-strong-950 dark:text-white">
								Reloop
							</span>
						</th>
						<th
							scope="col"
							className="border-stroke-soft-200 border-b border-dashed px-5 py-3 text-left sm:w-[39%] sm:border-l sm:px-6 dark:border-white/10"
						>
							<span className="font-semibold text-[13px] text-text-strong-950 dark:text-white">
								{competitorName}
							</span>
						</th>
					</tr>
				</thead>
				<tbody>
					{pricing.rows.map((row, index) => {
						const isLast = index === pricing.rows.length - 1;
						const rule = !isLast
							? "border-stroke-soft-200 border-b border-dashed dark:border-white/10"
							: "";
						return (
							<tr key={row.id} className="grid grid-cols-2 sm:table-row">
								<th
									scope="row"
									className={cn(
										"col-span-2 px-5 pt-4 pb-1 text-left font-normal sm:col-span-1 sm:table-cell sm:px-8 sm:py-4",
										!isLast &&
											"sm:border-stroke-soft-200 sm:border-b sm:border-dashed dark:sm:border-white/10",
									)}
								>
									<span className="font-mono text-[10px] text-text-sub-600 uppercase tracking-[0.14em] dark:text-white/40">
										{row.label}
									</span>
								</th>
								<td
									className={cn(
										"bg-bg-weak-50/70 px-5 pt-1 pb-4 align-top sm:border-stroke-soft-200 sm:border-l sm:border-dashed sm:px-6 sm:py-4 dark:bg-white/[0.03] dark:sm:border-white/10",
										rule,
									)}
								>
									<PriceCell cell={row.reloop} emphasize />
								</td>
								<td
									className={cn(
										"px-5 pt-1 pb-4 align-top sm:border-stroke-soft-200 sm:border-l sm:border-dashed sm:px-6 sm:py-4 dark:sm:border-white/10",
										rule,
									)}
								>
									<PriceCell cell={row.competitor} />
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>

			<p className="px-5 py-3 text-[11px] text-text-sub-600 leading-relaxed sm:px-8 dark:text-white/35">
				Reloop prices match{" "}
				<Link
					href="/pricing"
					className="underline decoration-stroke-soft-200 underline-offset-2 transition-colors hover:text-text-strong-950 dark:decoration-white/20 dark:hover:text-white"
				>
					published plans
				</Link>
				. {competitorName} figures are public list prices and can change.
			</p>
		</div>
	);
}
