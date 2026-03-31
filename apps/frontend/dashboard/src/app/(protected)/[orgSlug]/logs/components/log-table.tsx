"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { formatRelativeTime } from "@fe/dashboard/utils/time";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import Link from "next/link";

interface LogData {
	uuid: string;
	service: string;
	event: string;
	level: string;
	occurred_at: string;
}

interface LogTableProps {
	logs: LogData[];
	activeOrganizationSlug: string;
	isLoading?: boolean;
	loadingRows?: number;
}

const getLevelBadgeColor = (level: string) => {
	switch (level.toLowerCase()) {
		case "error":
		case "fatal":
			return "text-error-base border-error-soft-200 bg-error-alpha-10";
		case "warn":
			return "text-warning-base border-warning-soft-200 bg-warning-alpha-10";
		case "info":
			return "text-primary-base border-primary-soft-200 bg-primary-alpha-10";
		case "debug":
		default:
			return "text-text-sub-600 border-stroke-soft-200 bg-neutral-alpha-10";
	}
};

export const LogTable = ({
	logs,
	activeOrganizationSlug,
	isLoading,
	loadingRows = 5,
}: LogTableProps) => {
	const gridClass = "grid grid-cols-[150px_120px_1fr_100px] items-center px-4";

	if (isLoading) {
		return (
			<div className="w-full overflow-hidden rounded-xl border border-stroke-soft-100 text-paragraph-sm dark:border-stroke-soft-100/50">
				{/* Header */}
				<div
					className={cn(
						gridClass,
						"border-stroke-soft-100 border-b py-3.5 text-text-sub-600 dark:border-stroke-soft-100/50",
					)}
				>
					<div className="flex items-center gap-2">
						<Icon name="clock" className="h-4 w-4" />
						<span className="text-xs">Timestamp</span>
					</div>
					<div className="flex items-center gap-2">
						<Icon name="box" className="h-4 w-4" />
						<span className="text-xs">Service</span>
					</div>
					<div className="flex items-center gap-2">
						<Icon name="activity" className="h-4 w-4" />
						<span className="text-xs">Event</span>
					</div>
					<div className="flex items-center gap-2">
						<Icon name="alert-triangle" className="h-4 w-4" />
						<span className="text-xs">Level</span>
					</div>
				</div>
				{/* Skeleton rows */}
				<div className="divide-y divide-stroke-soft-100 dark:divide-stroke-soft-100/50">
					{Array.from({ length: loadingRows }).map((_, index) => (
						<div key={`skeleton-${index}`} className={cn(gridClass, "py-2")}>
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-4 w-20" />
							<Skeleton className="h-4 w-40" />
							<Skeleton className="h-5 w-16 rounded-md" />
						</div>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="w-full overflow-hidden rounded-xl border border-stroke-soft-100 text-paragraph-sm dark:border-stroke-soft-100/50">
			{/* Table Header */}
			<div
				className={cn(
					gridClass,
					"border-stroke-soft-100 border-b py-3.5 text-text-sub-600 dark:border-stroke-soft-100/50",
				)}
			>
				<div className="flex items-center gap-2">
					<Icon name="clock" className="h-4 w-4" />
					<span className="text-xs">Timestamp</span>
				</div>
				<div className="flex items-center gap-2">
					<Icon name="box" className="h-4 w-4" />
					<span className="text-xs">Service</span>
				</div>
				<div className="flex items-center gap-2">
					<Icon name="activity" className="h-4 w-4" />
					<span className="text-xs">Event</span>
				</div>
				<div className="flex items-center gap-2">
					<Icon name="alert-triangle" className="h-4 w-4" />
					<span className="text-xs">Level</span>
				</div>
			</div>

			{/* Table Body */}
			<div className="divide-y divide-stroke-soft-100 dark:divide-stroke-soft-100/50">
				{logs.length === 0 ? (
					<div className="flex h-32 items-center justify-center text-text-sub-600">
						No logs found
					</div>
				) : (
					logs.map((log) => (
						<Link
							key={log.uuid}
							href={`/${activeOrganizationSlug}/logs/${log.uuid}`}
							className={cn(
								gridClass,
								"w-full cursor-pointer py-2 text-left transition-colors",
								"hover:bg-bg-weak-50/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-base focus-visible:ring-offset-1",
							)}
						>
							{/* Timestamp Column */}
							<div className="truncate text-label-sm text-text-sub-600">
								{formatRelativeTime(log.occurred_at)}
							</div>

							{/* Service Column */}
							<div className="flex items-center gap-2">
								<div className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded bg-bg-weak-100 font-bold text-[10px] text-text-sub-600 uppercase tracking-tighter shadow-sm">
									{log.service.charAt(0)}
								</div>
								<span className="truncate font-medium text-label-sm text-text-strong-950">
									{log.service}
								</span>
							</div>

							{/* Event Column */}
							<div className="truncate text-label-sm text-text-strong-950">
								{log.event}
							</div>

							{/* Level Column */}
							<div>
								<span
									className={cn(
										"inline-flex items-center rounded-md border-[1px] px-[6px] py-0.5 font-medium text-[10px] capitalize",
										getLevelBadgeColor(log.level),
									)}
								>
									{log.level}
								</span>
							</div>
						</Link>
					))
				)}
			</div>
		</div>
	);
};
