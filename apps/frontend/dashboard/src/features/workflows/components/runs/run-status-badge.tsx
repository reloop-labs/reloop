"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
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

const BADGE_TONE: Record<BadgeStyle["status"], { icon: string; tone: string }> =
	{
		running: { icon: "", tone: "text-text-strong-950" },
		completed: { icon: "check-circle", tone: "text-success-base" },
		failed: { icon: "alert-circle", tone: "text-error-base" },
		disabled: { icon: "minus-circle", tone: "text-text-soft-400" },
	};

/**
 * Status of a run or a step: icon + label in the status color, like the API
 * keys table. In progress is ink with a spinner (the brand is black, not blue).
 */
export function RunBadge({
	style,
	className,
}: {
	style: BadgeStyle;
	className?: string;
}) {
	const badge = BADGE_TONE[style.status];
	return (
		<span
			className={cn(
				"inline-flex min-h-[22px] items-center gap-2 whitespace-nowrap py-0.5 font-medium text-[13px]",
				badge.tone,
				className,
			)}
		>
			{style.status === "running" ? (
				<Spinner className="h-3.5 w-3.5" label={style.label} />
			) : (
				<Icon name={badge.icon} className="h-3.5 w-3.5 shrink-0" />
			)}
			{style.label}
		</span>
	);
}

const Spinner = ({
	className,
	label,
}: {
	className?: string;
	label: string;
}) => (
	<svg
		role="img"
		aria-label={label}
		viewBox="0 0 16 16"
		className={cn(
			"shrink-0 animate-spin text-text-strong-950 motion-reduce:animate-none",
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
		return <Spinner className={cn("size-4", className)} label={label} />;
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
