"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { nodeTone, type WorkflowNodeTone } from "../node-tone";
import type { InsertStepKind } from "./node-editor-context";

export const PICKER_SECTIONS: {
	label: string;
	items: { kind: InsertStepKind; tone: WorkflowNodeTone }[];
}[] = [
	{
		label: "Messages",
		items: [{ kind: "send_email", tone: "send_email" }],
	},
	{
		label: "Flow control",
		items: [
			{ kind: "condition", tone: "condition" },
			{ kind: "delay", tone: "delay" },
		],
	},
];

/** Floating step picker panel (Messages / Flow control), positioned by the parent. */
export const StepPickerMenu = ({
	onPick,
}: {
	onPick: (kind: InsertStepKind) => void;
}) => {
	return (
		<div className="absolute top-full left-1/2 z-50 mt-2 w-64 -translate-x-1/2 rounded-2xl border border-stroke-soft-100 bg-bg-white-0 p-2 shadow-regular-md dark:border-stroke-soft-100/40 dark:bg-black">
			{PICKER_SECTIONS.map((section) => (
				<div key={section.label}>
					<p className="px-2 pt-2 pb-1 text-[13px] text-text-sub-600">
						{section.label}
					</p>
					{section.items.map((item) => {
						const meta = nodeTone[item.tone];
						return (
							<button
								key={item.kind}
								type="button"
								onClick={() => onPick(item.kind)}
								className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left transition-colors hover:bg-bg-weak-50 dark:hover:bg-white/[0.06]"
							>
								<span
									className={cn(
										"flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border bg-transparent",
										meta.iconBorder,
									)}
								>
									<Icon
										name={meta.icon}
										className={cn("h-4 w-4", meta.iconClass)}
									/>
								</span>
								<span className="text-[14px] text-text-strong-950">
									{meta.label}
								</span>
							</button>
						);
					})}
				</div>
			))}
		</div>
	);
};
