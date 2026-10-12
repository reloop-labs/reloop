import { Icon } from "@reloop/ui/icon";

function formatGrantedDate(value: string): string {
	const d = new Date(value);
	if (Number.isNaN(d.getTime())) return "";
	return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/** Shown when a Reloop admin upgraded the organization's plan. */
export function GrantedPlanBanner({
	planName,
	grantedAt,
}: {
	planName: string;
	grantedAt: string;
}) {
	return (
		<div className="flex items-start gap-3 rounded-2xl border border-stroke-soft-100 bg-bg-weak-50 p-4 dark:border-stroke-soft-100/40 dark:bg-white/[0.04]">
			<Icon
				name="gift"
				className="mt-px h-4 w-4 shrink-0 text-text-strong-950"
			/>
			<div className="min-w-0">
				<p className="font-medium text-paragraph-sm text-text-strong-950">
					You&apos;ve been upgraded to the {planName} plan
				</p>
				<p className="mt-0.5 text-paragraph-xs text-text-sub-600">
					The Reloop team upgraded this organization on{" "}
					{formatGrantedDate(grantedAt)}. Enjoy the higher limits.
				</p>
			</div>
		</div>
	);
}
