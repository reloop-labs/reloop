"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Handle, type Node, type NodeProps, Position } from "@xyflow/react";

export type TimelineNodeData = {
	stepType:
		| "sent"
		| "delivered"
		| "opened"
		| "clicked"
		| "failed"
		| "anchor"
		| string;
	label: string;
	icon: string;
	isCompleted: boolean;
	timestamp?: string | null;
	onClick?: () => void;
	isInteractive?: boolean;
	hasTarget?: boolean;
	hasSource?: boolean;
};

export type TimelineFlowNode = Node<TimelineNodeData, "timelineStep">;

export function formatTimelineDate(timestamp?: string | null): string | null {
	if (!timestamp) return null;
	const date = new Date(timestamp);
	if (Number.isNaN(date.getTime())) return null;

	const day = date.getDate();
	const month = date.toLocaleString("en-US", { month: "short" });
	const time = date
		.toLocaleString("en-US", {
			hour: "numeric",
			minute: "2-digit",
			hour12: true,
		})
		.toLowerCase();

	return `${day} ${month}, ${time}`;
}

export function TimelineFlowNodeComponent({
	data,
}: NodeProps<TimelineFlowNode>) {
	const {
		stepType,
		label,
		icon,
		isCompleted,
		timestamp,
		onClick,
		isInteractive = false,
		hasTarget = true,
		hasSource = true,
	} = data;

	if (stepType === "anchor") {
		return <div className="pointer-events-none h-[80px] w-[100px] opacity-0" />;
	}

	const formattedTime = formatTimelineDate(timestamp);

	const getIconStyles = () => {
		if (!isCompleted) {
			return "border-stroke-soft-200 bg-bg-weak-50 text-text-sub-600";
		}
		switch (stepType) {
			case "sent":
				return "border-information-base/20 bg-information-lighter/50 text-information-base";
			case "failed":
			case "bounced":
			case "complaint":
				return "border-error-light bg-error-lighter text-error-base";
			case "delivered":
				return cn(
					"border-success-base/20 bg-success-lighter/50 text-success-base",
					isInteractive &&
						"group-hover:border-success-base/40 group-hover:shadow-[0_0_0_3px_rgba(34,197,94,0.12)]",
				);
			case "opened":
				return "border-orange-500/20 bg-orange-50/50 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400";
			case "clicked":
				return "border-purple-500/20 bg-purple-50/50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400";
			default:
				return "border-information-base/20 bg-information-lighter/50 text-information-base";
		}
	};

	const getBadgeStyles = () => {
		if (!isCompleted) {
			return "bg-bg-weak-50 text-text-sub-600";
		}
		switch (stepType) {
			case "sent":
				return "bg-information-lighter text-information-base";
			case "failed":
			case "bounced":
			case "complaint":
				return "bg-error-lighter text-error-base";
			case "delivered":
				return cn(
					"bg-success-lighter text-success-base",
					isInteractive && "group-hover:underline",
				);
			case "opened":
				return "bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400";
			case "clicked":
				return "bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400";
			default:
				return "bg-information-lighter text-information-base";
		}
	};

	const content = (
		<div className="relative flex w-full flex-col items-center">
			{/* Icon Node */}
			<div className="relative z-10 flex flex-col items-center gap-2">
				<div
					className={cn(
						"flex h-10 w-10 items-center justify-center rounded-[10px] border transition-all duration-300",
						getIconStyles(),
					)}
				>
					<Icon name={icon} className="h-5 w-5" />
				</div>

				<div className="flex flex-col items-center text-center">
					<span
						className={cn(
							"rounded-md px-2 py-1 font-semibold text-xs transition-colors duration-300",
							getBadgeStyles(),
						)}
					>
						{label}
					</span>
					{isCompleted && formattedTime && (
						<span className="mt-1 whitespace-nowrap font-medium text-text-soft-400 text-xs">
							{formattedTime}
						</span>
					)}
				</div>
			</div>
		</div>
	);

	return (
		<div className="relative flex w-[100px] flex-col items-center">
			{hasTarget && (
				<Handle
					type="target"
					position={Position.Left}
					style={{
						top: 20,
						left: 30,
						width: 1,
						height: 1,
						minWidth: 0,
						minHeight: 0,
						border: "none",
						background: "transparent",
						opacity: 0,
					}}
				/>
			)}

			{isInteractive && onClick ? (
				<button
					type="button"
					onClick={onClick}
					className="group relative flex w-full flex-col items-center rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-success-base/40"
					aria-label={`View ${label} details`}
				>
					{content}
				</button>
			) : (
				<div className="group relative flex w-full flex-col items-center">
					{content}
				</div>
			)}

			{hasSource && (
				<Handle
					type="source"
					position={Position.Right}
					style={{
						top: 20,
						right: 30,
						width: 1,
						height: 1,
						minWidth: 0,
						minHeight: 0,
						border: "none",
						background: "transparent",
						opacity: 0,
					}}
				/>
			)}
		</div>
	);
}
