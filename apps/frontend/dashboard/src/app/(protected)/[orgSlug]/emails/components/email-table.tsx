"use client";

import { AnimatedHoverBackground } from "@fe/dashboard/components/animated-hover-background";
import { PageSizeDropdown } from "@fe/dashboard/components/page-size-dropdown";
import { PaginationControls } from "@fe/dashboard/components/pagination-controls";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { formatRelativeTime } from "@fe/dashboard/utils/time";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import {
	Content as PopoverContent,
	Root as PopoverRoot,
	Trigger as PopoverTrigger,
} from "@reloop/ui/popover";
import { Skeleton } from "@reloop/ui/skeleton";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useRef, useState } from "react";

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
}

const getStatusBadgeColor = (status: string) => {
	switch (status.toLowerCase()) {
		case "delivered":
		case "sent":
			return "text-success-base border-success-soft-200 bg-success-lighter/40";
		case "failed":
		case "bounced":
		case "spam":
			return "text-error-base border-error-soft-200 bg-error-lighter/40";
		case "pending":
			return "text-warning-base border-warning-soft-200 bg-warning-lighter/40";
		default:
			return "text-text-sub-600 border-stroke-soft-200 bg-neutral-alpha-10";
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
			icon: "eye-outline" as const,
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
		<div className="flex items-center justify-end">
			<PopoverRoot open={popoverOpen} onOpenChange={handlePopoverOpenChange}>
				<PopoverTrigger asChild>
					<Button.Root
						variant="neutral"
						mode="ghost"
						size="xxsmall"
						className="h-7 w-7 p-0"
					>
						<Icon name="more-vertical" className="h-3 w-3" />
					</Button.Root>
				</PopoverTrigger>
				<PopoverContent
					align="end"
					sideOffset={-4}
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

export const EmailTable = ({
	logs,
	isLoading,
	loadingRows = 5,
	currentPage,
	pageSize,
	totalLogs,
	onPageChange,
	onPageSizeChange,
}: EmailTableProps) => {
	const { orgSlug } = useParams();
	const { push } = useUserOrganization();
	const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

	const totalPages = Math.ceil(totalLogs / pageSize) || 1;
	const startIndex = totalLogs === 0 ? 0 : (currentPage - 1) * pageSize + 1;
	const endIndex = Math.min(currentPage * pageSize, totalLogs);

	const gridClass =
		"grid grid-cols-[1.5fr_2fr_80px_80px_32px] items-center px-4 gap-4";

	return (
		<div className="w-full overflow-hidden rounded-xl border border-stroke-soft-100 text-paragraph-sm dark:border-stroke-soft-100/50">
			{/* Table Header */}
			<div
				className={cn(
					gridClass,
					"border-stroke-soft-100 border-b bg-bg-weak-50/50 px-4 py-2.5 text-text-sub-600 dark:border-stroke-soft-100/50 dark:bg-bg-weak-50/40",
				)}
			>
				<div className="flex items-center gap-1">
					<Icon name="user" className="h-3 w-3" />
					<span className="font-medium text-xs tracking-wide">To</span>
				</div>
				<div className="flex items-center gap-1">
					<Icon name="file-text" className="h-3 w-3" />
					<span className="font-medium text-xs tracking-wide">Subject</span>
				</div>
				<div className="flex items-center gap-1">
					<Icon name="check-circle" className="h-3 w-3" />
					<span className="font-medium text-xs tracking-wide">Status</span>
				</div>
				<div className="flex items-center gap-1">
					<Icon name="clock" className="h-3 w-3" />
					<span className="font-medium text-xs tracking-wide">Time</span>
				</div>
				<div />
			</div>

			{/* Table Body */}
			<div className="divide-y divide-stroke-soft-100 dark:divide-stroke-soft-100/50">
				{isLoading ? (
					Array.from({ length: loadingRows }).map((_, index) => (
						<div key={`skeleton-${index}`} className={cn(gridClass, "py-3")}>
							<Skeleton className="h-5 w-16 rounded-md" />
							<Skeleton className="h-4 w-40" />
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-4 w-32" />
							<div className="flex justify-end">
								<Skeleton className="h-4 w-16" />
							</div>
						</div>
					))
				) : logs.length === 0 ? (
					<div className="flex h-32 flex-col items-center justify-center gap-2 text-text-sub-600">
						<Icon name="inbox" className="h-8 w-8 text-text-disabled-300" />
						<p className="text-sm">No email logs found</p>
					</div>
				) : (
					logs.map((log) => {
						const isRowActive = activeDropdownId === log.id;
						return (
							<div
								key={log.id}
								className={cn(
									"group/row w-full transition-colors",
									isRowActive ? "bg-bg-weak-50/50" : "hover:bg-bg-weak-50/50",
								)}
							>
								<Link
									href={`/${orgSlug}/emails/${log.id}`}
									className="contents"
								>
									<div className={cn(gridClass, "w-full py-2.5 text-left")}>
										{/* To */}
										<div className="flex items-center gap-2">
											<div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-neutral-600 to-neutral-500 font-semibold text-white shadow-sm">
												<Icon name="mail-single" className="h-2.5 w-2.5" />
											</div>
											<div className="truncate text-label-sm text-text-sub-600">
												{log.toEmails.join(", ")}
											</div>
										</div>

										{/* Subject */}
										<div className="truncate font-medium text-label-sm text-text-strong-950">
											{log.subject}
										</div>

										{/* Status */}
										<div className="flex items-center">
											<span
												className={cn(
													"inline-flex items-center rounded-full border-[1px] px-[6px] py-0.5 font-medium text-[10px] capitalize",
													getStatusBadgeColor(log.status),
												)}
											>
												{log.status}
											</span>
										</div>

										{/* Time */}
										<div className="truncate text-label-sm text-text-sub-600">
											{formatRelativeTime(log.createdAt)}
										</div>

										{/* Actions */}
										<div
											className="flex justify-end"
											onClick={(e) => e.stopPropagation()}
										>
											<EmailActionsDropdown
												log={log}
												onViewDetails={(id) => push(`/${orgSlug}/emails/${id}`)}
												onOpenChange={(open) =>
													setActiveDropdownId(open ? log.id : null)
												}
											/>
										</div>
									</div>
								</Link>
							</div>
						);
					})
				)}
			</div>

			{/* Table Footer / Pagination */}
			{!isLoading && totalLogs > 0 && (
				<div className="flex items-center justify-between border-stroke-soft-100 border-t px-4 py-2.5 text-text-sub-600 dark:border-stroke-soft-100/50">
					<div className="flex items-center gap-3">
						<span className="text-xs">
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
	);
};
