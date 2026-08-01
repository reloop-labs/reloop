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
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { useRef, useState } from "react";
import { PageSizeDropdown } from "#/features/api-keys/table/page-size-dropdown";
import { PaginationControls } from "#/features/api-keys/table/pagination-controls";
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";
import { formatRelativeTime } from "#/utils/format-relative-time";
import { EditPropertyRowPanel } from "./edit-property-row-panel";
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
	searchQuery?: string;
	typeFilter?: string;
	onClearFilters?: () => void;
	onClearSearch?: () => void;
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
	const router = useRouter();
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const [popoverOpen, setPopoverOpen] = useState(false);
	const [copiedKey, setCopiedKey] = useState<"name" | "id" | null>(null);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	const menuItems = [
		{
			id: "edit",
			label: "Edit property",
			icon: "edit" as const,
			isDanger: false,
		},
		{
			id: "copy-name",
			label: copiedKey === "name" ? "Copied name!" : "Copy name",
			icon:
				copiedKey === "name" ? ("check-circle" as const) : ("copy" as const),
			isDanger: false,
		},
		{
			id: "copy-id",
			label: copiedKey === "id" ? "Copied ID!" : "Copy property ID",
			icon: copiedKey === "id" ? ("check-circle" as const) : ("copy" as const),
			isDanger: false,
		},
		{
			id: "filter-contacts",
			label: "Filter contacts",
			icon: "filter" as const,
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

	const handleItemClick = async (itemId: string) => {
		if (itemId === "edit") {
			setPopoverOpen(false);
			onEdit(property);
		} else if (itemId === "copy-name") {
			try {
				await navigator.clipboard.writeText(property.propertyName);
				setCopiedKey("name");
				setTimeout(() => {
					setCopiedKey(null);
					setPopoverOpen(false);
				}, 800);
			} catch {
				setPopoverOpen(false);
			}
		} else if (itemId === "copy-id") {
			try {
				await navigator.clipboard.writeText(property.id);
				setCopiedKey("id");
				setTimeout(() => {
					setCopiedKey(null);
					setPopoverOpen(false);
				}, 800);
			} catch {
				setPopoverOpen(false);
			}
		} else if (itemId === "filter-contacts") {
			setPopoverOpen(false);
			{
				const params = new URLSearchParams(
					typeof window !== "undefined" ? window.location.search : "",
				);
				params.set("search", property.propertyName);
				router.push(`/contacts?${params}`);
			}
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
				className="w-48 rounded-xl p-1.5"
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
							onClick={() => void handleItemClick(item.id)}
							className={cn(
								"relative flex min-h-[28px] w-full cursor-pointer items-center gap-2 overflow-hidden rounded-lg px-2 py-1.5 font-medium text-xs transition-colors",
								item.isDanger ? "text-error-base" : "text-text-strong-950",
								!currentRect &&
									hoverIdx === idx &&
									(item.isDanger ? "bg-red-alpha-10" : "bg-neutral-alpha-10"),
							)}
						>
							{item.id === "copy-name" || item.id === "copy-id" ? (
								<AnimatePresence mode="popLayout" initial={false}>
									<motion.div
										key={
											copiedKey === (item.id === "copy-name" ? "name" : "id")
												? "copied"
												: "idle"
										}
										transition={{
											type: "spring",
											duration: 0.25,
											bounce: 0,
										}}
										initial={{ opacity: 0, y: -14 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: 14 }}
										className="flex items-center gap-2"
									>
										<Icon
											name={item.icon}
											className={cn(
												"h-3.5 w-3.5 shrink-0",
												copiedKey === (item.id === "copy-name" ? "name" : "id")
													? "text-success-base"
													: "text-text-sub-600",
											)}
										/>
										<span>{item.label}</span>
									</motion.div>
								</AnimatePresence>
							) : (
								<>
									<Icon
										name={item.icon}
										className={cn(
											"h-3.5 w-3.5 shrink-0",
											item.isDanger ? "" : "text-text-sub-600",
										)}
									/>
									<span>{item.label}</span>
								</>
							)}
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
	onDelete: _onDelete,
	onAddProperty,
	searchQuery,
	typeFilter,
	onClearFilters,
	onClearSearch,
}: PropertyTableProps) => {
	const [, setModal] = useQueryState("modal");
	const [, setId] = useQueryState("id");
	const [openPropertyId, setOpenPropertyId] = useState<string | null>(null);
	const [editingPropertyId, setEditingPropertyId] = useState<string | null>(
		null,
	);

	const handleEdit = (property: Property) => {
		setEditingPropertyId((prev) => (prev === property.id ? null : property.id));
	};

	const handleDelete = (property: Property) => {
		void setModal("delete-property");
		void setId(property.id);
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
			<div className="-mt-2.5 divide-y divide-stroke-soft-100 overflow-hidden rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:divide-stroke-soft-100/50 dark:border-stroke-soft-100/40">
				{isLoading ? (
					Array.from({ length: loadingRows }).map((_, i) => (
						<PropertySkeleton key={`skeleton-${i}`} />
					))
				) : properties.length === 0 ? (
					<PropertiesEmptyState
						onAddProperty={onAddProperty}
						searchQuery={searchQuery}
						typeFilter={typeFilter}
						onClearFilters={onClearFilters || onClearSearch}
					/>
				) : (
					<AnimatePresence mode="popLayout" initial={false}>
						{properties.map((property) => {
							const isEditing = editingPropertyId === property.id;
							const isRowActive = openPropertyId === property.id || isEditing;

							return (
								<motion.div
									key={property.id}
									layout
									initial={{ opacity: 1, height: "auto" }}
									exit={{
										opacity: 0,
										height: 0,
										scale: 0.98,
										transition: {
											height: {
												duration: 0.22,
												ease: [0.32, 0.72, 0, 1],
											},
											opacity: { duration: 0.15, ease: "easeOut" },
											scale: { duration: 0.15, ease: "easeOut" },
											layout: {
												duration: 0.25,
												ease: [0.32, 0.72, 0, 1],
											},
										},
									}}
									className="overflow-hidden"
								>
									<div
										className={cn(
											"group/row grid grid-cols-[1fr_100px_1fr_120px_40px] items-center px-4 py-2 text-left transition-colors",
											"hover:bg-bg-weak-50/50 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-base",
											isRowActive && "bg-bg-weak-50/50",
											isEditing && "bg-bg-weak-50/70",
										)}
									>
										{/* Name Column */}
										<div className="flex items-center gap-2">
											<Icon
												name="tag"
												className="h-4 w-4 shrink-0 text-text-sub-600"
											/>
											<button
												type="button"
												onClick={() => handleEdit(property)}
												className="truncate font-semibold text-label-sm text-text-strong-950 underline decoration-dotted underline-offset-2 transition-colors hover:text-[#1868DF] dark:hover:text-blue-400"
											>
												{property.propertyName}
											</button>
											{isEditing && (
												<span className="rounded-md bg-bg-white-0 px-1.5 py-0.5 font-medium text-[11px] text-text-sub-600 ring-1 ring-stroke-soft-100">
													Editing
												</span>
											)}
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

									<AnimatePresence initial={false}>
										{isEditing ? (
											<motion.div
												key={`edit-${property.id}`}
												initial={{ height: 0, opacity: 0 }}
												animate={{ height: "auto", opacity: 1 }}
												exit={{ height: 0, opacity: 0 }}
												transition={{
													height: {
														duration: 0.28,
														ease: [0.32, 0.72, 0, 1],
													},
													opacity: { duration: 0.2, ease: "easeOut" },
												}}
												className="overflow-hidden"
											>
												<EditPropertyRowPanel
													property={property}
													onClose={() => setEditingPropertyId(null)}
												/>
											</motion.div>
										) : null}
									</AnimatePresence>
								</motion.div>
							);
						})}
					</AnimatePresence>
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
