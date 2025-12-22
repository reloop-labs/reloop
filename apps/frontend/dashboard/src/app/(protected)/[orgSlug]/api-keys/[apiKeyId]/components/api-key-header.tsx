"use client";
import { AnimatedBackButton } from "@fe/dashboard/components/animated-back-button";
import { AnimatedHoverBackground } from "@fe/dashboard/components/layout/sidebar/animated-hover-background";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
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
import axios from "axios";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { EditApiKeyModal } from "../../components/edit-api-key-modal";
import { RotateApiKeyModal } from "../../components/rotate-api-key-modal";

interface ApiKeyData {
	id: string;
	name: string | null;
	start: string | null;
	prefix: string | null;
	organizationId: string;
	userId: string;
	refillInterval: number | null;
	refillAmount: number | null;
	lastRefillAt: string | null;
	enabled: boolean;
	rateLimitEnabled: boolean;
	rateLimitTimeWindow: number;
	rateLimitMax: number;
	requestCount: number;
	remaining: number | null;
	lastRequest: string | null;
	expiresAt: string | null;
	createdAt: string;
	updatedAt: string;
	permissions: string | null;
	metadata: string | null;
	createdBy?: {
		id: string;
		name: string | null;
		image: string | null;
		email: string | null;
	};
}

interface ApiKeyHeaderProps {
	apiKey: ApiKeyData | undefined;
	isLoading: boolean;
	isFailed?: boolean;
	onDeleteApiKey?: () => void;
}

const getStatusColor = (enabled: boolean) => {
	return enabled ? "text-success-base" : "text-text-sub-600";
};

const getStatusIcon = (enabled: boolean) => {
	return enabled ? "check-circle" : "cross-circle";
};

const headerMenuItems = [
	{
		id: "docs",
		label: "Go to docs",
		icon: "file-text" as const,
		isDanger: false,
	},
	{
		id: "rotate",
		label: "Rotate key",
		icon: "rotate-cw" as const,
		isDanger: false,
	},
	{ id: "edit", label: "Edit API key", icon: "edit" as const, isDanger: false },
	{
		id: "delete",
		label: "Delete API key",
		icon: "trash" as const,
		isDanger: true,
	},
];

