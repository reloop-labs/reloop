"use client";

import { AnimatedHoverBackground } from "@fe/dashboard/components/animated-hover-background";
import { PageSizeDropdown } from "@fe/dashboard/components/page-size-dropdown";
import { PaginationControls } from "@fe/dashboard/components/pagination-controls";
import { formatRelativeTime } from "@fe/dashboard/utils/time";
import * as Badge from "@reloop/ui/badge";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import {
	Content as PopoverContent,
	Root as PopoverRoot,
	Trigger as PopoverTrigger,
} from "@reloop/ui/popover";
import { Skeleton } from "@reloop/ui/skeleton";
import { useQueryState } from "nuqs";
import { useRef, useState } from "react";
import { PropertiesEmptyState } from "./properties-empty-state";

interface Property {
	id: string;
	propertyName: string;
	propertyType: string;
	defaultValue: string | null;
	organizationId: string;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
}

interface PropertyTableProps {
	properties: Property[];
	total?: number;
	currentPage?: number;
	pageSize?: number;
	onPageChange?: (page: number) => void;
	onPageSizeChange?: (size: number) => void;
	isLoading?: boolean;
	loadingRows?: number;
	onDelete?: (propertyId: string) => void;
	onAddProperty?: () => void;
}

const getBadgeColor = (type: string) => {
	switch (type?.toLowerCase()) {
		case "string":
			return "blue";
		case "number":
			return "purple";
		default:
			return "gray";
	}
};

const PropertySkeleton = () => (
	<div className="grid grid-cols-[1fr_100px_1fr_120px_40px] items-center px-4 py-2">
		<div className="flex items-center gap-3">
			<Skeleton className="h-4 w-4" />
			<Skeleton className="h-4 w-32" />
		</div>
		<Skeleton className="h-5 w-16 rounded-md" />
		<Skeleton className="h-4 w-24" />
		<Skeleton className="h-4 w-20" />
		<div className="flex items-center justify-end">
			<Skeleton className="h-4 w-4 rounded" />
		</div>
	</div>
);

interface PropertyActionsPopoverProps {
	property: Property;
	onEdit: (property: Property) => void;
	onDelete: (property: Property) => void;
	onOpenChange?: (open: boolean) => void;
}

const PropertyActionsPopover = ({
	property,
	onEdit,
	onDelete,
	onOpenChange,
}: PropertyActionsPopoverProps) => {
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const [popoverOpen, setPopoverOpen] = useState(false);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	const menuItems = [
		{
			id: "edit",
			label: "Edit property",
			icon: "edit" as const,
			isDanger: false,
		},
		{
			id: "delete",
			label: "Delete property",
			icon: "trash" as const,
			isDanger: true,
		},
	];

	const currentTab = buttonRefs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();
	const hoveredItem = menuItems[hoverIdx ?? -1];
	const isDanger = hoveredItem?.isDanger ?? false;

	const handleItemClick = (itemId: string) => {
		if (itemId === "edit") {
			setPopoverOpen(false);
			onEdit(property);
		} else if (itemId === "delete") {
			setPopoverOpen(false);
			onDelete(property);
		}
	};

	return (
		<PopoverRoot
			open={popoverOpen}
			onOpenChange={(open) => {
				setPopoverOpen(open);
				onOpenChange?.(open);
			}}
		>
			<PopoverTrigger asChild>
				<Button.Root variant="neutral" mode="ghost" size="xxsmall">
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
								"flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 font-medium text-xs transition-colors",
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
	);
};

