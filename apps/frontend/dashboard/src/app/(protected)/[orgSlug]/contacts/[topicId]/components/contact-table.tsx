"use client";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";

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
	activeOrganizationSlug: string;
}

export const ContactTable = ({
	subscriptions,
	isLoading,
	loadingRows,
	onUnsubscribe,
	activeOrganizationSlug,
}: ContactTableProps) => {
	if (isLoading) {
		return (
			<div className="w-full overflow-hidden rounded-xl border border-stroke-soft-200 text-paragraph-sm shadow-regular-md ring-stroke-soft-200 ring-inset">
				<div className="grid grid-cols-[1fr_minmax(150px,auto)_minmax(100px,auto)_48px]">
					<div className="bg-bg-weak-50 pl-5 font-medium text-text-sub-600">
						<div className="py-2.5">Contact</div>
					</div>
					<div className="bg-bg-weak-50 font-medium text-text-sub-600">
						<div className="py-2.5">Status</div>
					</div>
					<div className="bg-bg-weak-50 font-medium text-text-sub-600">
						<div className="py-2.5">Added</div>
					</div>
					<div className="bg-bg-weak-50 font-medium text-text-sub-600">
						<div className="py-2.5" />
					</div>
					{Array.from({ length: loadingRows }).map((_, index) => (
						<div
							key={`skeleton-${index}-${activeOrganizationSlug}`}
							className="group/row contents"
						>
							<div className="flex items-center border-stroke-soft-200 border-t py-2.5">
								<div className="flex items-center gap-2 pl-5">
									<Skeleton className="h-4 w-4 rounded" />
									<Skeleton className="h-4 w-48 rounded" />
								</div>
							</div>
							<div className="flex items-center border-stroke-soft-200 border-t py-2.5">
								<Skeleton className="h-4 w-20 rounded" />
							</div>
							<div className="flex items-center border-stroke-soft-200 border-t py-2.5">
								<Skeleton className="h-4 w-24 rounded" />
							</div>
							<div className="flex items-center border-stroke-soft-200 border-t py-2.5">
								<Skeleton className="h-4 w-4 rounded" />
							</div>
						</div>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="w-full overflow-hidden rounded-xl border border-stroke-soft-200 text-paragraph-sm shadow-regular-md ring-stroke-soft-200 ring-inset">
			<div className="grid grid-cols-[1fr_minmax(150px,auto)_minmax(100px,auto)_48px]">
				<div className="bg-bg-weak-50 pl-5 font-medium text-text-sub-600">
					<div className="py-2.5">Contact</div>
				</div>
				<div className="bg-bg-weak-50 font-medium text-text-sub-600">
					<div className="py-2.5">Status</div>
				</div>
				<div className="bg-bg-weak-50 font-medium text-text-sub-600">
					<div className="py-2.5">Added</div>
				</div>
				<div className="bg-bg-weak-50 font-medium text-text-sub-600">
					<div className="py-2.5" />
				</div>
				{subscriptions.map((subscription) => (
					<div key={subscription.id} className="group/row contents">
						<div className="flex items-center border-stroke-soft-200 border-t py-2.5 group-hover/row:bg-bg-weak-50">
							<div className="flex items-center gap-2 pl-5">
								<Icon name="user" className="h-4 w-4 text-text-sub-600" />
								<span className="font-medium text-label-sm text-text-strong-950">
									{subscription.contactId}
								</span>
							</div>
						</div>
						<div className="flex items-center border-stroke-soft-200 border-t py-2.5 group-hover/row:bg-bg-weak-50">
							<div
								className={`flex items-center gap-1 rounded-lg py-0.5 font-medium text-label-xs capitalize ${
									subscription.status === "subscribed"
										? "text-success-base"
										: "text-text-sub-600"
								}`}
							>
								<Icon
									name={
										subscription.status === "subscribed"
											? "check-circle"
											: "minus-circle"
									}
									className="h-3.5 w-3.5"
								/>
								{subscription.status}
							</div>
						</div>
						<div className="flex items-center border-stroke-soft-200 border-t py-2.5 group-hover/row:bg-bg-weak-50">
							<span className="text-label-sm text-text-sub-600">
								{new Date(subscription.createdAt).toLocaleDateString()}
							</span>
						</div>
						<div className="flex items-center border-stroke-soft-200 border-t py-2.5 group-hover/row:bg-bg-weak-50">
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
				))}
			</div>
		</div>
	);
};
