"use client";

import { AnimatedHoverBackground } from "@fe/dashboard/components/animated-hover-background";
import { PageSizeDropdown } from "@fe/dashboard/components/page-size-dropdown";
import { PaginationControls } from "@fe/dashboard/components/pagination-controls";
import {
	getAvatarGradient,
	getAvatarInitial,
} from "@fe/dashboard/utils/avatar";
import { useGetBackToUrl } from "@fe/dashboard/utils/navigation";
import { formatRelativeTime } from "@fe/dashboard/utils/time";
import * as Avatar from "@reloop/ui/avatar";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import {
	Content as PopoverContent,
	Root as PopoverRoot,
	Trigger as PopoverTrigger,
} from "@reloop/ui/popover";
import { Skeleton } from "@reloop/ui/skeleton";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { EmailsEmptyState } from "./emails-empty-state";

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
	currentPage: number;
	pageSize: number;
	totalLogs: number;
	onPageChange: (page: number) => void;
	onPageSizeChange: (pageSize: number) => void;
	hasFilters?: boolean;
	onClearFilters?: () => void;
}

const gridClass =
	"grid grid-cols-[1.2fr_1.8fr_110px_100px_32px] items-center px-4";

const getEmailStatusColorClass = (status: string): string => {
	switch (status.toLowerCase()) {
		case "delivered":
		case "sent":
			return "text-success-base";
		case "failed":
		case "bounced":
		case "spam":
			return "text-error-base";
		case "pending":
			return "text-warning-base";
		case "opened":
		case "clicked":
			return "text-information-base";
		default:
			return "text-text-sub-600";
	}
};

const getEmailStatusIcon = (status: string): string => {
	switch (status.toLowerCase()) {
		case "delivered":
		case "sent":
			return "check-circle";
		case "failed":
		case "bounced":
		case "spam":
			return "minus-circle";
		case "pending":
			return "clock";
		case "opened":
			return "info-outline";
		case "clicked":
			return "mouse-pointer-outline";
		default:
			return "mail-single";
	}
};

const getEmailStatusLabel = (status: string): string => {
	switch (status.toLowerCase()) {
		case "delivered":
			return "Delivered";
		case "sent":
			return "Sent";
		case "failed":
			return "Failed";
		case "bounced":
			return "Bounced";
		case "spam":
			return "Spam";
		case "pending":
			return "Pending";
		case "opened":
			return "Opened";
		case "clicked":
			return "Clicked";
		default:
			return status;
	}
};

interface EmailActionsDropdownProps {
	log: EmailLogData;
	onViewDetails: (id: string) => void;
	onOpenChange?: (open: boolean) => void;
}

const EmailActionsDropdown = ({
	log,
	onViewDetails,
	onOpenChange,
}: EmailActionsDropdownProps) => {
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const [popoverOpen, setPopoverOpen] = useState(false);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	const handlePopoverOpenChange = (open: boolean) => {
		setPopoverOpen(open);
		onOpenChange?.(open);
	};

	const menuItems = [
		{
			id: "view",
			label: "View Details",
			icon: "info-outline" as const,
			isDanger: false,
		},
	];

	const currentTab = buttonRefs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();
	const hoveredItem = menuItems[hoverIdx ?? -1];
	const isDanger = hoveredItem?.isDanger ?? false;

	const handleItemClick = (itemId: string) => {
		if (itemId === "view") {
			onViewDetails(log.id);
			setPopoverOpen(false);
		}
	};

	return (
		<div className="flex items-center justify-center">
			<PopoverRoot open={popoverOpen} onOpenChange={handlePopoverOpenChange}>
				<PopoverTrigger asChild>
					<Button.Root
						variant="neutral"
						mode="ghost"
						size="xxsmall"
						className="h-7 w-7 p-0"
					>
						<Icon name="more-horizontal" className="h-3 w-3" />
					</Button.Root>
				</PopoverTrigger>
				<PopoverContent
					align="end"
					sideOffset={-10}
					className="w-40 rounded-xl p-1.5"
				>
					<div className="relative">
						{menuItems.map((item, idx) => (
							<button
								key={item.id}
								ref={(el) => {
									if (el) buttonRefs.current[idx] = el;
								}}
								type="button"
								onPointerEnter={() => setHoverIdx(idx)}
								onPointerLeave={() => setHoverIdx(undefined)}
								onClick={() => handleItemClick(item.id)}
								className={cn(
									"flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 font-normal text-xs transition-colors",
									item.isDanger ? "text-error-base" : "text-text-strong-950",
									!currentRect &&
										hoverIdx === idx &&
										(item.isDanger ? "bg-red-alpha-10" : "bg-neutral-alpha-10"),
								)}
							>
								<Icon
									name={item.icon}
									className={cn(
										"h-3.5 w-3.5",
										item.isDanger ? "" : "text-text-sub-600",
									)}
								/>
								<span>{item.label}</span>
							</button>
						))}
						<AnimatedHoverBackground
							rect={currentRect}
							tabElement={currentTab}
							isDanger={isDanger}
						/>
					</div>
				</PopoverContent>
			</PopoverRoot>
		</div>
	);
};

const EmailSkeleton = () => (
	<div className={cn(gridClass, "py-2")}>
		<div className="flex items-center gap-3">
			<Skeleton className="h-4 w-4 rounded-full" />
			<Skeleton className="h-4 w-40" />
		</div>
		<div className="flex items-center">
			<Skeleton className="h-4 w-48" />
		</div>
		<div className="flex items-center gap-2">
			<Skeleton className="h-2 w-2 rounded-full" />
			<Skeleton className="h-4 w-16" />
		</div>
		<div className="flex items-center">
			<Skeleton className="h-4 w-20" />
		</div>
		<div className="flex items-center justify-center">
			<Skeleton className="h-4 w-4 rounded" />
		</div>
	</div>
);

