"use client";
import { SubscriberBrowserPreview } from "@fe/dashboard/app/(protected)/(layout)/contacts/components/channels/subscriber-browser-preview";
import { AnimatedBackButton } from "@fe/dashboard/components/animated-back-button";
import { AnimatedHoverBackground } from "@fe/dashboard/components/animated-hover-background";
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
import { useParams } from "next/navigation";
import { useQueryState } from "nuqs";
import { useRef, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

interface ChannelData {
	id: string;
	name: string;
	description: string | null;
	defaultSubscription: "opt_in" | "opt_out";
	visibility: "private" | "public";
	createdAt: string;
	updatedAt: string;
}

interface Subscription {
	id: string;
	contactId: string;
	channelId: string;
	organizationId: string;
	status: "subscribed" | "unsubscribed";
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
}

interface SubscriptionListResponse {
	subscriptions: Subscription[];
	total: number;
	page: number;
	limit: number;
}

const getVisibilityColor = (visibility?: "private" | "public") => {
	return visibility === "public" ? "text-primary-base" : "text-text-sub-600";
};

const getVisibilityBadgeStyles = (visibility?: "private" | "public") => {
	return visibility === "public"
		? "border border-primary-base text-primary-base bg-primary-light/20"
		: "border border-stroke-soft-200 text-text-sub-600 bg-neutral-alpha-10";
};

const getDefaultSubscriptionBadgeStyles = (
	defaultSubscription?: "opt_in" | "opt_out",
) => {
	return defaultSubscription === "opt_in"
		? "border border-success-base text-success-base bg-success-light/20"
		: "border border-stroke-soft-200 text-text-sub-600 bg-neutral-alpha-10";
};

const formatSubscriptionLabel = (
	defaultSubscription?: "opt_in" | "opt_out",
) => {
	return defaultSubscription === "opt_in" ? "Opt In" : "Opt Out";
};

const channelMenuItems = [
	{
		id: "edit",
		label: "Edit channel",
		icon: "edit" as const,
		isDanger: false,
	},
	{
		id: "delete",
		label: "Delete channel",
		icon: "trash" as const,
		isDanger: true,
	},
];

export const ChannelDetailContent = () => {
	const { channelId } = useParams();
	const [, setModal] = useQueryState("modal", { history: "replace" });
	const [, setId] = useQueryState("id", { history: "replace" });
	const [copied, setCopied] = useState(false);
	const [copiedPrefUrl, setCopiedPrefUrl] = useState(false);
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	const {
		data: channelData,
		error: channelError,
		isLoading: channelLoading,
	} = useSWR<ChannelData>(
		channelId ? `/api/contacts/v1/channels/${channelId}` : null,
		{
			revalidateOnFocus: false,
			revalidateOnReconnect: true,
		},
	);

	// Fetch a sample preference URL for this channel (only when channel is public)
	const { data: prefTokenData } = useSWR<{ url: string; token: string }>(
		channelData?.visibility === "public" && channelId
			? "/api/contacts/v1/preferences/generate?contactId=demo"
			: null,
		{
			revalidateOnFocus: false,
			onError: () => {},
		},
	);

	// Fetch sibling public channels for realistic preview context
	const { data: allChannelsData } = useSWR<{ channels: ChannelData[] }>(
		"/api/contacts/v1/channels/list?limit=10",
		{ revalidateOnFocus: false },
	);
	const siblingChannels = allChannelsData?.channels ?? [];

	const { data: subscriptionData, isLoading: subscriptionLoading } =
		useSWR<SubscriptionListResponse>(
			`/api/contacts/v1/subscriptions/list?channelId=${channelId}&limit=100`,
			{
				revalidateOnFocus: true,
				revalidateOnReconnect: true,
			},
		);

	const currentTab = buttonRefs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();
	const hoveredItem = channelMenuItems[hoverIdx ?? -1];
	const isDanger = hoveredItem?.isDanger ?? false;

	const handleCopyId = async () => {
		if (!channelData?.id) return;

		try {
			await navigator.clipboard.writeText(channelData.id);
			toast.success("Channel ID copied to clipboard");
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			toast.error("Failed to copy ID");
		}
	};

	const handleMenuItemClick = (itemId: string) => {
		if (!channelData?.id) return;

		setId(channelData.id);
		setModal(itemId === "edit" ? "edit-channel" : "delete-channel");
	};

	const handleCopyPrefUrl = async () => {
		const url = prefTokenData?.url;
		if (!url) return;
		try {
			await navigator.clipboard.writeText(url);
			toast.success("Preference URL copied to clipboard");
			setCopiedPrefUrl(true);
			setTimeout(() => setCopiedPrefUrl(false), 2000);
		} catch {
			toast.error("Failed to copy URL");
		}
	};

	const isLoading = channelLoading || subscriptionLoading;

	if (channelError) {
		return (
			<div className="pt-10 pb-8">
				<AnimatedBackButton onClick={() => window.history.back()} />
				<div className="pt-6">
					<div className="flex items-center gap-1.5">
						<p className="font-medium text-paragraph-xs text-text-sub-600">
							Channel
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
					<h1 className="pt-2 font-medium text-title-h6 leading-8">
						Channel not found
					</h1>
				</div>
			</div>
		);
	}

	return (
		<div className="pt-10 pb-8">
			<AnimatedBackButton onClick={() => window.history.back()} />

			<div className="flex items-center justify-between pt-6">
				<div>
					{isLoading ? (
						<div className="flex items-center gap-1.5">
							<Skeleton className="h-4 w-10 rounded-full" />
							<Skeleton className="h-1 w-1 rounded-full" />
							<Skeleton className="h-4 w-20 rounded-full" />
							<Skeleton className="h-1 w-1 rounded-full" />
							<Skeleton className="h-4 w-12 rounded-full" />
						</div>
					) : (
						<div className="flex items-center gap-1.5">
							<p className="font-medium text-paragraph-xs text-text-sub-600">
								Channel
							</p>
							<p className="font-semibold text-paragraph-xs text-text-sub-600">
								•
							</p>
							<p className="font-medium text-paragraph-xs text-text-sub-600">
								{channelData?.createdAt
									? formatRelativeTime(channelData.createdAt)
									: "---"}
							</p>
							<p className="font-semibold text-paragraph-xs text-text-sub-600">
								•
							</p>
							<div
								className={cn(
									"flex items-center gap-1",
									getVisibilityColor(channelData?.visibility),
								)}
							>
								<Icon
									name={channelData?.visibility === "public" ? "globe" : "lock"}
									className="h-3.5 w-3.5"
								/>
								<p className="font-medium text-paragraph-xs capitalize">
									{channelData?.visibility || "private"}
								</p>
							</div>
						</div>
					)}

					{isLoading ? (
						<Skeleton className="mt-2 h-7 w-56 rounded-lg" />
					) : (
						<div className="flex items-center gap-2">
							<div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-neutral-600 to-neutral-500 text-white shadow-sm">
								<Icon name="notification-indicator" className="h-3 w-3" />
							</div>
							<h1 className="font-medium text-title-h6 leading-8">
								{channelData?.name}
							</h1>
						</div>
					)}
				</div>

				<div className="flex items-center gap-2">
					{isLoading ? (
						<>
							<Skeleton className="h-9 w-36 rounded-lg" />
							<Skeleton className="h-9 w-9 rounded-lg" />
						</>
					) : channelData ? (
						<>
							<Button.Root
								variant="neutral"
								size="xsmall"
								onClick={() => setModal("add-contact-to-channel")}
								className="gap-2"
							>
								<Icon name="plus" className="h-4 w-4" />
								Add Contact
								<span className="inline-flex items-center gap-0.5">
									<Icon
										name="command"
										className="h-4 w-4 rounded-sm border border-stroke-soft-100/20 p-px"
									/>
									<span className="flex h-4 w-4 items-center justify-center rounded-sm border border-stroke-soft-100/20 p-px font-medium text-[10px] uppercase">
										a
									</span>
								</span>
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
									sideOffset={0}
									className="w-44 rounded-xl p-1.5"
									showArrow
								>
									<div className="relative">
										{channelMenuItems.map((item, idx) => (
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
													"flex w-full cursor-pointer items-center gap-2 rounded-lg py-1.5 pl-2 font-medium text-xs transition-colors",
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
														"h-4 w-4",
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

			<div className="mt-10 grid grid-cols-3 gap-x-12 gap-y-6">
				<div className="flex flex-col gap-1.5">
					<div className="flex items-center gap-1.5">
						<Icon name="file-text" className="h-3.5 w-3.5 text-text-sub-600" />
						<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
							Description
						</span>
					</div>
					{isLoading ? (
						<Skeleton className="h-5 w-40 rounded-lg" />
					) : (
						<span className="font-medium text-paragraph-sm text-text-strong-950">
							{channelData?.description || "No description"}
						</span>
					)}
				</div>

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
							{channelData?.createdAt
								? formatRelativeTime(channelData.createdAt)
								: "---"}
						</span>
					)}
				</div>

				<div className="flex flex-col gap-1.5">
					<div className="flex items-center gap-1.5">
						<Icon
							name="eye-outline"
							className="h-3.5 w-3.5 text-text-sub-600"
						/>
						<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
							Visibility
						</span>
					</div>
					{isLoading ? (
						<Skeleton className="h-5 w-20 rounded-lg" />
					) : (
						<span
							className={cn(
								"inline-flex w-fit rounded-md border-[1px] px-[6px] py-0.5 font-medium text-[10px] capitalize",
								getVisibilityBadgeStyles(channelData?.visibility),
							)}
						>
							{channelData?.visibility || "private"}
						</span>
					)}
				</div>

				<div className="flex flex-col gap-1.5">
					<div className="flex items-center gap-1.5">
						<Icon name="hash" className="h-3.5 w-3.5 text-text-sub-600" />
						<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
							ID
						</span>
					</div>
					{isLoading ? (
						<Skeleton className="h-6 w-28 rounded-lg" />
					) : (
						<button
							className="group/copy flex w-fit cursor-pointer items-center gap-1.5"
							type="button"
							onClick={handleCopyId}
						>
							<code className="max-w-[120px] truncate rounded bg-neutral-alpha-10 px-2 py-1 font-medium font-mono text-text-strong-950 text-xs">
								{channelData?.id?.slice(0, 18)}...
							</code>
							<Icon
								name={copied ? "check" : "copy"}
								className={cn(
									"h-3 w-3 flex-shrink-0 transition-all",
									copied ? "text-success-base" : "text-text-sub-600",
								)}
							/>
						</button>
					)}
				</div>

				<div className="flex flex-col gap-1.5">
					<div className="flex items-center gap-1.5">
						<Icon name="users" className="h-3.5 w-3.5 text-text-sub-600" />
						<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
							Default Subscription
						</span>
					</div>
					{isLoading ? (
						<Skeleton className="h-5 w-20 rounded-lg" />
					) : (
						<span
							className={cn(
								"inline-flex w-fit rounded-md border-[1px] px-[6px] py-0.5 font-medium text-[10px]",
								getDefaultSubscriptionBadgeStyles(
									channelData?.defaultSubscription,
								),
							)}
						>
							{formatSubscriptionLabel(channelData?.defaultSubscription)}
						</span>
					)}
				</div>

				<div className="flex flex-col gap-1.5">
					<div className="flex items-center gap-1.5">
						<Icon name="user" className="h-3.5 w-3.5 text-text-sub-600" />
						<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
							Contacts
						</span>
					</div>
					{isLoading ? (
						<Skeleton className="h-5 w-10 rounded-lg" />
					) : (
						<span className="font-medium text-paragraph-sm text-text-strong-950">
							{subscriptionData?.total || 0}
						</span>
					)}
				</div>

				{/* Preference page link — only shown for public channels */}
				{channelData?.visibility === "public" && (
					<div className="col-span-3 flex flex-col gap-1.5">
						<div className="flex items-center gap-1.5">
							<Icon name="globe" className="h-3.5 w-3.5 text-primary-base" />
							<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
								Preference Page
							</span>
							<span className="inline-flex items-center rounded-md border border-primary-base bg-primary-light/20 px-1.5 py-0.5 font-medium text-[9px] text-primary-base uppercase tracking-wider">
								Public
							</span>
						</div>
						{isLoading ? (
							<Skeleton className="h-6 w-80 rounded-lg" />
						) : (
							<div className="flex items-center gap-2">
								<code className="max-w-[400px] truncate rounded bg-neutral-alpha-10 px-2 py-1 font-medium font-mono text-text-sub-600 text-xs">
									{prefTokenData?.url ??
										"https://reloop.sh/preferences/{token}"}
								</code>
								<button
									type="button"
									onClick={handleCopyPrefUrl}
									disabled={!prefTokenData?.url}
									className="flex-shrink-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
								>
									<Icon
										name={copiedPrefUrl ? "check" : "copy"}
										className={cn(
											"h-3 w-3 flex-shrink-0 transition-all",
											copiedPrefUrl ? "text-success-base" : "text-text-sub-600",
										)}
									/>
								</button>
							</div>
						)}
						<p className="text-[10px] text-text-sub-600">
							Embed a unique URL per contact in your email templates using the{" "}
							<code className="rounded bg-neutral-alpha-10 px-1 font-mono text-[10px]">
								GET /api/contacts/v1/preferences/generate
							</code>{" "}
							endpoint.
						</p>
					</div>
				)}
			</div>

			{/* Subscriber preview — visual representation of the end-user preferences page */}
			{channelData && (
				<SubscriberBrowserPreview
					channel={channelData}
					siblingChannels={siblingChannels as ChannelData[]}
					orgName="Your Organization"
				/>
			)}
		</div>
	);
};
