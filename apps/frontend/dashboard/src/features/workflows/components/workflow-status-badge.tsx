"use client";

import { cn } from "@reloop/ui/cn";
import * as StatusBadge from "@reloop/ui/status-badge";
import type { WorkflowStatus } from "../workflow-types";

const STATUS_MAP: Record<
	WorkflowStatus,
	{ label: string; status: "completed" | "pending" | "disabled" }
> = {
	active: { label: "Active", status: "completed" },
	paused: { label: "Paused", status: "pending" },
	draft: { label: "Draft", status: "disabled" },
};

export function WorkflowStatusBadge({
	status,
	className,
}: {
	status: WorkflowStatus;
	className?: string;
}) {
	const mapped = STATUS_MAP[status];
	return (
		<StatusBadge.Root
			variant="light"
			status={mapped.status}
			className={cn("capitalize", className)}
		>
			<StatusBadge.Dot />
			{mapped.label}
		</StatusBadge.Root>
	);
}
