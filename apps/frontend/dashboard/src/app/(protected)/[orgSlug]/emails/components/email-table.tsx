"use client";
import { formatRelativeTime } from "@fe/dashboard/utils/time";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import Link from "next/link";
import { useParams } from "next/navigation";

interface EmailLogData {
	id: string;
	subject: string;
	fromEmail: string;
	toEmails: string[];
	status: string;
	createdAt: string;
}

interface EmailTableProps {
	logs: EmailLogData[];
	isLoading?: boolean;
	loadingRows?: number;
}

const getStatusBadgeColor = (status: string) => {
	switch (status.toLowerCase()) {
		case "delivered":
		case "sent":
			return "text-success-base border-success-soft-200 bg-success-alpha-10";
		case "failed":
		case "bounced":
		case "spam":
			return "text-error-base border-error-soft-200 bg-error-alpha-10";
		case "pending":
			return "text-warning-base border-warning-soft-200 bg-warning-alpha-10";
		default:
			return "text-text-sub-600 border-stroke-soft-200 bg-neutral-alpha-10";
	}
};

export const EmailTable = ({
	logs,
	isLoading,
	loadingRows = 5,
}: EmailTableProps) => {
	const { orgSlug } = useParams();
	const gridClass =
		"grid grid-cols-[1fr_2fr_1.5fr_1.5fr_120px] items-center px-6 gap-4";

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
						<Icon name="check-circle" className="h-3.5 w-3.5" />
						<span className="text-xs">Status</span>
					</div>
					<div className="flex items-center gap-2">
						<Icon name="file-text" className="h-3.5 w-3.5" />
						<span className="text-xs">Subject</span>
					</div>
					<div className="flex items-center gap-2">
						<Icon name="user" className="h-3.5 w-3.5" />
						<span className="text-xs">To</span>
					</div>
					<div className="flex items-center gap-2">
						<Icon name="user" className="h-3.5 w-3.5" />
						<span className="text-xs">From</span>
					</div>
					<div className="flex items-center justify-end gap-2">
						<Icon name="clock" className="h-3.5 w-3.5" />
						<span className="text-xs">Time</span>
					</div>
				</div>
				{/* Skeleton rows */}
				<div className="divide-y divide-stroke-soft-100 dark:divide-stroke-soft-100/50">
					{Array.from({ length: loadingRows }).map((_, index) => (
						<div key={`skeleton-${index}`} className={cn(gridClass, "py-3")}>
							<Skeleton className="h-5 w-16 rounded-md" />
							<Skeleton className="h-4 w-40" />
							<Skeleton className="h-4 w-32" />
							<Skeleton className="h-4 w-32" />
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
					<Icon name="check-circle" className="h-3.5 w-3.5" />
					<span className="text-xs">Status</span>
				</div>
				<div className="flex items-center gap-2">
					<Icon name="file-text" className="h-3.5 w-3.5" />
					<span className="text-xs">Subject</span>
				</div>
				<div className="flex items-center gap-2">
					<Icon name="user" className="h-3.5 w-3.5" />
					<span className="text-xs">To</span>
				</div>
				<div className="flex items-center gap-2">
					<Icon name="user" className="h-3.5 w-3.5" />
					<span className="text-xs">From</span>
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
						<p className="text-sm">No email logs found</p>
					</div>
				) : (
					logs.map((log) => (
						<div
							key={log.id}
							className={cn(
								gridClass,
								"w-full py-3.5 text-left transition-colors hover:bg-bg-weak-50/50",
							)}
						>
							{/* Status */}
							<div className="flex items-center">
								<span
									className={cn(
										"inline-flex items-center rounded-md border-[1px] px-[6px] py-0.5 font-medium text-[10px] capitalize",
										getStatusBadgeColor(log.status),
									)}
								>
									{log.status}
								</span>
							</div>

							{/* Subject */}
							<div className="truncate font-medium text-label-sm text-text-strong-950">
								<Link
									href={`/${orgSlug}/emails/${log.id}`}
									className="hover:text-primary-base hover:underline"
								>
									{log.subject}
								</Link>
							</div>

							{/* To */}
							<div className="truncate text-label-sm text-text-sub-600">
								{log.toEmails.join(", ")}
							</div>

							{/* From */}
							<div className="truncate text-label-sm text-text-sub-600">
								{log.fromEmail}
							</div>

							{/* Time */}
							<div className="truncate text-right text-label-sm text-text-sub-600">
								{formatRelativeTime(log.createdAt)}
							</div>
						</div>
					))
				)}
			</div>
		</div>
	);
};
