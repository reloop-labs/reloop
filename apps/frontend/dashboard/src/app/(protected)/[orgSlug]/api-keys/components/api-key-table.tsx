"use client";
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
import { useState } from "react";
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

			await mutate("/api/api-key/v1/?limit=100");

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
				<div className="w-full text-paragraph-sm rounded-xl border border-stroke-soft-100 overflow-hidden">
					{/* Table Header */}
					<div className="grid grid-cols-[2fr_1fr_1fr_1fr_80px] items-center py-3.5 px-4 text-text-sub-600 border-b border-stroke-soft-100">
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
					<div className="divide-y divide-stroke-soft-100">
						{isLoading
							? // Skeleton loading state
							Array.from({ length: loadingRows }).map((_, index) => (
								<div key={`skeleton-${index}-${activeOrganizationSlug}`} className="grid grid-cols-[2fr_1fr_1fr_1fr_80px] items-center py-2 px-4">
									<div className="flex items-center gap-2">
										<Skeleton className="h-4 w-4 rounded" />
										<Skeleton className="h-4 w-24" />
									</div>
									<Skeleton className="h-5 w-16 rounded-full" />
									<div className="flex items-center gap-2">
										<Skeleton className="h-5 w-5 rounded-full" />
										<Skeleton className="h-4 w-20" />
									</div>
									<Skeleton className="h-4 w-16" />
									<div className="flex items-center justify-end">
										<Skeleton className="h-4 w-4 rounded" />
									</div>
								</div>
							))
							: apiKeys.map((apiKey, index) => {
								const displayName =
									apiKey.name || apiKey.start || apiKey.prefix || "Unnamed";
								const displayPrefix = apiKey.start || apiKey.prefix || "---";

								return (
									<div
										key={`api-key-${index}`}
										className={cn(
											"group/row grid grid-cols-[2fr_1fr_1fr_1fr_80px] items-center py-2 px-4 transition-colors",
											"hover:bg-bg-weak-50/50"
										)}
									>
										{/* Name Column */}
										<motion.div
											{...getAnimationProps(index + 1, 0)}
											className="flex items-center gap-2"
										>
											<Icon name="key-new" className="h-4 w-4 text-text-sub-600 shrink-0" />
											<Link
												href={`/${activeOrganizationSlug}/api-keys/${apiKey.id}`}
												className="min-w-0 flex-1"
											>
												<div className="truncate font-medium text-label-sm text-text-strong-950">
													{displayName}
												</div>
											</Link>
										</motion.div>

										{/* Status Column */}
										<motion.div {...getAnimationProps(index + 1, 1)} className="flex items-center">
											<span className={cn(
												"inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium border-[1px]",
												getStatusBadgeColor()
											)}>
												<span className={cn("mr-1.5 h-2 w-2 rounded-full", getStatusIconColor(apiKey.enabled), apiKey.enabled ? "bg-success-base" : "bg-error-base")} />
												{apiKey.enabled ? "Enabled" : "Disabled"}
											</span>
										</motion.div>
										{/* Created By Column */}
										<motion.div {...getAnimationProps(index + 1, 2)} className="flex items-center gap-2">
											<Avatar.Root size="20">
												{apiKey.createdBy?.image ? (
													<Avatar.Image src={apiKey.createdBy.image} alt={apiKey.createdBy?.name || "User"} />
												) : null}
											</Avatar.Root>
											{apiKey.createdBy?.email ? (
												<Tooltip.Root>
													<Tooltip.Trigger asChild>
														<span className="text-label-sm text-text-sub-600 truncate cursor-default">
															{apiKey.createdBy?.name || "Unknown"}
														</span>
													</Tooltip.Trigger>
													<Tooltip.Content>{apiKey.createdBy.email}</Tooltip.Content>
												</Tooltip.Root>
											) : (
												<span className="text-label-sm text-text-sub-600 truncate">
													{apiKey.createdBy?.name || "Unknown"}
												</span>
											)}
										</motion.div>

										{/* Created Column */}
										<motion.div {...getAnimationProps(index + 1, 3)} className="flex items-center">
											<span className="text-label-sm text-text-sub-600">
												{formatRelativeTime(apiKey.createdAt)}
											</span>
										</motion.div>

										{/* Actions Column */}
										<motion.div
											{...getAnimationProps(index + 1, 4)}
											className="flex items-center justify-end"
										>
											<PopoverRoot>
												<PopoverTrigger asChild>
													<Button.Root
														variant="neutral"
														mode="ghost"
														size="xxsmall"
													>
														<Icon name="more-vertical" className="w-3 h-3" />
													</Button.Root>
												</PopoverTrigger>
												<PopoverContent align="end" className="w-48 p-2">
													<div className="flex flex-col gap-1">
														<Button.Root
															variant="neutral"
															mode="ghost"
															size="small"
															onClick={() => handleViewDetails(apiKey.id)}
															className="w-full justify-start"
														>
															<Icon
																name="eye-outline"
																className="h-4 w-4"
															/>
															View Details
														</Button.Root>
														<Button.Root
															variant="neutral"
															mode="ghost"
															size="small"
															onClick={() => handleToggleEnabled(apiKey)}
															className="w-full justify-start"
															disabled={togglingId === apiKey.id}
														>
															{togglingId === apiKey.id ? (
																<Icon name="loader-2" className="h-4 w-4 animate-spin" />
															) : (
																<Icon
																	name={apiKey.enabled ? "pause" : "play"}
																	className="h-4 w-4"
																/>
															)}
															{apiKey.enabled ? "Disable" : "Enable"}
														</Button.Root>
														<Button.Root
															variant="neutral"
															mode="ghost"
															size="small"
															onClick={() => setRotateModalApiKey(apiKey)}
															className="w-full justify-start"
														>
															<Icon name="rotate-cw" className="h-4 w-4" />
															Rotate Key
														</Button.Root>
														<Button.Root
															variant="error"
															mode="ghost"
															size="small"
															onClick={() => handleDeleteApiKey(apiKey.id)}
															className="w-full justify-start"
														>
															<Icon name="trash" className="h-4 w-4" />
															Delete API Key
														</Button.Root>
													</div>
												</PopoverContent>
											</PopoverRoot>
										</motion.div>
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
