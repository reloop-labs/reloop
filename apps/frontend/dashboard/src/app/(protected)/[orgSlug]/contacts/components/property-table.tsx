"use client";

import { AnimatedHoverBackground } from "@fe/dashboard/components/layout/sidebar/animated-hover-background";
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
	isLoading?: boolean;
	loadingRows?: number;
	onDelete?: (propertyId: string) => void;
	onAddProperty?: () => void;
}

const getTypeBadgeStyles = (type: string) => {
	if (!type)
		return "border border-stroke-soft-200 text-text-sub-600 bg-neutral-alpha-10";
	switch (type.toLowerCase()) {
		case "string":
			return "border border-primary-base text-primary-base bg-primary-light/20";
		case "number":
			return "border border-violet-500 text-violet-600 bg-violet-100/20";
		default:
			return "border border-stroke-soft-200 text-text-sub-600 bg-neutral-alpha-10";
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
	);
};

export const PropertyTable = ({
	properties,
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

	if (isLoading) {
		return (
			<div className="w-full overflow-hidden rounded-xl border border-stroke-soft-100 text-paragraph-sm dark:border-stroke-soft-100/50">
				{/* Header */}
				<div className="grid grid-cols-[1fr_100px_1fr_120px_40px] items-center border-stroke-soft-100 border-b px-4 py-3.5 text-text-sub-600">
					<div className="flex items-center gap-2">
						<Icon name="tag" className="h-4 w-4" />
						<span className="text-xs">Name</span>
					</div>
					<div className="flex items-center gap-2">
						<Icon name="file-code" className="h-4 w-4" />
						<span className="text-xs">Type</span>
					</div>
					<div className="flex items-center gap-2">
						<Icon name="file-text" className="h-4 w-4" />
						<span className="text-xs">Default</span>
					</div>
					<div className="flex items-center gap-2">
						<Icon name="clock" className="h-4 w-4" />
						<span className="text-xs">Created At</span>
					</div>
					<div />
				</div>
				{/* Skeleton rows */}
				<div className="divide-y divide-stroke-soft-100 dark:divide-stroke-soft-100/50">
					{Array.from({ length: loadingRows }).map((_, index) => (
						<PropertySkeleton key={`skeleton-${index}`} />
					))}
				</div>
			</div>
		);
	}

	return (
		<>
			<div className="w-full overflow-hidden rounded-xl border border-stroke-soft-100 text-paragraph-sm dark:border-stroke-soft-100/50">
				{/* Table Header */}
				<div className="grid grid-cols-[1fr_100px_1fr_120px_40px] items-center border-stroke-soft-100 border-b px-4 py-3.5 text-text-sub-600">
					<div className="flex items-center gap-2">
						<Icon name="tag" className="h-4 w-4" />
						<span className="text-xs">Name</span>
					</div>
					<div className="flex items-center gap-2">
						<Icon name="file-code" className="h-4 w-4" />
						<span className="text-xs">Type</span>
					</div>
					<div className="flex items-center gap-2">
						<Icon name="file-text" className="h-4 w-4" />
						<span className="text-xs">Default</span>
					</div>
					<div className="flex items-center gap-2">
						<Icon name="clock" className="h-4 w-4" />
						<span className="text-xs">Created At</span>
					</div>
					<div />
				</div>

				{/* Rows */}
				<div className="divide-y divide-stroke-soft-100 dark:divide-stroke-soft-100/50">
					{properties.length === 0 && !isLoading ? (
						<PropertiesEmptyState onAddProperty={onAddProperty} />
					) : (
						properties.map((property) => (
							<div
								key={property.id}
								className={cn(
									"group/row grid grid-cols-[1fr_100px_1fr_120px_40px] items-center px-4 py-2 transition-colors",
									"hover:bg-bg-weak-50/50",
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
									<span
										className={cn(
											"inline-flex rounded-md border-[1px] px-[6px] py-0.5 font-medium text-[10px] text-text-sub-600",
											getTypeBadgeStyles(property.propertyType),
										)}
									>
										{property.propertyType}
									</span>
								</div>

								{/* Default Column */}
								<div className="flex items-center">
									<span className="truncate font-medium text-label-sm text-text-sub-600">
										{property.defaultValue || "-"}
									</span>
								</div>

								{/* Created At Column */}
								<div className="flex items-center">
									<span className="truncate whitespace-nowrap font-medium text-label-sm text-text-sub-600">
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
				</div>
			</div>
		</>
	);
};
