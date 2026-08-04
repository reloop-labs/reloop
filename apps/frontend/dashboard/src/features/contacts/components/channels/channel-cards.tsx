import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import Spinner from "@reloop/ui/spinner";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
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
	) => void | Promise<void>;
	onToggleDefaultSubscription?: (
		channelId: string,
		currentValue: "opt_in" | "opt_out",
	) => void | Promise<void>;
	onEdit?: (channelId: string) => void;
	onDelete?: (channelId: string) => void;
	onAddChannel?: () => void;
}

const SPRING = {
	type: "spring" as const,
	duration: 0.28,
	bounce: 0,
};

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

type ToggleBadgeProps = {
	active: boolean;
	pending: boolean;
	activeLabel: string;
	inactiveLabel: string;
	activeIcon: "globe" | "check-circle";
	inactiveIcon: "lock" | "cross-circle";
	pendingLabel: string;
	ariaLabel: string;
	title: string;
	disabled?: boolean;
	onClick: () => void;
};

function ChannelToggleBadge({
	active,
	pending,
	activeLabel,
	inactiveLabel,
	activeIcon,
	inactiveIcon,
	pendingLabel,
	ariaLabel,
	title,
	disabled,
	onClick,
}: ToggleBadgeProps) {
	const stateKey = pending ? "pending" : active ? "active" : "inactive";

	return (
		<motion.button
			type="button"
			layout
			disabled={disabled || pending}
			onClick={onClick}
			aria-label={ariaLabel}
			title={title}
			whileTap={disabled || pending ? undefined : { scale: 0.96 }}
			transition={SPRING}
			className={cn(
				"relative flex items-center overflow-hidden rounded-full px-2.5 py-1",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-base/40",
				"disabled:cursor-not-allowed",
				active
					? "bg-primary-base/10 text-primary-base hover:bg-primary-base/15"
					: "bg-bg-weak-50 text-text-sub-600 hover:bg-bg-weak-50/80 dark:bg-white/5 dark:hover:bg-white/10",
			)}
		>
			<AnimatePresence mode="popLayout" initial={false}>
				<motion.span
					key={stateKey}
					layout
					initial={{ opacity: 0, y: -10, filter: "blur(2px)" }}
					animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
					exit={{ opacity: 0, y: 10, filter: "blur(2px)" }}
					transition={SPRING}
					className="flex items-center gap-1.5"
				>
					{pending ? (
						<>
							<Spinner size={12} color="currentColor" />
							<span className="font-medium text-[10px] uppercase tracking-wider">
								{pendingLabel}
							</span>
						</>
					) : (
						<>
							<Icon
								name={active ? activeIcon : inactiveIcon}
								className="h-3 w-3 shrink-0"
							/>
							<span className="font-medium text-[10px] uppercase tracking-wider">
								{active ? activeLabel : inactiveLabel}
							</span>
						</>
					)}
				</motion.span>
			</AnimatePresence>
		</motion.button>
	);
}

export const ChannelCards = ({
	channels,
	isLoading,
	onToggleVisibility,
	onToggleDefaultSubscription,
	onEdit,
	onDelete,
	onAddChannel,
}: ChannelCardsProps) => {
	const [pendingVisibilityId, setPendingVisibilityId] = useState<string | null>(
		null,
	);
	const [pendingSubscriptionId, setPendingSubscriptionId] = useState<
		string | null
	>(null);

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
		return (
			<EmptyState
				onCreateClick={onAddChannel}
				className="h-full justify-center"
			/>
		);
	}

	const handleVisibilityClick = async (
		channelId: string,
		currentValue: "private" | "public",
	) => {
		if (!onToggleVisibility || pendingVisibilityId) return;
		setPendingVisibilityId(channelId);
		try {
			await onToggleVisibility(channelId, currentValue);
		} finally {
			setPendingVisibilityId(null);
		}
	};

	const handleSubscriptionClick = async (
		channelId: string,
		currentValue: "opt_in" | "opt_out",
	) => {
		if (!onToggleDefaultSubscription || pendingSubscriptionId) return;
		setPendingSubscriptionId(channelId);
		try {
			await onToggleDefaultSubscription(channelId, currentValue);
		} finally {
			setPendingSubscriptionId(null);
		}
	};

	return (
		<div className="grid grid-cols-1 gap-2">
			{channels.map((channel) => {
				const isPublic = channel.visibility === "public";
				const isOptIn = channel.defaultSubscription === "opt_in";
				const subscriberCount = channel.subscriberCount ?? 0;
				const isVisibilityPending = pendingVisibilityId === channel.id;
				const isSubscriptionPending = pendingSubscriptionId === channel.id;

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

								<div
									className="flex items-center gap-2"
									onClick={(e) => e.stopPropagation()}
								>
									<ChannelToggleBadge
										active={isPublic}
										pending={isVisibilityPending}
										activeLabel="Public"
										inactiveLabel="Hidden"
										activeIcon="globe"
										inactiveIcon="lock"
										pendingLabel="Updating..."
										ariaLabel={
											isPublic ? "Make channel hidden" : "Make channel public"
										}
										title={
											isPublic
												? "Click to hide channel"
												: "Click to make public"
										}
										disabled={!onToggleVisibility}
										onClick={() =>
											void handleVisibilityClick(
												channel.id,
												isPublic ? "public" : "private",
											)
										}
									/>
									<ChannelToggleBadge
										active={isOptIn}
										pending={isSubscriptionPending}
										activeLabel="Subscribed"
										inactiveLabel="Unsubscribed"
										activeIcon="check-circle"
										inactiveIcon="cross-circle"
										pendingLabel="Updating..."
										ariaLabel={
											isOptIn
												? "Set default to unsubscribed"
												: "Set default to subscribed"
										}
										title={
											isOptIn
												? "Click to set default unsubscribed"
												: "Click to set default subscribed"
										}
										disabled={!onToggleDefaultSubscription}
										onClick={() =>
											void handleSubscriptionClick(
												channel.id,
												isOptIn ? "opt_in" : "opt_out",
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
