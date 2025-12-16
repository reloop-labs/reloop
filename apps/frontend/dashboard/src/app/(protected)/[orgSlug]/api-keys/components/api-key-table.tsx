"use client";
import { AnimatedHoverBackground } from "@fe/dashboard/components/layout/sidebar/animated-hover-background";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { getAnimationProps } from "@fe/dashboard/utils/audience";
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
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useQueryState } from "nuqs";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { DeleteApiKeyModal } from "./delete-api-key-modal";
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
	createdBy?: {
		id: string;
		name: string | null;
		image: string | null;
		email: string | null;
	};
}

interface ApiKeyTableProps {
	apiKeys: ApiKeyData[];
	activeOrganizationSlug: string;
	isLoading?: boolean;
	loadingRows?: number;
}

const getStatusBadgeColor = () => {
	return "text-text-sub-600 border-stroke-soft-200 bg-neutral-alpha-10";
};

const getStatusIconColor = (enabled: boolean) => {
	return enabled ? "text-success-base" : "text-error-base";
};

interface ApiKeyActionsDropdownProps {
	apiKey: ApiKeyData;
	onViewDetails: (id: string) => void;
	onToggleEnabled: (apiKey: ApiKeyData) => void;
	onRotateKey: (apiKey: ApiKeyData) => void;
	onDeleteKey: (id: string) => void;
	isToggling: boolean;
	animationProps: ReturnType<typeof getAnimationProps>;
	onOpenChange?: (open: boolean) => void;
}

const ApiKeyActionsDropdown = ({
	apiKey,
	onViewDetails,
	onToggleEnabled,
	onRotateKey,
	onDeleteKey,
	isToggling,
	animationProps,
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
		{ id: "view", label: "View Details", icon: "eye-outline" as const, isDanger: false },
		{
			id: "toggle",
			label: apiKey.enabled ? "Disable" : "Enable",
			icon: toggleIcon as "pause" | "play",
			isDanger: false,
		},
		{ id: "rotate", label: "Rotate Key", icon: "rotate-cw" as const, isDanger: false },
		{ id: "delete", label: "Delete API Key", icon: "trash" as const, isDanger: true },
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
		<motion.div {...animationProps} className="flex items-center justify-end">
			<PopoverRoot open={popoverOpen} onOpenChange={handlePopoverOpenChange}>
				<PopoverTrigger asChild>
					<Button.Root variant="neutral" mode="ghost" size="xxsmall">
						<Icon name="more-vertical" className="w-3 h-3" />
					</Button.Root>
				</PopoverTrigger>
				<PopoverContent align="end" sideOffset={-4} className="w-40 p-1.5 rounded-xl">
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
									"flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-normal transition-colors",
									item.isDanger ? "text-error-base" : "text-text-strong-950",
									!currentRect && hoverIdx === idx && (item.isDanger ? "bg-red-alpha-10" : "bg-neutral-alpha-10"),
									isToggling && item.id === "toggle" && "opacity-50 cursor-not-allowed"
								)}
							>
								{item.id === "toggle" && isToggling ? (
									<Icon name="loader-2" className="h-3.5 w-3.5 animate-spin text-text-sub-600" />
								) : (
									<Icon
										name={item.icon}
										className={cn("h-3.5 w-3.5", item.isDanger ? "" : "text-text-sub-600")}
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
		</motion.div>
	);
};