export const EmailTable = ({
	logs,
	isLoading,
	loadingRows = 5,
	currentPage,
	pageSize,
	totalLogs,
	onPageChange,
	onPageSizeChange,
	hasFilters = false,
	onClearFilters,
}: EmailTableProps) => {
	const getBackToUrl = useGetBackToUrl();
	const router = useRouter();
	const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

	const totalPages = Math.ceil(totalLogs / pageSize) || 1;
	const startIndex = totalLogs === 0 ? 0 : (currentPage - 1) * pageSize + 1;
	const endIndex = Math.min(currentPage * pageSize, totalLogs);

	const handleRowClick = (log: EmailLogData) => {
		router.push(getBackToUrl(`/emails/${log.id}`));
	};

	return (
		<div className="w-full text-paragraph-sm">
			{/* Table Header */}
			<div
				className={cn(
					gridClass,
					"rounded-t-[14px] border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 pt-2.5 pb-5 font-medium text-text-sub-600 dark:border-[#101010] dark:bg-bg-weak-50/40",
				)}
			>
				<div className="flex items-center gap-1">
					<Icon name="user" className="h-3 w-3" />
					<span className="text-xs">To</span>
				</div>
				<div className="flex items-center gap-1">
					<Icon name="file-text" className="h-3 w-3" />
					<span className="text-xs">Subject</span>
				</div>
				<div className="flex items-center gap-1">
					<Icon name="check-circle" className="h-3 w-3" />
					<span className="text-xs">Status</span>
				</div>
				<div className="flex items-center gap-1">
					<Icon name="clock" className="h-3 w-3" />
					<span className="text-xs">Time</span>
				</div>
				<div />
			</div>

			{/* Table Body */}
			<div className="-mt-2.5 divide-y divide-stroke-soft-100 overflow-hidden rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:divide-stroke-soft-100/50 dark:border-stroke-soft-100/40">
				{isLoading ? (
					Array.from({ length: loadingRows }).map((_, index) => (
						<EmailSkeleton key={`skeleton-${index}`} />
					))
				) : logs.length === 0 ? (
					<EmailsEmptyState
						isFiltered={hasFilters}
						onClearFilters={onClearFilters}
					/>
				) : (
					logs.map((log) => {
						const isRowActive = activeDropdownId === log.id;
						return (
							<div
								key={log.id}
								onClick={() => handleRowClick(log)}
								className={cn(
									gridClass,
									"group/row cursor-pointer py-2 text-left transition-colors",
									"hover:bg-bg-weak-50/50 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-base",
									isRowActive && "bg-bg-weak-50/50",
								)}
							>
								{/* To */}
								<div className="flex min-w-0 items-center gap-2 pr-4">
									<Avatar.Root size="20" color="gray" className="flex-shrink-0">
										<Avatar.Image asChild>
											<div
												className={cn(
													"flex h-full w-full items-center justify-center rounded-full font-semibold text-white text-xs uppercase tracking-wide shadow-sm",
													getAvatarGradient(log.toEmails[0] || ""),
												)}
											>
												{getAvatarInitial(null, log.toEmails[0] || "")}
											</div>
										</Avatar.Image>
									</Avatar.Root>
									<span className="truncate font-medium text-label-sm text-text-strong-950">
										{log.toEmails.join(", ")}
									</span>
								</div>

								{/* Subject */}
								<div className="min-w-0 truncate pr-4 font-medium text-label-sm text-text-strong-950">
									{log.subject}
								</div>

								{/* Status */}
								<div className="flex items-center">
									<div
										className={cn(
											"flex items-center gap-2 rounded-lg py-0.5 font-medium text-[13px] capitalize",
											getEmailStatusColorClass(log.status),
										)}
									>
										<Icon
											name={getEmailStatusIcon(log.status)}
											className="h-3.5 w-3.5"
										/>
										{getEmailStatusLabel(log.status)}
									</div>
								</div>

								{/* Time */}
								<div>
									<span className="whitespace-nowrap font-medium text-[13px] text-text-sub-600">
										{formatRelativeTime(log.createdAt)}
									</span>
								</div>

								{/* Actions */}
								<div
									className="flex items-center justify-center text-text-soft-400"
									onClick={(e) => {
										e.stopPropagation();
									}}
								>
									<EmailActionsDropdown
										log={log}
										onViewDetails={(id) =>
											router.push(getBackToUrl(`/emails/${id}`))
										}
										onOpenChange={(open) =>
											setActiveDropdownId(open ? log.id : null)
										}
									/>
								</div>
							</div>
						);
					})
				)}

				{/* Pagination */}
				{!isLoading && totalLogs > 0 && (
					<div className="flex items-center justify-between px-4 py-2 text-label-xs text-text-sub-600">
						<div className="flex items-center">
							<span>
								Showing {startIndex}–{endIndex} of {totalLogs} log
								{totalLogs !== 1 ? "s" : ""}
							</span>
							<PageSizeDropdown
								value={pageSize}
								onValueChange={onPageSizeChange}
							/>
						</div>
						<PaginationControls
							currentPage={currentPage}
							totalPages={totalPages}
							onPageChange={onPageChange}
							isLoading={isLoading}
						/>
					</div>
				)}
			</div>
		</div>
	);
};
