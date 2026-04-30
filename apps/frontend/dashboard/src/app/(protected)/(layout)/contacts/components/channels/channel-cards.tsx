"use client";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import * as Switch from "@reloop/ui/switch";
import { useRouter } from "next/navigation";
import { EmptyState } from "../shared/empty-state";
import { ChannelDropdown } from "./channel-dropdown";

interface Channel {
	id: string;
	name: string;
	description: string | null;
	organizationId: string;
	defaultSubscription?: "opt_in" | "opt_out";
	visibility?: "private" | "public";
	subscriberCount?: number;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
}

interface ChannelCardsProps {
	channels: Channel[];
	isLoading?: boolean;
	onToggleVisibility?: (
		channelId: string,
		currentValue: "private" | "public",
	) => void;
	onEdit?: (channelId: string) => void;
	onDelete?: (channelId: string) => void;
	onAddChannel?: () => void;
}

const CardSkeleton = () => (
	<div className="rounded-2xl border border-stroke-soft-100 bg-bg-white-0 px-5 pt-3 pb-2 dark:border-stroke-soft-100/10 dark:bg-[#101010]">
		<div className="flex items-start justify-between">
			<div className="flex flex-col">
				<Skeleton className="h-5 w-32 rounded-md" />
				<Skeleton className="mt-2 h-3 w-48 rounded-md" />
			</div>
			<div className="flex gap-2">
				<Skeleton className="h-6 w-6 rounded-lg" />
				<Skeleton className="h-6 w-6 rounded-lg" />
			</div>
		</div>
		<div className="mt-3 space-y-2">
			<div className="h-px w-full bg-stroke-soft-100 dark:bg-white/5" />
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-1">
					<Skeleton className="h-7 w-12 rounded-md" />
					<Skeleton className="h-4 w-16 rounded-md" />
				</div>
				<div className="flex items-center gap-2">
					<Skeleton className="h-5 w-16 rounded-full" />
					<Skeleton className="h-5 w-20 rounded-full" />
				</div>
			</div>
		</div>
	</div>
);

export const ChannelCards = ({
	channels,
	isLoading,
	onToggleVisibility,
	onEdit,
	onDelete,
	onAddChannel,
}: ChannelCardsProps) => {
	if (isLoading) {
		return (
			<div className="grid grid-cols-1 gap-4">
				{Array.from({ length: 3 }).map((_, i) => (
					<CardSkeleton key={i} />
				))}
			</div>
		);
	}

	if (channels.length === 0) {
		return <EmptyState onCreateClick={onAddChannel} />;
	}

	return (
		<div className="grid grid-cols-1 gap-2">
			{channels.map((channel) => {
				const isPublic = channel.visibility === "public";
				const subscriberCount = channel.subscriberCount ?? 0;

				return (
					<div
						key={channel.id}
						className="group relative rounded-2xl border border-stroke-soft-100 bg-bg-white-0 px-5 pt-3 pb-2 transition-all hover:border-stroke-soft-200 dark:border-stroke-soft-100/10 dark:bg-[#101010] dark:hover:border-stroke-soft-100/20"
					>
						<div className="flex items-start justify-between">
							<div className="flex flex-col">
								<div className="flex items-center gap-2">
									<h3 className="font-medium text-sm text-text-strong-950">
										{channel.name}
									</h3>
								</div>
								<p className="mt-1 line-clamp-2 text-text-sub-600 text-xs">
									{channel.description || "No description provided."}
								</p>
							</div>

							<div
								className="flex items-center gap-2"
								onClick={(e) => e.stopPropagation()}
							>
								<Button.Root
									variant="neutral"
									mode="stroke"
									size="xxsmall"
									onClick={() => onEdit?.(channel.id)}
								>
									<Button.Icon>
										<Icon name="edit" className="h-3 w-3" />
									</Button.Icon>
								</Button.Root>
								<ChannelDropdown
									channelId={channel.id}
									channelName={channel.name}
									visibility={channel.visibility}
									onDelete={(id) => onDelete?.(id)}
									onToggleVisibility={onToggleVisibility}
								/>
							</div>
						</div>

						<div className="mt-3 space-y-2">
							<div className="h-px w-full bg-stroke-soft-100 dark:bg-white/5" />
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-1 text-sm text-text-sub-600">
									<span className="font-semibold text-text-strong-950 text-xl">
										{subscriberCount.toLocaleString()}
									</span>
									<span className="font-medium text-text-soft-400 text-xs">
										subscribers
									</span>
								</div>

								<div className="flex items-center gap-2">
									<div
										className={cn(
											"flex items-center gap-1.5 rounded-full px-2.5 py-1 transition-colors",
											isPublic
												? "bg-primary-base/10 text-primary-base"
												: "bg-bg-weak-50 text-text-sub-600 dark:bg-white/5",
										)}
									>
										<Icon
											name={isPublic ? "globe" : "lock"}
											className="h-3 w-3"
										/>
										<span className="font-medium text-[10px] uppercase tracking-wider">
											{isPublic ? "Public" : "Hidden"}
										</span>
									</div>
									<div
										className={cn(
											"flex items-center gap-1.5 rounded-full px-2.5 py-1 transition-colors",
											channel.defaultSubscription === "opt_in"
												? "bg-primary-base/10 text-primary-base"
												: "bg-bg-weak-50 text-text-sub-600 dark:bg-white/5",
										)}
									>
										<Icon
											name={
												channel.defaultSubscription === "opt_in"
													? "check-circle"
													: "cross-circle"
											}
											className="h-3 w-3"
										/>
										<span className="font-medium text-[10px] uppercase tracking-wider">
											{channel.defaultSubscription === "opt_in"
												? "Subscribed"
												: "Unsubscribed"}
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
};
