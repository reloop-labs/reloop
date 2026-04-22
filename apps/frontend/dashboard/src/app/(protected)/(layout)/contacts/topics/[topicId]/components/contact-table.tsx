"use client";
import { formatRelativeTime } from "@fe/dashboard/utils/time";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import { ContactsEmptyState } from "../../../components/contacts-empty-state";

interface Subscription {
	id: string;
	contactId: string;
	topicId: string;
	organizationId: string;
	status: "subscribed" | "unsubscribed";
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
}

interface ContactTableProps {
	subscriptions: Subscription[];
	isLoading: boolean;
	loadingRows: number;
	onUnsubscribe: (contactId: string) => void;
	onAddContact?: () => void;
	emptyStateTitle?: string;
	emptyStateDescription?: string;
	emptyStateButtonText?: string;
}

const getStatusBadgeStyles = (status: string) => {
	switch (status.toLowerCase()) {
		case "subscribed":
			return "border border-success-base text-success-base bg-success-light/20";
		case "unsubscribed":
			return "border border-error-base text-error-base bg-error-light/20";
		default:
			return "border border-stroke-soft-200 text-text-sub-600 bg-neutral-alpha-10";
	}
};

const formatStatusLabel = (status: string) => {
	switch (status.toLowerCase()) {
		case "subscribed":
			return "Subscribed";
		case "unsubscribed":
			return "Unsubscribed";
		default:
			return status;
	}
};

const ContactSkeleton = () => (
	<div className="grid grid-cols-[1fr_150px_100px_80px] items-center px-4 py-2">
		<div className="flex items-center gap-3">
			<Skeleton className="h-4 w-4" />
			<Skeleton className="h-4 w-40" />
		</div>
		<Skeleton className="h-5 w-20 rounded-md" />
		<Skeleton className="h-4 w-20" />
		<div className="flex items-center justify-end">
			<Skeleton className="h-4 w-4 rounded" />
		</div>
	</div>
);

export const ContactTable = ({
	subscriptions,
	isLoading,
	loadingRows,
	onUnsubscribe,
	onAddContact,
	emptyStateTitle,
	emptyStateDescription,
	emptyStateButtonText,
}: ContactTableProps) => {
	if (isLoading) {
		return (
			<div className="w-full overflow-hidden rounded-xl border border-stroke-soft-100 text-paragraph-sm dark:border-stroke-soft-100/50">
				<div className="grid grid-cols-[1fr_150px_100px_80px] items-center border-stroke-soft-100 border-b px-4 py-3.5 text-text-sub-600 dark:border-stroke-soft-100/50">
					<div className="flex items-center gap-2">
						<Icon name="mail-single" className="h-4 w-4" />
						<span className="text-xs">Contact</span>
					</div>
					<div className="flex items-center gap-2">
						<Icon name="check-circle" className="h-4 w-4" />
						<span className="text-xs">Status</span>
					</div>
					<div className="flex items-center gap-2">
						<Icon name="clock" className="h-4 w-4" />
						<span className="text-xs">Added</span>
					</div>
					<div />
				</div>

				<div className="divide-y divide-stroke-soft-100 dark:divide-stroke-soft-100/50">
					{Array.from({ length: loadingRows }).map((_, index) => (
						<ContactSkeleton key={`skeleton-${index}`} />
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="w-full overflow-hidden rounded-xl border border-stroke-soft-100 text-paragraph-sm dark:border-stroke-soft-100/50">
			<div className="grid grid-cols-[1fr_150px_100px_80px] items-center border-stroke-soft-100 border-b px-4 py-3.5 text-text-sub-600 dark:border-stroke-soft-100/50">
				<div className="flex items-center gap-2">
					<Icon name="mail-single" className="h-4 w-4" />
					<span className="text-xs">Contact</span>
				</div>
				<div className="flex items-center gap-2">
					<Icon name="check-circle" className="h-4 w-4" />
					<span className="text-xs">Status</span>
				</div>
				<div className="flex items-center gap-2">
					<Icon name="clock" className="h-4 w-4" />
					<span className="text-xs">Added</span>
				</div>
				<div />
			</div>

			<div className="divide-y divide-stroke-soft-100">
				{subscriptions.length === 0 && !isLoading ? (
					<ContactsEmptyState
						onAddContact={onAddContact}
						title={emptyStateTitle}
						description={emptyStateDescription}
						buttonText={emptyStateButtonText}
					/>
				) : (
					subscriptions.map((subscription) => (
						<div
							key={subscription.id}
							className={cn(
								"group/row grid grid-cols-[1fr_150px_100px_80px] items-center px-4 py-2 transition-colors",
								"hover:bg-bg-weak-50/50",
							)}
						>
							<div className="flex items-center gap-2">
								<div className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-neutral-600 to-neutral-500 font-semibold text-white text-xs uppercase tracking-wide shadow-sm">
									<Icon name="user" className="h-2.5 w-2.5" />
								</div>
								<span className="truncate font-medium text-label-sm text-text-strong-950">
									{subscription.contactId}
								</span>
							</div>

							<div className="flex items-center">
								<span
									className={cn(
										"inline-flex rounded-md border-[1px] px-[6px] py-0.5 font-medium text-[10px]",
										getStatusBadgeStyles(subscription.status),
									)}
								>
									{formatStatusLabel(subscription.status)}
								</span>
							</div>

							<div className="flex items-center">
								<span className="whitespace-nowrap text-label-sm text-text-strong-950">
									{formatRelativeTime(subscription.createdAt)}
								</span>
							</div>

							<div className="flex items-center justify-end">
								{subscription.status === "subscribed" && (
									<Button.Root
										variant="neutral"
										mode="ghost"
										size="xxsmall"
										onClick={() => onUnsubscribe(subscription.contactId)}
										title="Unsubscribe"
									>
										<Icon name="bell-minus" className="h-4 w-4" />
									</Button.Root>
								)}
							</div>
						</div>
					))
				)}
			</div>
		</div>
	);
};
