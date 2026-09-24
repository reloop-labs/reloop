import { isPlanId, type PlanId, pricingPlans } from "@reloop/pricing";
import { cn } from "@reloop/ui/cn";

const KBD_BASE = "w-auto rounded-[5px] border font-semibold";

// Shelf shadow swaps to the dark keycap style in dark mode — light-mode
// tint tokens (feature/warning/amber) don't adapt and leak a color fringe.
const DARK_SHELF =
	"dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.55),0_0_0_0.5px_rgba(255,255,255,0.06),inset_0_0.5px_0_0_rgba(255,255,255,0.08)]";
const DARK_FLAT =
	"dark:border-white/[0.14] dark:bg-white/[0.07] dark:text-white";

const PLAN_BADGE_CLASS: Record<PlanId, string> = {
	free: `border-stroke-soft-200 bg-bg-weak-50 text-text-sub-600 shadow-[0_1.5px_0_0_var(--color-stroke-soft-200)] ${DARK_FLAT} ${DARK_SHELF}`,
	individual: `border-feature-light bg-feature-lighter text-feature-base shadow-[0_1.5px_0_0_var(--color-feature-light)] dark:border-feature-base/30 dark:bg-feature-base/10 ${DARK_SHELF}`,
	startup: `border-warning-light bg-warning-lighter text-warning-base shadow-[0_1.5px_0_0_var(--color-warning-light)] dark:border-warning-base/30 dark:bg-warning-base/10 ${DARK_SHELF}`,
	enterprise: `border-sky-500/25 bg-sky-500/10 text-sky-600 shadow-[0_1.5px_0_0_rgba(14,165,233,0.25)] dark:border-sky-400/25 dark:bg-sky-400/10 dark:text-sky-400 ${DARK_SHELF}`,
};

export function planLabel(planId: string | undefined): string {
	if (planId && isPlanId(planId)) {
		return pricingPlans.find((plan) => plan.id === planId)?.name ?? "Free";
	}
	return "Free";
}

export function PlanBadge({
	planId,
	compact = false,
}: {
	planId: string | undefined;
	compact?: boolean;
}) {
	const sizeClass = compact
		? "h-4 min-w-4 px-1 text-[9px] leading-none"
		: "h-[18px] min-w-4 px-1.5 text-[10px] leading-none";

	if (!planId || !isPlanId(planId)) {
		return (
			<span
				aria-hidden
				className={cn(
					"inline-flex shrink-0 animate-pulse rounded-[5px] bg-bg-weak-50",
					compact ? "h-4 w-10" : "h-[18px] w-14",
				)}
			/>
		);
	}

	const id: PlanId = planId;
	return (
		<span
			className={cn(
				"inline-flex shrink-0 items-center justify-center font-semibold uppercase",
				KBD_BASE,
				sizeClass,
				PLAN_BADGE_CLASS[id],
			)}
		>
			{planLabel(id)}
		</span>
	);
}
