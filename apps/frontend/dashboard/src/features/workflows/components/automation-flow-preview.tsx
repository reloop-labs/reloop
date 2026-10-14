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

/**
 * A step drawn like the editor canvas: a tab naming the step type, then a gray
 * frame around a white card.
 */
function FlowStepCard({
	icon,
	badge,
	title,
	subtitle,
	detail,
	status,
}: FlowStepCardProps) {
	return (
		<div className="flex w-full flex-col">
			<p className="relative z-10 -mb-px ml-4 flex h-8 w-fit items-center gap-1.5 rounded-t-xl border border-stroke-soft-200 border-b-0 bg-bg-weak-50 px-3 font-medium text-[13px] text-text-sub-600 dark:border-stroke-soft-100/50 dark:bg-[#101014]">
				<Icon name={icon} className="h-3.5 w-3.5 shrink-0" />
				{badge}
			</p>
			<div className="rounded-[15px] border border-stroke-soft-200 bg-bg-weak-50 p-[3px] dark:border-stroke-soft-100/50 dark:bg-[#101014]">
				<div className="flex items-center gap-3 rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:border-stroke-soft-100/50 dark:bg-[#141419]">
					<div className="min-w-0 flex-1">
						<p className="truncate font-medium text-[14px] text-text-strong-950">
							{title}
						</p>
						{subtitle ? (
							<p className="mt-0.5 truncate font-mono text-[12px] text-text-sub-600">
								{subtitle}
							</p>
						) : null}
					</div>
					{status ? (
						<WorkflowStatusBadge status={status} />
					) : detail ? (
						<span className="shrink-0 font-mono text-[11px] text-text-soft-400">
							{detail}
						</span>
					) : null}
				</div>
			</div>
		</div>
	);
}

/** Gap between one step's frame and the next step's tab. */
const GAP = 16;
/** Tab height minus the 1px it overlaps the frame. */
const TAB = 31;
/** The arrow runs past the next step's tab (off to the left) into its frame. */
const CONNECTOR = GAP + TAB;
const STROKE = "var(--color-stroke-sub-300)";

/** Same soft arrow as the connectors on the editor canvas. */
function StepConnector() {
	return (
		<div
			className="relative flex justify-center"
			style={{ marginBottom: -TAB }}
		>
			<svg
				aria-hidden
				width={12}
				height={CONNECTOR}
				viewBox={`0 0 12 ${CONNECTOR}`}
				className="overflow-visible"
			>
				<path
					d={`M 6 1 V ${CONNECTOR - 4}`}
					stroke={STROKE}
					strokeWidth={2}
					strokeLinecap="round"
				/>
				<path
					d={`M 2 ${CONNECTOR - 8} L 6 ${CONNECTOR - 1.75} L 10 ${CONNECTOR - 8} Z`}
					fill={STROKE}
					stroke={STROKE}
					strokeWidth={3}
					strokeLinejoin="round"
				/>
			</svg>
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
				badge="Send email"
				title="Welcome to Reloop"
				subtitle="Template: Welcome onboard 👋"
				detail="Instant"
			/>
		</aside>
	);
}
