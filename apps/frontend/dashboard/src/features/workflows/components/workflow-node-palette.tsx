"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Tooltip from "@reloop/ui/tooltip";
import { nodeTone } from "../node-tone";

interface WorkflowNodePaletteProps {
	onAddSendEmail: () => void;
	onAddDelay: () => void;
	onAddCondition: () => void;
}

const STEPS = [
	{
		tone: "delay" as const,
		onClickKey: "onAddDelay" as const,
	},
	{
		tone: "condition" as const,
		onClickKey: "onAddCondition" as const,
	},
	{
		tone: "send_email" as const,
		onClickKey: "onAddSendEmail" as const,
	},
];

export const WorkflowNodePalette = ({
	onAddSendEmail,
	onAddDelay,
	onAddCondition,
}: WorkflowNodePaletteProps) => {
	const actions = {
		onAddDelay,
		onAddCondition,
		onAddSendEmail,
	};

	return (
		<Tooltip.Provider delayDuration={200}>
			<div className="absolute top-4 left-4 z-10 flex flex-col gap-1 rounded-2xl border border-stroke-soft-200 bg-bg-white-0/95 p-1.5 shadow-regular-sm backdrop-blur-sm dark:border-stroke-soft-100/60 dark:bg-bg-white-0/90">
				<p className="px-1.5 pt-1 pb-1.5 font-mono text-[10px] text-text-soft-400 uppercase tracking-[0.14em]">
					Add
				</p>
				{STEPS.map((step) => {
					const meta = nodeTone[step.tone];
					return (
						<Tooltip.Root key={step.tone}>
							<Tooltip.Trigger asChild>
								<button
									type="button"
									onClick={actions[step.onClickKey]}
									aria-label={meta.label}
									className={cn(
										"flex h-9 w-9 items-center justify-center rounded-xl transition-[transform,background-color] duration-150 ease-out",
										"hover:bg-bg-weak-50 active:scale-[0.97]",
										meta.well,
									)}
								>
									<Icon name={meta.icon} className="h-4 w-4" />
								</button>
							</Tooltip.Trigger>
							<Tooltip.Content
								side="right"
								sideOffset={8}
								size="small"
								variant="dark"
							>
								{meta.label}
							</Tooltip.Content>
						</Tooltip.Root>
					);
				})}
			</div>
		</Tooltip.Provider>
	);
};