export const PropertyTable = ({
	properties,
	total = 0,
	currentPage = 1,
	pageSize = 10,
	onPageChange,
	onPageSizeChange,
	isLoading,
	loadingRows = 4,
	onDelete,
	onAddProperty,
}: PropertyTableProps) => {
	const [, setModal] = useQueryState("modal");
	const [id, setId] = useQueryState("id");
	const [openPropertyId, setOpenPropertyId] = useState<string | null>(null);

	const handleEdit = (property: Property) => {
		setModal("edit-property");
		setId(property.id);
	};

	const handleDelete = (property: Property) => {
		setModal("delete-property");
		setId(property.id);
	};

	const totalPages = Math.ceil(total / pageSize);
	const startIndex = (currentPage - 1) * pageSize + 1;
	const endIndex = Math.min(currentPage * pageSize, total);

	return (
		<div className="w-full text-paragraph-sm">
			{/* Table Header */}
			<div className="grid grid-cols-[1fr_100px_1fr_120px_40px] items-center rounded-t-[14px] border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-4 pt-2.5 pb-5 font-medium text-text-sub-600 dark:border-[#101010] dark:bg-bg-weak-50/40">
				<div className="flex items-center gap-1">
					<Icon name="tag" className="h-3 w-3" />
					<span className="text-xs">Name</span>
				</div>
				<div className="flex items-center gap-1">
					<Icon name="file-code" className="h-3 w-3" />
					<span className="text-xs">Type</span>
				</div>
				<div className="flex items-center gap-1">
					<Icon name="file-text" className="h-3 w-3" />
					<span className="text-xs">Default</span>
				</div>
				<div className="flex items-center gap-1">
					<Icon name="clock" className="h-3 w-3" />
					<span className="text-xs">Created At</span>
				</div>
				<div />
			</div>

			{/* Rows */}
			<div className="-mt-2.5 overflow-hidden divide-y divide-stroke-soft-100 rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:divide-stroke-soft-100/50 dark:border-stroke-soft-100/40">
				{isLoading ? (
					Array.from({ length: loadingRows }).map((_, i) => (
						<PropertySkeleton key={`skeleton-${i}`} />
					))
				) : properties.length === 0 ? (
					<PropertiesEmptyState onAddProperty={onAddProperty} />
				) : (
					properties.map((property) => (
						<div
							key={property.id}
							className={cn(
								"group/row grid grid-cols-[1fr_100px_1fr_120px_40px] items-center px-4 py-2 text-left transition-colors",
								"hover:bg-bg-weak-50/50 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-base",
								openPropertyId === property.id && "bg-bg-weak-50/50",
							)}
						>
							{/* Name Column */}
							<div className="flex items-center gap-2">
								<div className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-neutral-600 to-neutral-500 font-semibold text-white shadow-sm">
									<Icon name="tag" className="h-2.5 w-2.5" />
								</div>
								<span className="truncate font-medium text-label-sm text-text-strong-950">
									{property.propertyName}
								</span>
							</div>

							{/* Type Column */}
							<div className="flex items-center">
								<Badge.Root
									size="small"
									variant="lighter"
									color={getBadgeColor(property.propertyType)}
									className="h-5 rounded-md px-1.5 font-medium text-xs capitalize"
								>
									{property.propertyType}
								</Badge.Root>
							</div>

							{/* Default Column */}
							<div className="flex items-center">
								<span className="truncate font-medium text-label-sm text-text-strong-950">
									{property.defaultValue || "-"}
								</span>
							</div>

							{/* Created At Column */}
							<div className="flex items-center">
								<span className="truncate whitespace-nowrap font-medium text-[13px]">
									{formatRelativeTime(property.createdAt)}
								</span>
							</div>

							{/* Actions Column */}
							<div className="flex items-center justify-end">
								<PropertyActionsPopover
									property={property}
									onEdit={handleEdit}
									onDelete={handleDelete}
									onOpenChange={(open) =>
										setOpenPropertyId(open ? property.id : null)
									}
								/>
							</div>
						</div>
					))
				)}

				{/* Pagination Footer */}
				{!isLoading && total > 0 && (
					<div className="flex items-center justify-between px-4 py-2 text-label-xs text-text-sub-600">
						<div className="flex items-center gap-3">
							<span>
								Showing {startIndex}–{endIndex} of {total} propert
								{total !== 1 ? "ies" : "y"}
							</span>
							<PageSizeDropdown
								value={pageSize}
								onValueChange={(value) => onPageSizeChange?.(value)}
							/>
						</div>
						<PaginationControls
							currentPage={currentPage}
							totalPages={totalPages}
							onPageChange={(page) => onPageChange?.(page)}
							isLoading={isLoading}
						/>
					</div>
				)}
			</div>
		</div>
	);
};
