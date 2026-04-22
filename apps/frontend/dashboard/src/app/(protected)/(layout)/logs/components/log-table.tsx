"use client";
import { formatRelativeTime } from "@fe/dashboard/utils/time";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import Link from "next/link";

interface LogData {
	uuid: string;
	event: string;
	level: string;
	status_code?: number | null;
	created_at: string;
}

interface LogTableProps {
	logs: LogData[];
	isLoading?: boolean;
	loadingRows?: number;
	onRowClick?: (logId: string) => void;
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

const getStatusBadgeColor = (statusCode: number) => {
	if (statusCode >= 200 && statusCode < 400) {
		return "text-success-base border-success-soft-200 bg-success-alpha-10";
	}
	return "text-error-base border-error-soft-200 bg-error-alpha-10";
};

const getRowTintColor = (level: string) => {
	switch (level.toLowerCase()) {
		case "error":
		case "fatal":
			return "bg-error-alpha-10/30 hover:bg-error-alpha-10/50";
		case "warn":
			return "bg-warning-alpha-10/30 hover:bg-warning-alpha-10/50";
		default:
			return "hover:bg-bg-weak-50/50";
	}
};

const EVENT_SOURCE_ICONS: Record<string, string> = {
	email: "mail",
	auth: "lock",
	domain: "globe",
	"api-key": "key-new",
	webhook: "link",
	contact: "users",
	template: "file-text",
	settings: "settings",
	manual: "edit",
};

const getEventIcon = (event: string) => {
	const source = event.split(".")[0];
	if (!source) return "terminal";
	return EVENT_SOURCE_ICONS[source] || "terminal";
};

export const LogTable = ({
	logs,
	isLoading,
	loadingRows = 5,
	onRowClick,
}: LogTableProps) => {
	console.log("logs", logs);
	const gridClass =
		"grid grid-cols-[minmax(0,1fr)_80px_80px_130px] items-center px-6 gap-6";

	if (isLoading) {
		return (
			<div className="w-full overflow-hidden rounded-xl border border-stroke-soft-100 text-paragraph-sm dark:border-stroke-soft-100/50">
				{/* Header */}
				<div
					className={cn(
						gridClass,
						"border-stroke-soft-100 border-b py-3 text-text-sub-600 dark:border-stroke-soft-100/50",
					)}
				>
					<div className="flex items-center gap-2">
						<Icon name="activity" className="h-3.5 w-3.5" />
						<span className="text-xs">Event</span>
					</div>
					<div className="flex items-center gap-2">
						<Icon name="check-circle" className="h-3.5 w-3.5" />
						<span className="text-xs">Status</span>
					</div>
					<div className="flex items-center gap-2">
						<Icon name="barchart" className="h-3.5 w-3.5" />
						<span className="text-xs">Level</span>
					</div>
					<div className="flex items-center justify-end gap-2">
						<Icon name="clock" className="h-3.5 w-3.5" />
						<span className="text-xs">Time</span>
					</div>
				</div>
				{/* Skeleton rows */}
				<div className="divide-y divide-stroke-soft-100 dark:divide-stroke-soft-100/50">
					{Array.from({ length: loadingRows }).map((_, index) => (
						<div key={`skeleton-${index}`} className={cn(gridClass, "py-2")}>
							<Skeleton className="h-4 w-40" />
							<Skeleton className="h-4 w-10" />
							<Skeleton className="h-5 w-12 rounded-md" />
							<div className="flex justify-end">
								<Skeleton className="h-4 w-16" />
							</div>
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
					"border-stroke-soft-100 border-b py-3 text-text-sub-600 dark:border-stroke-soft-100/50",
				)}
			>
				<div className="flex items-center gap-2">
					<Icon name="activity" className="h-3.5 w-3.5" />
					<span className="text-xs">Event</span>
				</div>
				<div className="flex items-center gap-2">
					<Icon name="check-circle" className="h-3.5 w-3.5" />
					<span className="text-xs">Status</span>
				</div>
				<div className="flex items-center gap-2">
					<Icon name="barchart" className="h-3.5 w-3.5" />
					<span className="text-xs">Level</span>
				</div>
				<div className="flex items-center justify-end gap-2">
					<Icon name="clock" className="h-3.5 w-3.5" />
					<span className="text-xs">Time</span>
				</div>
			</div>

			{/* Table Body */}
			<div className="divide-y divide-stroke-soft-100 dark:divide-stroke-soft-100/50">
				{logs.length === 0 ? (
					<div className="flex h-32 flex-col items-center justify-center gap-2 text-text-sub-600">
						<Icon name="inbox" className="h-8 w-8 text-text-disabled-300" />
						<p className="text-sm">No logs found</p>
						<p className="text-text-soft-400 text-xs">
							Try adjusting your filters or time range
						</p>
					</div>
				) : (
					logs.map((log) => {
						const rowContent = (
							<>
								{/* Event Column - icon derived from event prefix + event name */}
								<div className="flex items-center gap-2.5 truncate">
									<Icon
										name={getEventIcon(log.event) as any}
										className={cn(
											"h-4 w-4 shrink-0",
											log.status_code
												? log.status_code >= 200 && log.status_code < 400
													? "text-success-base"
													: "text-error-base"
												: "text-text-sub-600",
										)}
									/>
									<span className="truncate text-label-sm text-text-strong-950">
										{log.event}
									</span>
								</div>

								{/* Status Column */}
								<div className="flex items-center">
									{log.status_code ? (
										<span
											className={cn(
												"inline-flex items-center rounded-md border-[1px] px-[6px] py-0.5 font-medium text-[10px]",
												getStatusBadgeColor(log.status_code),
											)}
										>
											{log.status_code}
										</span>
									) : (
										<span className="text-text-sub-600 text-xs">—</span>
									)}
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

								{/* Time Column - right aligned */}
								<div className="truncate text-right text-label-sm text-text-sub-600">
									{formatRelativeTime(log.created_at)}
								</div>
							</>
						);

						const rowClasses = cn(
							gridClass,
							"w-full cursor-pointer py-2.5 text-left transition-colors",
							getRowTintColor(log.level),
							"focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-base focus-visible:ring-offset-1",
						);

						if (onRowClick) {
							return (
								<button
									key={log.uuid}
									type="button"
									onClick={() => onRowClick(log.uuid)}
									className={rowClasses}
								>
									{rowContent}
								</button>
							);
						}

						return (
							<Link
								key={log.uuid}
								href={`/logs/${log.uuid}`}
								className={rowClasses}
							>
								{rowContent}
							</Link>
						);
					})
				)}
			</div>
		</div>
	);
};
