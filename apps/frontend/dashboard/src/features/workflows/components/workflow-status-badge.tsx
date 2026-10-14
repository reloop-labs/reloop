"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import type { WorkflowStatus } from "../workflow-types";

const STATUS_MAP: Record<
	WorkflowStatus,
	{ label: string; icon: string; tone: string }
> = {
	active: { label: "Active", icon: "check-circle", tone: "text-success-base" },
	paused: { label: "Paused", icon: "pause", tone: "text-warning-base" },
	draft: { label: "Draft", icon: "draft", tone: "text-text-sub-600" },
};

/** Icon + label in the status color, like the API keys table's Status. */
export function WorkflowStatusBadge({
	status,
	className,
}: {
	status: WorkflowStatus;
	className?: string;
}) {
	const mapped = STATUS_MAP[status];
	return (
		<span
			className={cn(
				"inline-flex min-h-[22px] items-center gap-2 whitespace-nowrap py-0.5 font-medium text-[13px]",
				mapped.tone,
				className,
			)}
		>
			<Icon name={mapped.icon} className="h-3.5 w-3.5 shrink-0" />
			{mapped.label}
		</span>
	);
}
