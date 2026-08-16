import { cn } from "@reloop/ui/cn";
import { Skeleton } from "@reloop/ui/skeleton";
import {
	formatMetricCount,
	formatMetricPercent,
	type HealthCardModel,
	ratingLabel,
} from "../health-ratings";

type HealthCardsProps = {
	cards: HealthCardModel[];
	isLoading?: boolean;
};

export function HealthCards({ cards, isLoading = false }: HealthCardsProps) {
	if (isLoading) {
		return (
			<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
				{["deliverability", "reputation", "engagement"].map((id) => (
					<HealthCardSkeleton key={id} />
				))}
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
			{cards.map((card) => (
				<HealthCard key={card.id} card={card} />
			))}
		</div>
	);
}

function HealthCard({ card }: { card: HealthCardModel }) {
	return (
		<section
			aria-labelledby={`health-card-${card.id}`}
			className="flex flex-col rounded-2xl border border-stroke-soft-100 bg-bg-white-0 px-5 pt-5 pb-2 shadow-[0_1px_2px_rgba(0,0,0,0.02)] dark:border-white/5 dark:bg-white/[0.01]"
		>
			<h2
				id={`health-card-${card.id}`}
				className="font-medium text-[11px] text-text-soft-400 uppercase tracking-[0.08em]"
			>
				{card.title}
			</h2>
			<p
				className={cn(
					"mt-2 whitespace-nowrap font-semibold text-[28px] tracking-tight",
					card.rating
						? "text-text-strong-950 dark:text-white"
						: "text-text-soft-400",
				)}
			>
				{ratingLabel(card.rating)}
			</p>

			<ul className="mt-8">
				{card.rows.map((row, index) => (
					<li
						key={row.label}
						className={cn(
							"flex items-center justify-between py-3",
							index < card.rows.length - 1 &&
								"border-stroke-soft-100 border-b dark:border-white/10",
						)}
					>
						<div className="flex min-w-0 items-center gap-2.5">
							<span
								aria-hidden
								className="size-2 shrink-0 rounded-full"
								style={{ backgroundColor: row.color }}
							/>
							<span className="truncate text-[13px] text-text-sub-600">
								{row.label}
							</span>
						</div>
						<div className="flex items-baseline gap-3 tabular-nums">
							<span className="text-[13px] text-text-soft-400">
								{formatMetricCount(row.count)}
							</span>
							<span className="w-12 text-right text-[13px] text-text-soft-400">
								{formatMetricPercent(row.percent)}
							</span>
						</div>
					</li>
				))}
			</ul>
		</section>
	);
}

function HealthCardSkeleton() {
	return (
		<div className="flex flex-col rounded-2xl border border-stroke-soft-100 bg-bg-white-0 px-5 pt-5 pb-2 dark:border-white/5 dark:bg-white/[0.01]">
			<Skeleton className="h-3 w-24" />
			<Skeleton className="mt-3 h-8 w-20" />
			<div className="mt-8 space-y-0">
				<div className="flex items-center justify-between border-stroke-soft-100 border-b py-3 dark:border-white/10">
					<Skeleton className="h-4 w-16" />
					<Skeleton className="h-4 w-20" />
				</div>
				<div className="flex items-center justify-between py-3">
					<Skeleton className="h-4 w-20" />
					<Skeleton className="h-4 w-20" />
				</div>
			</div>
		</div>
	);
}
