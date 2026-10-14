"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { motion } from "motion/react";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useAutomationRuns } from "../hooks/use-automation-runs";

export const AUTOMATION_VIEWS = ["editor", "runs", "metrics"] as const;
export type AutomationView = (typeof AUTOMATION_VIEWS)[number];

const viewParser = parseAsStringLiteral(AUTOMATION_VIEWS).withDefault("editor");

/** Which view of an automation is open: its steps, its runs, or its metrics. */
export function useAutomationView() {
	return useQueryState("view", viewParser);
}

const ITEMS: { value: AutomationView; label: string; icon: string }[] = [
	{ value: "editor", label: "Editor", icon: "workflow" },
	{ value: "runs", label: "Runs", icon: "history" },
	{ value: "metrics", label: "Metrics", icon: "activity" },
];

export function AutomationViewTabs({ automationId }: { automationId: string }) {
	const [view, setView] = useAutomationView();
	const runs = useAutomationRuns(automationId);
	const total = runs.data?.pages[0]?.total;

	return (
		<div className="flex items-center gap-0.5" role="tablist">
			{ITEMS.map((item) => {
				const active = item.value === view;
				return (
					<button
						key={item.value}
						type="button"
						role="tab"
						aria-selected={active}
						onClick={() =>
							void setView(item.value === "editor" ? null : item.value)
						}
						className={cn(
							"relative flex h-7 items-center gap-1.5 rounded-lg px-2.5 font-medium text-xs transition-colors",
							active
								? "text-text-strong-950"
								: "text-text-sub-600 hover:text-text-strong-950",
						)}
					>
						{active ? (
							<motion.span
								layoutId="automation-view-pill"
								className="absolute inset-0 rounded-lg bg-neutral-alpha-10"
								transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
							/>
						) : null}
						<Icon name={item.icon} className="relative size-3.5" />
						<span className="relative">{item.label}</span>
						{item.value === "runs" && total ? (
							<span className="relative text-text-soft-400 tabular-nums">
								{total.toLocaleString()}
							</span>
						) : null}
					</button>
				);
			})}
		</div>
	);
}
