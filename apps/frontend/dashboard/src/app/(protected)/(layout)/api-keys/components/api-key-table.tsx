"use client";
import { AnimatedHoverBackground } from "@fe/dashboard/components/animated-hover-background";
import { PageSizeDropdown } from "@fe/dashboard/components/page-size-dropdown";
import { PaginationControls } from "@fe/dashboard/components/pagination-controls";
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
import * as Tooltip from "@reloop/ui/tooltip";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { parseAsInteger, useQueryState } from "nuqs";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { DeleteApiKeyModal } from "./delete-api-key-modal";
import { EditApiKeyModal } from "./edit-api-key-modal";
import { EmptyState } from "./empty-state";
import { RotateApiKeyModal } from "./rotate-api-key-modal";

interface ApiKeyData {
	id: string;
	name: string | null;
	start: string | null;
	prefix: string | null;
	enabled: boolean;
	requestCount: number;
	remaining: number | null;
	expiresAt: string | null;
	createdAt: string;
	lastRequest: string | null;
	createdBy?: {
		id: string;
		name: string | null;
		image: string | null;
		email: string | null;
	};
}

interface ApiKeyListResponse {
	apiKeys: ApiKeyData[];
	total: number;
	page: number;
	limit: number;
}

interface ApiKeyTableProps {
	apiKeys: ApiKeyData[];
	total: number;
	mutate: (
		key?: string | ((key: unknown) => boolean),
		data?:
			| ApiKeyListResponse
			| ((
					current: ApiKeyListResponse | undefined,
			  ) => ApiKeyListResponse | undefined),
		options?: boolean | { revalidate?: boolean },
	) => Promise<ApiKeyListResponse | undefined> | unknown;
	isLoading?: boolean;
	loadingRows?: number;
}

interface ApiKeyActionsDropdownProps {
	apiKey: ApiKeyData;
	onViewDetails: (id: string) => void;
	onToggleEnabled: (apiKey: ApiKeyData) => void;
	onEditKey: (apiKey: ApiKeyData) => void;
	onRotateKey: (apiKey: ApiKeyData) => void;
	onDeleteKey: (id: string) => void;
	isToggling: boolean;
	onOpenChange?: (open: boolean) => void;
}

