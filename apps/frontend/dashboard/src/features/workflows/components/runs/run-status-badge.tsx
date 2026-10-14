"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as StatusBadge from "@reloop/ui/status-badge";
import type {
	EnrollmentStatus,
	StepRunStatus,
} from "../../hooks/use-automations-api";

type BadgeStyle = {
	label: string;
	status: "completed" | "failed" | "disabled" | "running";
};

export const RUN_STATUS: Record<EnrollmentStatus, BadgeStyle> = {
	active: { label: "Running", status: "running" },
	completed: { label: "Completed", status: "completed" },
	failed: { label: "Failed", status: "failed" },
	cancelled: { label: "Cancelled", status: "disabled" },
};

export const STEP_STATUS: Record<StepRunStatus, BadgeStyle> = {
	pending: { label: "Waiting", status: "running" },
	running: { label: "Running", status: "running" },
	completed: { label: "Completed", status: "completed" },
	skipped: { label: "Skipped", status: "disabled" },
	failed: { label: "Failed", status: "failed" },
};

/**
 * Status pill for a run or a step. In progress is neutral with a pulsing
 * dot (the brand is black, not blue); the rest use the status colors.
 */
export function RunBadge({
	style,
	className,
}: {
	style: BadgeStyle;
	className?: string;
}) {
	if (style.status === "running") {
		return (
			<StatusBadge.Root variant="stroke" className={className}>
				<span
					aria-hidden
					className="relative -mx-1 flex size-4 items-center justify-center"
				>
					<span className="absolute size-1.5 animate-ping rounded-full bg-text-strong-950/40 motion-reduce:hidden" />
					<span className="size-1.5 rounded-full bg-text-strong-950" />
				</span>
				<span className="text-label-xs text-text-strong-950">
					{style.label}
				</span>
			</StatusBadge.Root>
		);
	}
	return (
		<StatusBadge.Root
			variant="light"
			status={style.status}
			className={cn(className)}
		>
			<StatusBadge.Dot />
			{style.label}
		</StatusBadge.Root>
	);
}

/** Small status mark for a run, used before each row and in the status menu. */
export function RunStatusIcon({
	status,
	className,
}: {
	status: EnrollmentStatus;
	className?: string;
}) {
	const label = RUN_STATUS[status].label;
	if (status === "active") {
		return (
			<svg
				role="img"
				aria-label={label}
				viewBox="0 0 16 16"
				className={cn(
					"size-4 shrink-0 animate-spin text-text-strong-950 motion-reduce:animate-none",
					className,
				)}
			>
				<title>{label}</title>
				<circle
					cx="8"
					cy="8"
					r="6"
					fill="none"
					stroke="currentColor"
					strokeOpacity={0.2}
					strokeWidth="1.75"
				/>
				<path
					d="M8 2a6 6 0 0 1 6 6"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.75"
					strokeLinecap="round"
				/>
			</svg>
		);
	}
	const icon =
		status === "completed"
			? { name: "check-circle", tone: "text-success-base" }
			: status === "failed"
				? { name: "alert-circle", tone: "text-error-base" }
				: { name: "minus-circle", tone: "text-text-soft-400" };
	return (
		<span role="img" aria-label={label} title={label} className="flex shrink-0">
			<Icon name={icon.name} className={cn("size-4", icon.tone, className)} />
		</span>
	);
}
