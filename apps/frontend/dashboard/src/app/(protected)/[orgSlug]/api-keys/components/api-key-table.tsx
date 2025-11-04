"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { getAnimationProps } from "@fe/dashboard/utils/audience";
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
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useQueryState } from "nuqs";
import { DeleteApiKeyModal } from "./delete-api-key-modal";

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
}

interface ApiKeyTableProps {
	apiKeys: ApiKeyData[];
	activeOrganizationSlug: string;
	isLoading?: boolean;
	loadingRows?: number;
}

const getStatusColor = (enabled: boolean) => {
	return enabled
		? "text-success-base border-success-base bg-success-light/20"
		: "text-faded-base border-faded-base bg-faded-light/20";
};

const getStatusIcon = (enabled: boolean) => {
	return enabled ? "check-circle" : "x-circle";
};

export const ApiKeyTable = ({
	apiKeys,
	activeOrganizationSlug,
	isLoading,
	loadingRows = 3,
}: ApiKeyTableProps) => {
	const { push } = useUserOrganization();
	const [, setDeleteId] = useQueryState("delete");

	const handleDeleteApiKey = (apiKeyId: string) => {
		setDeleteId(apiKeyId);
	};

	const handleViewDetails = (apiKeyId: string) => {
		push(`/api-keys/${apiKeyId}`);
	};

	return (
		<>
			<AnimatePresence mode="wait">
				<div className="w-full overflow-hidden rounded-xl border border-stroke-soft-200 text-paragraph-sm shadow-regular-md ring-stroke-soft-200 ring-inset">
					<div className="grid grid-cols-[1fr_minmax(120px,auto)_minmax(100px,auto)_minmax(100px,auto)_minmax(120px,auto)_minmax(120px,auto)_minmax(40px,auto)]">
						<div className="bg-bg-weak-50 pl-5 font-medium text-text-sub-600">
							<div className="py-2.5">Name</div>
						</div>
						<div className="bg-bg-weak-50 font-medium text-text-sub-600">
							<div className="px-3 py-2.5">Status</div>
						</div>
						<div className="bg-bg-weak-50 font-medium text-text-sub-600">
							<div className="px-3 py-2.5">Requests</div>
						</div>
						<div className="bg-bg-weak-50 font-medium text-text-sub-600">
							<div className="px-3 py-2.5">Remaining</div>
						</div>
						<div className="bg-bg-weak-50 font-medium text-text-sub-600">
							<div className="px-3 py-2.5">Expires At</div>
						</div>
						<div className="bg-bg-weak-50 font-medium text-text-sub-600">
							<div className="py-2.5">Created At</div>
						</div>
						<div className="bg-bg-weak-50 font-medium text-text-sub-600">
							<div className="py-2.5" />
						</div>
						{isLoading
							? // Skeleton loading state
								Array.from({ length: loadingRows }).map((_, index) => (
									<div key={`skeleton-${index}`} className="group/row contents">
										<div className="flex items-center border-stroke-soft-200 border-t py-2.5">
											<div className="my-1 pl-5">
												<Skeleton className="h-4 w-32" />
											</div>
										</div>
										<div className="flex items-center border-stroke-soft-200 border-t py-2.5">
											<div className="px-3">
												<Skeleton className="h-4 w-16" />
											</div>
										</div>
										<div className="flex items-center border-stroke-soft-200 border-t py-2.5">
											<div className="px-3">
												<Skeleton className="h-4 w-12" />
											</div>
										</div>
										<div className="flex items-center border-stroke-soft-200 border-t py-2.5">
											<div className="px-3">
												<Skeleton className="h-4 w-12" />
											</div>
										</div>
										<div className="flex items-center border-stroke-soft-200 border-t py-2.5">
											<div className="px-3">
												<Skeleton className="h-4 w-16" />
											</div>
										</div>
										<div className="flex items-center border-stroke-soft-200 border-t py-2.5">
											<Skeleton className="h-4 w-20" />
										</div>
										<div className="flex items-center border-stroke-soft-200 border-t py-2.5">
											<Skeleton className="h-4 w-4" />
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
											className="group/row contents"
										>
											<div className="flex items-center border-stroke-soft-200 border-t py-2 group-hover/row:bg-bg-weak-50">
												<motion.div
													{...getAnimationProps(index + 1, 0)}
													className="flex items-center gap-2 pl-5"
												>
													<Link
														href={`/${activeOrganizationSlug}/api-keys/${apiKey.id}`}
														className="flex items-center gap-2"
													>
														<Icon
															name="key"
															className="h-4 w-4 text-text-sub-600"
														/>
														<div className="flex flex-col">
															<div
																className={cn(
																	"truncate text-label-xs text-text-strong-950 text-xs",
																)}
															>
																{displayName}
															</div>
															<div
																className={cn(
																	"truncate font-mono text-label-xs text-text-sub-400 text-xs",
																)}
															>
																{displayPrefix}
															</div>
														</div>
													</Link>
												</motion.div>
											</div>
											<div className="flex items-center border-stroke-soft-200 border-t py-2 group-hover/row:bg-bg-weak-50">
												<motion.div
													{...getAnimationProps(index + 1, 1)}
													className="flex items-center gap-2 px-3"
												>
													<div
														className={cn(
															"py flex items-center rounded-full border px-1 font-medium text-xs",
															getStatusColor(apiKey.enabled),
														)}
													>
														<Icon
															name={getStatusIcon(apiKey.enabled)}
															className="mr-1 h-3 w-3"
														/>
														{apiKey.enabled ? "Enabled" : "Disabled"}
													</div>
												</motion.div>
											</div>
											<div className="flex items-center border-stroke-soft-200 border-t py-2 pl-1 group-hover/row:bg-bg-weak-50">
												<motion.div
													{...getAnimationProps(index + 1, 2)}
													className="flex items-center gap-2 px-3 font-medium"
												>
													<span className="text-label-sm text-text-strong-950">
														{apiKey.requestCount}
													</span>
												</motion.div>
											</div>
											<div className="flex items-center border-stroke-soft-200 border-t py-2 group-hover/row:bg-bg-weak-50">
												<motion.div
													{...getAnimationProps(index + 1, 3)}
													className="flex items-center gap-2 px-3 font-medium"
												>
													<span className="text-label-sm text-text-strong-950">
														{apiKey.remaining !== null ? apiKey.remaining : "∞"}
													</span>
												</motion.div>
											</div>
											<div className="flex items-center border-stroke-soft-200 border-t py-2 pr-1 group-hover/row:bg-bg-weak-50">
												<motion.div
													{...getAnimationProps(index + 1, 4)}
													className="flex items-center gap-2 px-3"
												>
													<span className="text-label-sm text-text-strong-950">
														{apiKey.expiresAt
															? formatRelativeTime(apiKey.expiresAt)
															: "Never"}
													</span>
												</motion.div>
											</div>
											<div className="flex items-center border-stroke-soft-200 border-t py-2 pr-1 group-hover/row:bg-bg-weak-50">
												<motion.span
													{...getAnimationProps(index + 1, 5)}
													className="text-label-sm text-text-strong-950"
												>
													{formatRelativeTime(apiKey.createdAt)}
												</motion.span>
											</div>
											<div className="flex items-center border-stroke-soft-200 border-t py-2 group-hover/row:bg-bg-weak-50">
												<motion.div
													{...getAnimationProps(index + 1, 6)}
													className="flex items-center justify-center"
												>
													<PopoverRoot>
														<PopoverTrigger asChild>
															<Button.Root
																variant="neutral"
																mode="ghost"
																size="xxsmall"
																className="rounded p-1"
															>
																<Icon
																	name="more-vertical"
																	className="h-4 w-4 text-text-sub-600 hover:text-text-strong-950"
																/>
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
																	variant="error"
																	mode="ghost"
																	size="small"
																	onClick={() => handleDeleteApiKey(apiKey.id)}
																	className="w-full justify-start text-red-600 hover:bg-red-50"
																>
																	<Icon name="trash" className="h-4 w-4" />
																	Delete API Key
																</Button.Root>
															</div>
														</PopoverContent>
													</PopoverRoot>
												</motion.div>
											</div>
										</div>
									);
								})}
					</div>
				</div>
			</AnimatePresence>
			<DeleteApiKeyModal apiKeys={apiKeys} />
		</>
	);
};