export const ApiKeyTable = ({
	apiKeys,
	activeOrganizationSlug,
	isLoading,
	loadingRows = 3,
}: ApiKeyTableProps) => {
	const { push } = useUserOrganization();
	const { mutate } = useSWRConfig();
	const [, setDeleteId] = useQueryState("delete");
	const [togglingId, setTogglingId] = useState<string | null>(null);
	const [rotateModalApiKey, setRotateModalApiKey] = useState<ApiKeyData | null>(null);
	const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

	const handleDeleteApiKey = (apiKeyId: string) => {
		setDeleteId(apiKeyId);
	};

	const handleViewDetails = (apiKeyId: string) => {
		push(`/api-keys/${apiKeyId}`);
	};

	const handleToggleEnabled = async (apiKey: ApiKeyData) => {
		try {
			setTogglingId(apiKey.id);
			const endpoint = apiKey.enabled
				? `/api/api-key/v1/${apiKey.id}/disable`
				: `/api/api-key/v1/${apiKey.id}/enable`;

			await axios.post(endpoint, {}, { headers: { credentials: "include" } });

			// Revalidate all API key caches using a matcher function
			await mutate(
				(key) => typeof key === "string" && key.startsWith("/api/api-key/v1/"),
				undefined,
				{ revalidate: true }
			);

			toast.success(
				apiKey.enabled
					? "API key disabled successfully"
					: "API key enabled successfully",
			);
		} catch (error) {
			const errorMessage = axios.isAxiosError(error)
				? error.response?.data?.message || "Failed to toggle API key"
				: "Failed to toggle API key";
			toast.error(errorMessage);
		} finally {
			setTogglingId(null);
		}
	};

	return (
		<>
			<AnimatePresence mode="wait">
				<div className="w-full overflow-hidden rounded-xl border border-stroke-soft-200/70 text-paragraph-sm shadow-regular-md ring-stroke-soft-200 ring-inset">
					{/* Table Header */}
					<div className="grid grid-cols-[2fr_1fr_1.5fr_1fr_48px] items-center py-3.5 px-4 text-text-sub-600">
						<div className="flex items-center gap-2">
							<Icon name="key-new" className="h-4 w-4" />
							<span className="text-xs">Name</span>
						</div>
						<div className="flex items-center gap-2">
							<Icon name="check-circle" className="h-4 w-4" />
							<span className="text-xs">Status</span>
						</div>
						<div className="flex items-center gap-2">
							<Icon name="user" className="h-4 w-4" />
							<span className="text-xs">Created By</span>
						</div>
						<div className="flex items-center gap-2">
							<Icon name="clock" className="h-4 w-4" />
							<span className="text-xs">Created</span>
						</div>
						<div />
					</div>

					{/* Table Body */}
					<div className="grid grid-cols-[2fr_1fr_1.5fr_1fr_48px]">
						{isLoading
							? // Skeleton loading state
							Array.from({ length: loadingRows }).map((_, index) => (
								<div key={`skeleton-${index}-${activeOrganizationSlug}`} className="contents">
									<div className="flex items-center gap-2 py-2 pl-4 border-t border-stroke-soft-100">
										<Skeleton className="h-4 w-4 rounded" />
										<Skeleton className="h-4 w-24" />
									</div>
									<div className="flex items-center py-2 border-t border-stroke-soft-100">
										<Skeleton className="h-5 w-16 rounded-full" />
									</div>
									<div className="flex items-center gap-2 py-2 border-t border-stroke-soft-100">
										<Skeleton className="h-5 w-5 rounded-full" />
										<Skeleton className="h-4 w-20" />
									</div>
									<div className="flex items-center py-2 border-t border-stroke-soft-100">
										<Skeleton className="h-4 w-16" />
									</div>
									<div className="flex items-center justify-center py-2 pr-4 border-t border-stroke-soft-100">
										<Skeleton className="h-4 w-4 rounded" />
									</div>
								</div>
							))
							: apiKeys.map((apiKey, index) => {
								const displayName =
									apiKey.name || apiKey.start || apiKey.prefix || "Unnamed";
								const isRowActive = activeDropdownId === apiKey.id;

								return (
									<div key={`api-key-${index}`} className="group/row contents">
										<Link
											href={`/${activeOrganizationSlug}/api-keys/${apiKey.id}`}
											className="group/row contents"
										>
											{/* Name Column */}
											<div className={cn(
												"flex items-center gap-2 py-2 pl-4 transition-colors group-hover/row:bg-bg-weak-50/50 border-t border-stroke-soft-100",
												isRowActive && "bg-bg-weak-50/50"
											)}>
												<motion.div
													{...getAnimationProps(index + 1, 0)}
													className="flex items-center gap-2"
												>
													<Icon name="key-new" className="h-4 w-4 text-text-sub-600 shrink-0" />
													<div className="truncate font-medium text-label-sm text-text-strong-950">
														{displayName}
													</div>
												</motion.div>
											</div>

											{/* Status Column */}
											<div className={cn(
												"flex items-center py-2 transition-colors group-hover/row:bg-bg-weak-50/50 border-t border-stroke-soft-100",
												isRowActive && "bg-bg-weak-50/50"
											)}>
												<motion.div {...getAnimationProps(index + 1, 1)} className="flex items-center">
													<span className={cn(
														"inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium border-[1px]",
														getStatusBadgeColor()
													)}>
														<span className={cn("mr-1.5 h-2 w-2 rounded-full", getStatusIconColor(apiKey.enabled), apiKey.enabled ? "bg-success-base" : "bg-error-base")} />
														{apiKey.enabled ? "Enabled" : "Disabled"}
													</span>
												</motion.div>
											</div>

											{/* Created By Column */}
											<div className={cn(
												"flex items-center gap-2 py-2 transition-colors group-hover/row:bg-bg-weak-50/50 border-t border-stroke-soft-100",
												isRowActive && "bg-bg-weak-50/50"
											)}>
												<motion.div {...getAnimationProps(index + 1, 2)} className="flex items-center gap-2">
													<Avatar.Root size="20">
														{apiKey.createdBy?.image ? (
															<Avatar.Image src={apiKey.createdBy.image} alt={apiKey.createdBy?.name || "User"} />
														) : null}
													</Avatar.Root>
													{apiKey.createdBy?.email ? (
														<Tooltip.Root delayDuration={0}>
															<Tooltip.Trigger asChild>
																<span className="text-label-sm text-text-sub-600 truncate cursor-default">
																	{apiKey.createdBy?.name || "Unknown"}
																</span>
															</Tooltip.Trigger>
															<Tooltip.Content
																sideOffset={-3}
																variant="light" className="rounded-xl">
																<div className="flex items-start gap-2 p-1">
																	<Avatar.Root size="20" className="shrink-0 mt-0.5">
																		{apiKey.createdBy?.image ? (
																			<Avatar.Image src={apiKey.createdBy.image} alt={apiKey.createdBy?.name || "User"} />
																		) : null}
																	</Avatar.Root>
																	<div className="flex flex-col items-start justify-start">
																		<span className="font-sm">{apiKey.createdBy?.name || "Unknown"}</span>
																		<span className="text-text-soft-400 text-xs">{apiKey.createdBy.email}</span>
																	</div>
																</div>
															</Tooltip.Content>
														</Tooltip.Root>
													) : (
														<span className="text-label-sm text-text-sub-600 truncate">
															{apiKey.createdBy?.name || "Unknown"}
														</span>
													)}
												</motion.div>
											</div>

											{/* Created Column */}
											<div className={cn(
												"flex items-center py-2 transition-colors group-hover/row:bg-bg-weak-50/50 border-t border-stroke-soft-100",
												isRowActive && "bg-bg-weak-50/50"
											)}>
												<motion.div {...getAnimationProps(index + 1, 3)} className="flex items-center">
													<span className="text-label-sm text-text-sub-600 whitespace-nowrap">
														{formatRelativeTime(apiKey.createdAt)}
													</span>
												</motion.div>
											</div>
										</Link>

										{/* Actions Column - outside Link to prevent navigation on dropdown click */}
										<div className={cn(
											"flex items-center justify-center py-2 pr-4 transition-colors group-hover/row:bg-bg-weak-50/50 border-t border-stroke-soft-100",
											isRowActive && "bg-bg-weak-50/50"
										)}>
											<ApiKeyActionsDropdown
												apiKey={apiKey}
												onViewDetails={handleViewDetails}
												onToggleEnabled={handleToggleEnabled}
												onRotateKey={setRotateModalApiKey}
												onDeleteKey={handleDeleteApiKey}
												isToggling={togglingId === apiKey.id}
												animationProps={getAnimationProps(index + 1, 4)}
												onOpenChange={(open) => setActiveDropdownId(open ? apiKey.id : null)}
											/>
										</div>
									</div>
								);
							})}
					</div>
				</div>
			</AnimatePresence>
			<DeleteApiKeyModal apiKeys={apiKeys} />
			{rotateModalApiKey && (
				<RotateApiKeyModal
					isOpen={!!rotateModalApiKey}
					onClose={() => setRotateModalApiKey(null)}
					apiKeyId={rotateModalApiKey.id}
					apiKeyName={rotateModalApiKey.name || rotateModalApiKey.start || rotateModalApiKey.prefix || "Unnamed"}
				/>
			)}
		</>
	);
};
