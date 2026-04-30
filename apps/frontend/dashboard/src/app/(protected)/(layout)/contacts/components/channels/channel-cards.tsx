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
	<div className="rounded-2xl border border-stroke-soft-100 bg-bg-white-0 p-5 dark:border-stroke-soft-100/10 dark:bg-[#101010]">
		<div className="flex items-start justify-between">
			<div className="flex flex-col gap-2">
				<Skeleton className="h-6 w-32 rounded-md" />
				<Skeleton className="h-4 w-48 rounded-md" />
			</div>
			<div className="flex gap-2">
				<Skeleton className="h-8 w-8 rounded-lg" />
				<Skeleton className="h-8 w-8 rounded-lg" />
			</div>
		</div>
		<div className="mt-8 flex items-center justify-between border-stroke-soft-100 border-t pt-4 dark:border-stroke-soft-100/10">
			<Skeleton className="h-4 w-24 rounded-md" />
			<Skeleton className="h-5 w-10 rounded-full" />
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
	const router = useRouter();

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
		<div className="grid grid-cols-1 gap-4">
			{channels.map((channel) => {
				const isPublic = channel.visibility === "public";
				const subscriberCount = channel.subscriberCount ?? 0;

				return (
					<div
						key={channel.id}
						onClick={() => router.push(`/contacts/channels/${channel.id}`)}
						className="group relative cursor-pointer rounded-2xl border border-stroke-soft-100 bg-bg-white-0 p-5 transition-all hover:border-stroke-soft-200 dark:border-stroke-soft-100/10 dark:bg-[#101010] dark:hover:border-stroke-soft-100/20"
					>
						<div className="flex items-start justify-between">
							<div className="flex flex-col">
								<div className="flex items-center gap-2">
									<h3 className="font-medium text-sm text-text-strong-950">
										{channel.name}
									</h3>
									<span
										className={cn(
											"inline-flex items-center rounded-md border px-2 py-0.5 font-medium text-[11px] transition-colors",
											isPublic
												? "border-success-base/20 bg-success-base/10 text-success-base"
												: "border-stroke-soft-200 bg-bg-weak-50 text-text-sub-600 dark:border-stroke-soft-100/20 dark:bg-neutral-alpha-10",
										)}
									>
										{isPublic ? "Public" : "Hidden"}
									</span>
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
									size="xsmall"
									className="h-8 w-8 rounded-lg border-stroke-soft-200 p-0 dark:border-white/10"
									onClick={() => onEdit?.(channel.id)}
								>
									<Button.Icon>
										<Icon name="edit" className="h-3.5 w-3.5" />
									</Button.Icon>
								</Button.Root>
								<ChannelDropdown
									channelId={channel.id}
									channelName={channel.name}
									visibility={channel.visibility}
									onViewDetails={() =>
										router.push(`/contacts/channels/${channel.id}`)
									}
									onEdit={onEdit}
									onDelete={(id) => onDelete?.(id)}
									onToggleVisibility={onToggleVisibility}
								/>
							</div>
						</div>

						<div className="mt-3 space-y-4">
							<div className="h-px w-full bg-stroke-soft-100 dark:bg-white/5" />
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-1 text-sm text-text-sub-600">
									<span className="font-semibold text-text-strong-950">
										{subscriberCount.toLocaleString()}
									</span>
									<span className="text-text-soft-400">subscribers</span>
								</div>

								<div
									className="flex items-center gap-3"
									onClick={(e) => e.stopPropagation()}
								>
									<span className="font-medium text-sm text-text-sub-600">
										{isPublic
											? "Shown to subscribers"
											: "Hidden from subscribers"}
									</span>
									<Switch.Root
										checked={isPublic}
										onCheckedChange={() =>
											onToggleVisibility?.(
												channel.id,
												channel.visibility || "private",
											)
										}
									/>
								</div>
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
};