const ApiKeyActionsDropdown = ({
	apiKey,
	onViewDetails,
	onToggleEnabled,
	onEditKey,
	onRotateKey,
	onDeleteKey,
	isToggling,
	onOpenChange,
}: ApiKeyActionsDropdownProps) => {
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const [popoverOpen, setPopoverOpen] = useState(false);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	const handlePopoverOpenChange = (open: boolean) => {
		setPopoverOpen(open);
		onOpenChange?.(open);
	};

	const toggleIcon = apiKey.enabled ? "pause" : "play";
	const menuItems = [
		{
			id: "view",
			label: "View Details",
			icon: "eye-outline" as const,
			isDanger: false,
		},
		{
			id: "toggle",
			label: apiKey.enabled ? "Disable" : "Enable",
			icon: toggleIcon as "pause" | "play",
			isDanger: false,
		},
		{
			id: "edit",
			label: "Edit",
			icon: "edit" as const,
			isDanger: false,
		},
		{
			id: "rotate",
			label: "Rotate Key",
			icon: "rotate-cw" as const,
			isDanger: false,
		},
		{
			id: "delete",
			label: "Delete API Key",
			icon: "trash" as const,
			isDanger: true,
		},
	];

	const currentTab = buttonRefs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();
	const hoveredItem = menuItems[hoverIdx ?? -1];
	const isDanger = hoveredItem?.isDanger ?? false;

	const handleItemClick = (itemId: string) => {
		if (itemId === "view") {
			onViewDetails(apiKey.id);
			setPopoverOpen(false);
		} else if (itemId === "toggle") {
			onToggleEnabled(apiKey);
			setPopoverOpen(false);
		} else if (itemId === "rotate") {
			onRotateKey(apiKey);
			setPopoverOpen(false);
		} else if (itemId === "delete") {
			onDeleteKey(apiKey.id);
			setPopoverOpen(false);
		}
	};

	return (
		<div className="flex items-center justify-end">
			<PopoverRoot open={popoverOpen} onOpenChange={handlePopoverOpenChange}>
				<PopoverTrigger asChild>
					<Button.Root variant="neutral" mode="ghost" size="xxsmall">
						<Icon name="more-horizontal" className="h-3 w-3" />
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
								disabled={item.id === "toggle" && isToggling}
								className={cn(
									"flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 font-medium text-xs transition-colors",
									item.isDanger ? "text-error-base" : "text-text-strong-950",
									!currentRect &&
										hoverIdx === idx &&
										(item.isDanger ? "bg-red-alpha-10" : "bg-neutral-alpha-10"),
									isToggling &&
										item.id === "toggle" &&
										"cursor-not-allowed opacity-50",
								)}
							>
								{item.id === "toggle" && isToggling ? (
									<Icon
										name="loader-2"
										className="h-3.5 w-3.5 animate-spin text-text-sub-600"
									/>
								) : (
									<Icon
										name={item.icon}
										className={cn(
											"h-3.5 w-3.5",
											item.isDanger ? "" : "text-text-sub-600",
										)}
									/>
								)}
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

export const ApiKeyTable = ({
	apiKeys,
	total,
	mutate,
	isLoading,
	loadingRows = 3,
}: ApiKeyTableProps) => {
	const router = useRouter();
	const [, setDeleteId] = useQueryState("delete");
	const [, setRotateId] = useQueryState("rotate");
	const [, setEditId] = useQueryState("edit");
	const [, setModal] = useQueryState("modal");
	const [currentPage, setCurrentPage] = useQueryState(
		"page",
		parseAsInteger.withDefault(1),
	);
	const [pageSize, setPageSize] = useQueryState(
		"limit",
		parseAsInteger.withDefault(10),
	);
	const [togglingId, setTogglingId] = useState<string | null>(null);
	const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

	const totalPages = Math.ceil(total / (pageSize ?? 10));
	const startIndex = ((currentPage ?? 1) - 1) * (pageSize ?? 10) + 1;
	const endIndex = Math.min((currentPage ?? 1) * (pageSize ?? 10), total);

	const handleDeleteApiKey = (apiKeyId: string) => {
		setDeleteId(apiKeyId);
	};

	const handleViewDetails = (apiKeyId: string) => {
		router.push(`/api-keys/${apiKeyId}`);
	};

	const handleEditApiKey = (apiKey: ApiKeyData) => {
		setEditId(apiKey.id);
	};

	const handleAddApiKey = () => {
		setModal("create-api-key");
	};

	const handleToggleEnabled = async (apiKey: ApiKeyData) => {
		const newEnabled = !apiKey.enabled;
		const optimisticDataTransformation = (
			currentData: ApiKeyListResponse | undefined,
		) => {
			if (!currentData || !currentData.apiKeys) return currentData;
			return {
				...currentData,
				apiKeys: currentData.apiKeys.map((k: ApiKeyData) =>
					k.id === apiKey.id ? { ...k, enabled: newEnabled } : k,
				),
			};
		};

		try {
			setTogglingId(apiKey.id);

			// Optimistically update the UI
			mutate(
				(key: unknown) =>
					typeof key === "string" && key.startsWith("/api/api-key/v1/"),
				optimisticDataTransformation,
				{ revalidate: false },
			);

			const endpoint = apiKey.enabled
				? `/api/api-key/v1/disable/${apiKey.id}`
				: `/api/api-key/v1/enable/${apiKey.id}`;

			await axios.post(endpoint, {}, { withCredentials: true });

			toast.success(
				newEnabled
					? "API key enabled successfully"
					: "API key disabled successfully",
			);
		} catch (error) {
			const errorMessage = axios.isAxiosError(error)
				? error.response?.data?.message || "Failed to toggle API key"
				: "Failed to toggle API key";
			toast.error(errorMessage);
		} finally {
			setTogglingId(null);
			// Revalidate in the background to ensure consistency
			mutate(
				(key: unknown) =>
					typeof key === "string" && key.startsWith("/api/api-key/v1/"),
				undefined,
				{ revalidate: true },
			);
		}
	};

	return (
		<>
			<div className="w-full overflow-hidden rounded-xl border border-stroke-soft-100 text-paragraph-sm dark:border-stroke-soft-100/40">
				{/* Table Header */}
				<div className="grid grid-cols-[1fr_1.3fr_1.1fr_1fr_0.8fr_0.8fr_34px] items-center border-stroke-soft-100 border-b bg-bg-weak-50/50 px-4 py-2.5 font-medium text-text-sub-600 dark:border-[#101010] dark:bg-bg-weak-50/40">
					<div className="flex items-center gap-1">
						<span className="text-xs">Name</span>
					</div>
					<div className="flex items-center gap-1">
						<Icon name="key-new" className="h-3 w-3" />
						<span className="text-xs">Prefix</span>
					</div>
					<div className="flex items-center gap-1">
						<Icon name="user" className="h-3 w-3" />
						<span className="text-xs">Created By</span>
					</div>
					<div className="flex items-center gap-1">
						<Icon name="history" className="h-3 w-3" />
						<span className="text-xs">Last Used</span>
					</div>
					<div className="flex items-center gap-1">
						<Icon name="calendar" className="h-3 w-3" />
						<span className="text-xs">Created</span>
					</div>
					<div className="flex items-center gap-1">
						<Icon name="activity" className="h-3 w-3" />
						<span className="text-xs">Status</span>
					</div>
					<div />
				</div>

				{/* Table Body */}
				<div className="divide-y divide-stroke-soft-100 dark:divide-stroke-soft-100/50">
					{isLoading && apiKeys.length === 0 ? (
						// Skeleton loading state
						Array.from({ length: loadingRows }).map((_, index) => (
							<div
								key={`skeleton-${index}`}
								className="grid grid-cols-[1fr_1.3fr_1.1fr_1fr_0.8fr_0.8fr_34px] items-center px-4 py-2"
							>
								<div className="flex items-center gap-2">
									<Skeleton className="h-4 w-24" />
								</div>
								<div className="flex items-center">
									<Skeleton className="h-4 w-12" />
								</div>
								<div className="flex items-center gap-2">
									<Skeleton className="h-5 w-5 rounded-full" />
									<Skeleton className="h-4 w-20" />
								</div>
								<div className="flex items-center">
									<Skeleton className="h-4 w-20" />
								</div>
								<div className="flex items-center">
									<Skeleton className="h-4 w-16" />
								</div>
								<div className="flex items-center">
									<Skeleton className="h-5 w-16 rounded-full" />
								</div>
								<div className="flex items-center justify-end">
									<Skeleton className="h-4 w-4 rounded" />
								</div>
							</div>
						))
					) : apiKeys.length === 0 ? (
						<div className="w-full">
							<EmptyState onCreateApiKey={handleAddApiKey} />
						</div>
					) : (
						apiKeys.map((apiKey, index) => {
							const displayName =
								apiKey.name || apiKey.start || apiKey.prefix || "Unnamed";
							const isRowActive = activeDropdownId === apiKey.id;

							return (
								<div
									key={`api-key-${index}`}
									className={cn(
										"group/row grid w-full cursor-pointer grid-cols-[1fr_1.3fr_1.1fr_1fr_0.8fr_0.8fr_34px] items-center px-4 py-2 text-left transition-colors",
										"hover:bg-bg-weak-50/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-base focus-visible:ring-offset-1",
										isRowActive && "bg-bg-weak-50/50",
									)}
								>
									<Link href={`/api-keys/${apiKey.id}`} className="contents">
										{/* Name Column */}
										<div className="flex items-center gap-2">
											<div className="truncate font-medium text-label-sm text-text-strong-950">
												{displayName}
											</div>
										</div>

										{/* Prefix Column */}
										<div className="flex items-center">
											<span className="rounded-md bg-bg-weak-50 px-1.5 py-0.5 font-semibold text-[11px] text-text-sub-600 dark:bg-bg-weak-50/20">
												{apiKey.start || "rl_..."}
											</span>
										</div>

										{/* Created By Column */}
										<div className="flex items-center gap-1">
											<Avatar.Root
												size="20"
												className="rounded-full bg-transparent"
											>
												{apiKey.createdBy?.image ? (
													<Avatar.Image
														src={apiKey.createdBy.image}
														alt={apiKey.createdBy?.name || "User"}
														className="rounded-full"
													/>
												) : null}
											</Avatar.Root>
											{apiKey.createdBy?.email ? (
												<Tooltip.Root delayDuration={0}>
													<Tooltip.Trigger asChild>
														<span className="cursor-default truncate font-medium text-label-sm text-text-sub-600">
															{apiKey.createdBy?.name?.split(" ")[0] ||
																"Unknown"}
														</span>
													</Tooltip.Trigger>
													<Tooltip.Content
														sideOffset={-3}
														variant="light"
														className="rounded-xl"
													>
														<div className="flex items-start gap-2 p-1">
															<Avatar.Root
																size="20"
																className="mt-0.5 shrink-0 rounded-full bg-transparent"
															>
																{apiKey.createdBy?.image ? (
																	<Avatar.Image
																		src={apiKey.createdBy.image}
																		alt={apiKey.createdBy?.name || "User"}
																		className="rounded-full"
																	/>
																) : null}
															</Avatar.Root>
															<div className="flex flex-col items-start justify-start">
																<span className="font-sm">
																	{apiKey.createdBy?.name || "Unknown"}
																</span>
																<span className="text-text-soft-400 text-xs">
																	{apiKey.createdBy.email}
																</span>
															</div>
														</div>
													</Tooltip.Content>
												</Tooltip.Root>
											) : (
												<span className="truncate text-label-sm text-text-sub-600">
													{apiKey.createdBy?.name?.split(" ")[0] || "Unknown"}
												</span>
											)}
										</div>

										{/* Last Used Column */}
										<div className="flex items-center">
											<span className="whitespace-nowrap font-medium text-sm text-text-sub-600">
												{apiKey.lastRequest
													? formatRelativeTime(apiKey.lastRequest)
													: "No Activity"}
											</span>
										</div>

										{/* Created Column */}
										<div className="flex items-center">
											<span className="whitespace-nowrap font-medium text-sm text-text-sub-600">
												{formatRelativeTime(apiKey.createdAt)}
											</span>
										</div>

										{/* Status Column */}
										<div className="flex items-center">
											<div
												className={cn(
													"flex items-center gap-2 rounded-lg py-0.5 font-medium text-[13px] capitalize",
													apiKey.enabled
														? "text-success-base"
														: "text-error-base",
												)}
											>
												<Icon
													name={
														apiKey.enabled ? "check-circle" : "cross-circle"
													}
													className="h-3.5 w-3.5"
												/>
												{apiKey.enabled ? "Active" : "Disabled"}
											</div>
										</div>
									</Link>

									{/* Actions Column - outside Link to prevent navigation on dropdown click */}
									<div
										className="flex items-center justify-end"
										onClick={(e) => e.stopPropagation()}
									>
										<ApiKeyActionsDropdown
											apiKey={apiKey}
											onViewDetails={handleViewDetails}
											onToggleEnabled={handleToggleEnabled}
											onEditKey={handleEditApiKey}
											onRotateKey={(key) => setRotateId(key.id)}
											onDeleteKey={handleDeleteApiKey}
											isToggling={togglingId === apiKey.id}
											onOpenChange={(open) =>
												setActiveDropdownId(open ? apiKey.id : null)
											}
										/>
									</div>
								</div>
							);
						})
					)}
				</div>

				{/* Pagination Footer */}
				{total > 0 && (
					<div className="flex items-center justify-between border-stroke-soft-100 border-t px-4 py-2 text-label-xs text-text-sub-600 dark:border-stroke-soft-100/40">
						<div className="flex items-center">
							<span>
								Showing {startIndex}–{endIndex} of {total} API key
								{total !== 1 ? "s" : ""}
							</span>
							<PageSizeDropdown
								value={pageSize}
								onValueChange={(value) => {
									setPageSize(value);
									setCurrentPage(1);
								}}
							/>
						</div>
						<PaginationControls
							currentPage={currentPage}
							totalPages={totalPages}
							onPageChange={setCurrentPage}
							isLoading={isLoading}
						/>
					</div>
				)}
			</div>
			<DeleteApiKeyModal apiKeys={apiKeys} />
			<RotateApiKeyModal apiKeys={apiKeys} />
			<EditApiKeyModal apiKeys={apiKeys} />
		</>
	);
};
