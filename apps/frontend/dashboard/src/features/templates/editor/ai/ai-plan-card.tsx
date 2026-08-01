import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import type { AiPlan } from "./types";

export function AiPlanCard({
	plan,
	onExecute,
	disabled,
}: {
	plan: AiPlan;
	onExecute: (plan: AiPlan) => void;
	disabled?: boolean;
}) {
	return (
		<div className="mt-2 overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 dark:border-stroke-soft-100/40">
			<div className="border-stroke-soft-100 border-b bg-bg-weak-50 px-3 py-2 dark:border-stroke-soft-100/40">
				<div className="flex items-center gap-1.5">
					<Icon name="list" className="h-3.5 w-3.5 text-text-sub-600" />
					<span className="font-semibold text-label-xs text-text-strong-950">
						Plan
					</span>
				</div>
				<p className="mt-1 text-paragraph-xs text-text-sub-600">
					{plan.summary}
				</p>
			</div>
			<ul className="space-y-0.5 p-2">
				{plan.steps.map((step, i) => (
					<li
						key={step.id}
						className={cn(
							"flex gap-2 rounded-lg px-2 py-1.5 text-paragraph-xs",
							"text-text-sub-600",
						)}
					>
						<span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-bg-weak-50 font-semibold text-[10px] text-text-soft-400">
							{i + 1}
						</span>
						<div className="min-w-0">
							<p className="font-medium text-text-strong-950">{step.title}</p>
							{step.detail ? (
								<p className="mt-0.5 text-text-soft-400">{step.detail}</p>
							) : null}
						</div>
					</li>
				))}
			</ul>
			<div className="flex items-center justify-end gap-2 border-stroke-soft-100 border-t px-3 py-2 dark:border-stroke-soft-100/40">
				<FancyButton.Root
					type="button"
					variant="neutral"
					size="xsmall"
					disabled={disabled}
					onClick={() => onExecute(plan)}
					className="gap-1.5"
				>
					<FancyButton.Icon as={Icon} name="sparkling" />
					Execute plan
				</FancyButton.Root>
			</div>
		</div>
	);
}
