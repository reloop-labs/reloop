import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import type { SuppressionSource } from "../../hooks/use-contacts-query";

const SOURCE_CONFIG: Record<
	SuppressionSource,
	{ label: string; icon: string; title: string }
> = {
	system: {
		label: "System",
		icon: "robot",
		title: "Suppressed automatically after a bounce or complaint",
	},
	manual: {
		label: "Manual",
		icon: "user",
		title: "Added to the suppression list by a person",
	},
};

/** Keycap badge (same shape as ContactStatusBadge) showing who suppressed an address. */
export function SuppressionSourceBadge({
	source,
	className,
}: {
	source: SuppressionSource;
	className?: string;
}) {
	const config = SOURCE_CONFIG[source];
	return (
		<span
			title={config.title}
			className={cn(
				"inline-flex shrink-0 items-center justify-center rounded-[5px] bg-neutral-alpha-16 p-px pb-[2px]",
				className,
			)}
		>
			<span className="flex h-5 items-center gap-1.5 rounded-[4px] bg-bg-weak-50 px-2 text-text-sub-600 shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.9)] dark:shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.05)]">
				<Icon name={config.icon} className="size-3 shrink-0" />
				<span className="font-medium text-[12px] leading-none tracking-tight">
					{config.label}
				</span>
			</span>
		</span>
	);
}
