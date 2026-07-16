import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Popover from "@reloop/ui/popover";
import { Skeleton } from "@reloop/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { parseAsInteger, useQueryState } from "nuqs";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";
import { queryKeys } from "#/lib/query-keys";
import { formatRelativeTime } from "#/utils/format-relative-time";
import { DeleteApiKeyModal } from "./delete-api-key-modal";
import { EmptyState } from "./empty-state";
import { PageSizeDropdown } from "./page-size-dropdown";
import { PaginationControls } from "./pagination-controls";
import { RotateApiKeyModal } from "./rotate-api-key-modal";
import { useInvalidateApiKeys } from "./use-api-keys-query";
import type { ApiKeyData, ApiKeyListResponse } from "./types";

const GRID =
	"grid-cols-[minmax(0,1fr)_140px_110px_100px_32px]";

function ApiKeyActionsDropdown({
	apiKey,
	onToggleEnabled,
	onRotateKey,
	onDeleteKey,
	isToggling,
	onOpenChange,
}: {
	apiKey: ApiKeyData;
	onToggleEnabled: (apiKey: ApiKeyData) => void;
	onRotateKey: (apiKey: ApiKeyData) => void;
	onDeleteKey: (id: string) => void;
	isToggling: boolean;
	onOpenChange?: (open: boolean) => void;
}) {
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const [popoverOpen, setPopoverOpen] = useState(false);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	const menuItems = [
		{
			id: "toggle",
			label: apiKey.enabled ? "Disable" : "Enable",
			icon: (apiKey.enabled ? "pause" : "play") as "pause" | "play",
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
	const isDanger = menuItems[hoverIdx ?? -1]?.isDanger ?? false;

	const handleOpenChange = (open: boolean) => {
		setPopoverOpen(open);
		onOpenChange?.(open);
	};

	return (
		<div className="flex items-center justify-end">
			<Popover.Root open={popoverOpen} onOpenChange={handleOpenChange}>
				<Popover.Trigger asChild>
					<Button.Root variant="neutral" mode="ghost" size="xxsmall">
						<Icon name="more-horizontal" className="h-3 w-3" />
					</Button.Root>
				</Popover.Trigger>
				<Popover.Content
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
								onClick={() => {
									if (item.id === "toggle") onToggleEnabled(apiKey);
									if (item.id === "rotate") onRotateKey(apiKey);
									if (item.id === "delete") onDeleteKey(apiKey.id);
									handleOpenChange(false);
								}}
								disabled={item.id === "toggle" && isToggling}
								className={cn(
									"flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 font-medium text-xs",
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
				</Popover.Content>
			</Popover.Root>
		</div>
	);
}

export function ApiKeyTable({
	apiKeys,
	total,
	listParams,
	isLoading,
	loadingRows = 3,
}: {
	apiKeys: ApiKeyData[];
	total: number;
	listParams: {
		page: number;
		limit: number;
		status: string;
		creator: string;
		q: string;
	};
	isLoading?: boolean;
	loadingRows?: number;
}) {
	const queryClient = useQueryClient();
	const invalidate = useInvalidateApiKeys();
	const [, setDeleteId] = useQueryState("delete");
	const [, setRotateId] = useQueryState("rotate");
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

	const totalPages = Math.max(1, Math.ceil(total / (pageSize ?? 10)));
	const startIndex = total === 0 ? 0 : ((currentPage ?? 1) - 1) * (pageSize ?? 10) + 1;
	const endIndex = Math.min((currentPage ?? 1) * (pageSize ?? 10), total);

	const handleToggleEnabled = async (apiKey: ApiKeyData) => {
		const newEnabled = !apiKey.enabled;
		const key = queryKeys.apiKeys.list(listParams);

		queryClient.setQueryData<ApiKeyListResponse>(key, (current) => {
			if (!current?.apiKeys) return current;
			return {
				...current,
				apiKeys: current.apiKeys.map((k) =>
					k.id === apiKey.id ? { ...k, enabled: newEnabled } : k,
				),
			};
		});

		try {
			setTogglingId(apiKey.id);
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
			const message = axios.isAxiosError(error)
				? error.response?.data?.message || "Failed to toggle API key"
				: "Failed to toggle API key";
			toast.error(message);
		} finally {
			setTogglingId(null);
			await invalidate();
		}
	};

	return (
		<>
			<div className="w-full text-paragraph-sm">
				<div
					className={`grid ${GRID} items-center rounded-t-[14px] border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-4 pt-2.5 pb-5 font-medium text-text-sub-600 dark:border-[#101010] dark:bg-bg-weak-50/40`}
				>
					<div className="flex items-center gap-1">
						<span className="text-xs">Name</span>
					</div>
					<div className="flex items-center gap-1">
						<Icon name="key-new" className="h-3 w-3" />
						<span className="text-xs">Prefix</span>
					</div>
					<div className="flex items-center gap-1">
						<Icon name="history" className="h-3 w-3" />
						<span className="text-xs">Last Used</span>
					</div>
					<div className="flex items-center gap-1">
						<Icon name="activity" className="h-3 w-3" />
						<span className="text-xs">Status</span>
					</div>
					<div />
				</div>

				<div className="-mt-2.5 divide-y divide-stroke-soft-100 overflow-hidden rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:divide-stroke-soft-100/50 dark:border-stroke-soft-100/40">
					{isLoading && apiKeys.length === 0 ? (
						Array.from({ length: loadingRows }).map((_, index) => (
							<div
								// biome-ignore lint/suspicious/noArrayIndexKey: skeleton rows
								key={`skeleton-${index}`}
								className={`grid ${GRID} items-center px-4 py-2`}
							>
								<Skeleton className="h-4 w-24" />
								<Skeleton className="h-4 w-12" />
								<Skeleton className="h-4 w-20" />
								<Skeleton className="h-5 w-16 rounded-full" />
								<div className="flex justify-end">
									<Skeleton className="h-4 w-4 rounded" />
								</div>
							</div>
						))
					) : apiKeys.length === 0 ? (
						<EmptyState
							onCreateApiKey={() => void setModal("create-api-key")}
						/>
					) : (
						apiKeys.map((apiKey) => {
							const displayName =
								apiKey.name || apiKey.start || apiKey.prefix || "Unnamed";
							const isRowActive = activeDropdownId === apiKey.id;

							return (
								<div
									key={apiKey.id}
									className={cn(
										`group/row grid w-full ${GRID} items-center px-4 py-2 text-left transition-colors`,
										"hover:bg-bg-weak-50/50",
										isRowActive && "bg-bg-weak-50/50",
									)}
								>
									<div className="flex min-w-0 items-center gap-2">
										<div className="truncate font-medium text-label-sm text-text-strong-950">
											{displayName}
										</div>
									</div>
									<div className="flex items-center">
										<span className="rounded-md bg-bg-weak-50 px-1.5 py-0.5 font-semibold text-[11px] text-text-sub-600 dark:bg-bg-weak-50/20">
											{apiKey.start || "rl_..."}
										</span>
									</div>
									<div className="flex items-center">
										<span className="whitespace-nowrap font-medium text-sm text-text-sub-600">
											{apiKey.lastRequest
												? formatRelativeTime(apiKey.lastRequest)
												: "No Activity"}
										</span>
									</div>
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
									<div className="flex items-center justify-end">
										<ApiKeyActionsDropdown
											apiKey={apiKey}
											onToggleEnabled={handleToggleEnabled}
											onRotateKey={(key) => void setRotateId(key.id)}
											onDeleteKey={(id) => void setDeleteId(id)}
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

					{total > 0 && (
						<div className="flex items-center justify-between px-4 py-2 text-label-xs text-text-sub-600">
							<div className="flex items-center">
								<span>
									Showing {startIndex}–{endIndex} of {total} API key
									{total !== 1 ? "s" : ""}
								</span>
								<PageSizeDropdown
									value={pageSize ?? 10}
									onValueChange={(value) => {
										void setPageSize(value);
										void setCurrentPage(1);
									}}
								/>
							</div>
							<PaginationControls
								currentPage={currentPage ?? 1}
								totalPages={totalPages}
								onPageChange={(p) => void setCurrentPage(p)}
								isLoading={isLoading}
							/>
						</div>
					)}
				</div>
			</div>
			<DeleteApiKeyModal apiKeys={apiKeys} />
			<RotateApiKeyModal apiKeys={apiKeys} />
		</>
	);
}