export const ApiKeyHeader = ({
	apiKey,
	isLoading,
	isFailed,
	onDeleteApiKey,
}: ApiKeyHeaderProps) => {
	const { push } = useUserOrganization();
	const { mutate } = useSWRConfig();
	const [copied, setCopied] = useState(false);
	const [isToggling, setIsToggling] = useState(false);
	const [isRotateModalOpen, setIsRotateModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	const currentTab = buttonRefs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();
	const hoveredItem = headerMenuItems[hoverIdx ?? -1];
	const isDanger = hoveredItem?.isDanger ?? false;

	const handleCopyPrefix = async () => {
		const textToCopy = apiKey?.start || apiKey?.prefix || "";
		if (textToCopy) {
			try {
				await navigator.clipboard.writeText(textToCopy);
				toast.success("API key prefix copied to clipboard");
				setCopied(true);
				setTimeout(() => setCopied(false), 2000);
			} catch {
				toast.error("Failed to copy prefix");
			}
		}
	};

	const handleToggleEnabled = async () => {
		if (!apiKey) return;

		try {
			setIsToggling(true);
			const endpoint = apiKey.enabled
				? `/api/api-key/v1/${apiKey.id}/disable`
				: `/api/api-key/v1/${apiKey.id}/enable`;

			await axios.post(endpoint, {}, { headers: { credentials: "include" } });

			await mutate(`/api/api-key/v1/${apiKey.id}`);
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
			setIsToggling(false);
		}
	};

	const handleMenuItemClick = (itemId: string) => {
		if (itemId === "docs") {
			window.open("https://reloop.sh/docs/api-keys", "_blank");
		} else if (itemId === "rotate") {
			setIsRotateModalOpen(true);
		} else if (itemId === "edit") {
			setIsEditModalOpen(true);
		} else if (itemId === "delete") {
			onDeleteApiKey?.();
		}
	};

	if (!apiKey && !isLoading) {
		return (
			<div className="pt-10 pb-8">
				<AnimatedBackButton onClick={() => push("/api-keys")} />
				<div className="flex items-center justify-between pt-6">
					<div>
						<div className="flex items-center gap-1.5">
							<p className="font-medium text-paragraph-xs text-text-sub-600">
								API Key{" "}
							</p>
							<p className="font-semibold text-paragraph-xs text-text-sub-600">
								•
							</p>
							<p className="font-medium text-paragraph-xs text-text-sub-600">
								---
							</p>
							<p className="font-semibold text-paragraph-xs text-text-sub-600">
								•
							</p>
							<div className="flex items-center gap-1 text-error-base">
								<Icon name="alert-circle" className="h-3.5 w-3.5" />
								<p className="font-medium text-paragraph-xs">Not found</p>
							</div>
						</div>
						<h1 className="font-medium text-title-h6 leading-8">
							API key not found
						</h1>
					</div>
				</div>
			</div>
		);
	}

	const displayName =
		apiKey?.name || apiKey?.start || apiKey?.prefix || "Unnamed";
	const displayPrefix = apiKey?.start || apiKey?.prefix || "---";

	return (
		<>
			<div className="pt-10 pb-8">
				<AnimatedBackButton onClick={() => push("/api-keys")} />
				<div className="flex items-center justify-between pt-6">
					<div>
						{isLoading ? (
							<div className="flex items-center gap-1.5">
								<Skeleton className="h-4 w-12 rounded-full" />
								<Skeleton className="h-1 w-1 rounded-full" />
								<Skeleton className="h-4 w-20 rounded-full" />
								<Skeleton className="h-1 w-1 rounded-full" />
								<div className="flex items-center gap-1">
									<Skeleton className="h-3.5 w-3.5 rounded-full" />
									<Skeleton className="h-4 w-16 rounded-full" />
								</div>
							</div>
						) : (
							<div className="flex items-center gap-1.5">
								<p className="font-medium text-paragraph-xs text-text-sub-600">
									API Key{" "}
								</p>
								<p className="font-semibold text-paragraph-xs text-text-sub-600">
									•
								</p>
								<p className="font-medium text-paragraph-xs text-text-sub-600">
									{isFailed
										? "---"
										: apiKey?.createdAt
											? formatRelativeTime(apiKey.createdAt)
											: "---"}
								</p>
								<p className="font-semibold text-paragraph-xs text-text-sub-600">
									•
								</p>
								<div
									className={`flex items-center gap-1 ${getStatusColor(apiKey?.enabled || false)}`}
								>
									<Icon
										name={getStatusIcon(apiKey?.enabled || false)}
										className="h-3.5 w-3.5"
									/>
									<p className="font-medium text-paragraph-xs">
										{apiKey?.enabled ? "Enabled" : "Disabled"}
									</p>
								</div>
							</div>
						)}
						{isLoading ? (
							<Skeleton className="mt-2 h-7 w-48 rounded-lg" />
						) : (
							<h1 className="font-medium text-title-h6 leading-8">
								{displayName}
							</h1>
						)}
					</div>

					<div className="flex items-center gap-2">
						{isLoading ? (
							<>
								<Skeleton className="h-9 w-32 rounded-lg" />
								<Skeleton className="h-9 w-9 rounded-lg" />
							</>
						) : isFailed ? (
							<Button.Root variant="error" size="small" mode="lighter">
								Try Again
							</Button.Root>
						) : apiKey ? (
							<>
								<Button.Root
									variant="neutral"
									size="xsmall"
									className="font-semibold"
									onClick={handleToggleEnabled}
									disabled={isToggling}
								>
									{isToggling ? (
										<Icon name="loader-2" className="h-4 w-4 animate-spin" />
									) : (
										<Icon
											name={apiKey.enabled ? "pause" : "play"}
											className="h-4 w-4"
										/>
									)}
									{apiKey.enabled ? "Disable" : "Enable"} API key
								</Button.Root>
								<PopoverRoot>
									<PopoverTrigger asChild>
										<Button.Root variant="neutral" mode="stroke" size="xsmall">
											<Icon
												name="more-vertical"
												className="h-3.5 w-3.5 text-text-sub-600"
											/>
										</Button.Root>
									</PopoverTrigger>
									<PopoverContent
										align="end"
										sideOffset={8}
										className="w-44 rounded-xl p-1.5"
										showArrow
									>
										<div className="relative">
											{headerMenuItems.map((item, idx) => (
												<button
													key={item.id}
													ref={(el) => {
														if (el) buttonRefs.current[idx] = el;
													}}
													type="button"
													onPointerEnter={() => setHoverIdx(idx)}
													onPointerLeave={() => setHoverIdx(undefined)}
													onClick={() => handleMenuItemClick(item.id)}
													className={cn(
														"flex w-full cursor-pointer items-center gap-2 rounded-lg py-1.5 pl-2 font-normal text-xs transition-colors",
														item.isDanger
															? "text-error-base"
															: "text-text-strong-950",
														!currentRect &&
															hoverIdx === idx &&
															(item.isDanger
																? "bg-red-alpha-10"
																: "bg-neutral-alpha-10"),
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
							</>
						) : null}
					</div>
				</div>
				<div className="mt-10 grid grid-cols-[1fr_1fr_1fr] gap-y-12">
					{/* Token/Key */}
					<div className="flex flex-col gap-1.5">
						<div className="flex items-center gap-1.5">
							<Icon name="key-new" className="h-3.5 w-3.5 text-text-sub-600" />
							<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
								Key Prefix
							</span>
						</div>
						{isLoading ? (
							<Skeleton className="h-5 w-24 rounded-lg" />
						) : (
							<button
								type="button"
								key={apiKey?.id}
								className="group/copy flex w-fit cursor-pointer items-center gap-1.5"
								onClick={handleCopyPrefix}
							>
								<code className="rounded bg-neutral-alpha-10 px-2 py-1 font-medium font-mono text-text-strong-950 text-xs">
									{displayPrefix}...
								</code>
								<Icon
									name={copied ? "check" : "copy"}
									className={cn(
										"h-3 w-3 transition-all",
										copied
											? "text-success-base"
											: "text-text-sub-600 opacity-0 group-hover/copy:opacity-100",
									)}
								/>
							</button>
						)}
					</div>

					{/* Total Requests */}
					<div className="flex flex-col gap-1.5">
						<div className="flex items-center gap-1.5">
							<Icon
								name="activity-2"
								className="h-3.5 w-3.5 text-text-sub-600"
							/>
							<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
								Requests
							</span>
						</div>
						{isLoading ? (
							<Skeleton className="h-5 w-24 rounded-lg" />
						) : (
							<span className="font-medium text-paragraph-sm text-text-strong-950">
								{(apiKey?.requestCount || 0).toLocaleString()} times
							</span>
						)}
					</div>

					{/* Last Used */}
					<div className="flex flex-col gap-1.5">
						<div className="flex items-center gap-1.5">
							<Icon name="clock" className="h-3.5 w-3.5 text-text-sub-600" />
							<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
								Last Used
							</span>
						</div>
						{isLoading ? (
							<Skeleton className="h-5 w-24 rounded-lg" />
						) : (
							<span className="font-medium text-paragraph-sm text-text-strong-950">
								{apiKey?.lastRequest
									? formatRelativeTime(apiKey.lastRequest)
									: "No activity"}
							</span>
						)}
					</div>

					{/* Created */}
					<div className="flex flex-col gap-1.5">
						<div className="flex items-center gap-1.5">
							<Icon name="calendar" className="h-3.5 w-3.5 text-text-sub-600" />
							<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
								Created
							</span>
						</div>
						{isLoading ? (
							<Skeleton className="h-5 w-24 rounded-lg" />
						) : (
							<span className="font-medium text-paragraph-sm text-text-strong-950">
								{apiKey?.createdAt
									? formatRelativeTime(apiKey.createdAt)
									: "---"}
							</span>
						)}
					</div>

					{/* Created By */}
					<div className="flex flex-col gap-1.5">
						<div className="flex items-center gap-1.5">
							<Icon name="user" className="h-3.5 w-3.5 text-text-sub-600" />
							<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
								Created By
							</span>
						</div>
						{isLoading ? (
							<Skeleton className="h-5 w-24 rounded-lg" />
						) : (
							<div className="flex items-center gap-2">
								<Avatar.Root size="20">
									{apiKey?.createdBy?.image ? (
										<Avatar.Image
											src={apiKey.createdBy.image}
											alt={apiKey.createdBy.name || "User"}
										/>
									) : null}
								</Avatar.Root>
								<span className="font-medium text-paragraph-sm text-text-strong-950">
									{apiKey?.createdBy?.email ||
										apiKey?.createdBy?.name ||
										"Unknown"}
								</span>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Modals */}
			{apiKey && (
				<>
					<RotateApiKeyModal
						isOpen={isRotateModalOpen}
						onClose={() => setIsRotateModalOpen(false)}
						apiKeyId={apiKey.id}
						apiKeyName={displayName}
					/>
					<EditApiKeyModal
						isOpen={isEditModalOpen}
						onClose={() => setIsEditModalOpen(false)}
						apiKey={apiKey}
					/>
				</>
			)}
		</>
	);
};
