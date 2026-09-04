"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import type { WorkflowStatus } from "../workflow-types";
import { WorkflowStatusBadge } from "./workflow-status-badge";

interface FlowStepCardProps {
	icon: "route" | "mail-single" | "clock" | "filter" | "workflow" | "zap";
	badge: string;
	title: string;
	subtitle?: string;
	detail?: string;
	status?: WorkflowStatus;
}

function FlowStepCard({
	icon,
	badge,
	title,
	subtitle,
	detail,
	status,
}: FlowStepCardProps) {
	return (
		<div className="w-full text-paragraph-sm">
			{/* Table-style header tab */}
			<div className="flex items-center justify-between rounded-t-[14px] border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-3.5 pt-2 pb-5 font-medium text-text-sub-600 text-xs dark:border-[#101010] dark:bg-bg-weak-50/40">
				<div className="flex items-center gap-1.5">
					<Icon name={icon} className="h-3 w-3 text-text-sub-600" />
					<span className="text-xs">{badge}</span>
				</div>
				{detail ? (
					<span className="font-mono text-[11px] text-text-sub-600">
						{detail}
					</span>
				) : null}
			</div>

			{/* Table-style overlapping card body */}
			<div className="-mt-2.5 rounded-xl border border-stroke-soft-100 bg-bg-white-0 px-3.5 py-2.5 shadow-2xs transition-colors hover:bg-bg-weak-50/40 dark:border-stroke-soft-100/40 dark:bg-bg-white-0/5">
				<div className="flex items-center justify-between gap-2">
					<div className="min-w-0 flex-1">
						<p className="truncate font-semibold text-label-sm text-text-strong-950">
							{title}
						</p>
						{subtitle ? (
							<p className="mt-0.5 truncate font-mono text-text-sub-600 text-xs">
								{subtitle}
							</p>
						) : null}
					</div>
					{status ? <WorkflowStatusBadge status={status} /> : null}
				</div>
			</div>
		</div>
	);
}

function StepConnector() {
	return (
		<div className="my-1.5 flex flex-col items-center">
			<div className="h-3 w-px bg-stroke-soft-200 dark:bg-stroke-soft-100/60" />
			<div className="h-1 w-1 rounded-full bg-stroke-sub-300 dark:bg-stroke-sub-300" />
			<div className="h-3 w-px bg-stroke-soft-200 dark:bg-stroke-soft-100/60" />
		</div>
	);
}

interface AutomationFlowPreviewProps {
	className?: string;
}

export function AutomationFlowPreview({
	className,
}: AutomationFlowPreviewProps) {
	return (
		<aside className={cn("space-y-0", className)}>
			{/* 1. TRIGGER */}
			<FlowStepCard
				icon="zap"
				badge="Trigger"
				title="User signed up"
				subtitle="event: auth.signup"
				detail="Real-time"
			/>

			<StepConnector />

			{/* 2. DELAY */}
			<FlowStepCard
				icon="clock"
				badge="Delay"
				title="Wait 1 day"
				subtitle="Delay before send"
				detail="24 hours"
			/>

			<StepConnector />

			{/* 3. SEND EMAIL */}
			<FlowStepCard
				icon="mail-single"
				badge="Send Email"
				title="Welcome to Reloop"
				subtitle="Template: Welcome onboard 👋"
				detail="Instant"
			/>
		</aside>
	);
}
