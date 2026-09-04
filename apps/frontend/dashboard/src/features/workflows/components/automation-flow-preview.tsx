"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { nodeTone } from "../node-tone";

const STEPS = [
	{ tone: "trigger" as const, title: "Signed up" },
	{ tone: "delay" as const, title: "Wait 1 day" },
	{ tone: "send_email" as const, title: "Welcome email" },
] as const;

export function AutomationFlowPreview({
	caption,
	className,
}: {
	caption?: string;
	className?: string;
}) {
	return (
		<aside
			className={cn(
				"flex flex-col justify-center rounded-2xl border border-stroke-soft-100 bg-bg-white-0 px-5 py-6 dark:border-stroke-soft-100/50 dark:bg-bg-white-0/5",
				className,
			)}
		>
			<div className="flex flex-col items-stretch gap-0">
				{STEPS.map((step, i) => {
					const meta = nodeTone[step.tone];
					return (
						<div key={step.tone} className="flex flex-col items-center">
							<div className="flex w-full items-center gap-2.5 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 px-3 py-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:border-stroke-soft-100/50 dark:bg-bg-white-0/5">
								<div
									className={cn(
										"flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
										meta.well,
									)}
								>
									<Icon name={meta.icon} className="h-4 w-4" />
								</div>
								<span className="truncate font-medium text-[13px] text-text-strong-950">
									{step.title}
								</span>
							</div>
							{i < STEPS.length - 1 ? (
								<div className="h-4 w-px bg-stroke-soft-200 dark:bg-stroke-soft-100/50" />
							) : null}
						</div>
					);
				})}
			</div>
			{caption ? (
				<p className="mt-5 text-pretty text-center text-text-sub-600 text-xs leading-relaxed">
					{caption}
				</p>
			) : null}
		</aside>
	);
}
