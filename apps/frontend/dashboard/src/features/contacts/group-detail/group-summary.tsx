"use client";

import * as Avatar from "@reloop/ui/avatar";
import { cn } from "@reloop/ui/cn";
import { Skeleton } from "@reloop/ui/skeleton";
import { getAvatarGradient, getAvatarInitial } from "#/utils/avatar";
import { formatRelativeTime } from "#/utils/format-relative-time";
import type { GroupCreatedBy, GroupDetail } from "../hooks/use-contacts-query";
import { useGroupContactsCountQuery } from "../hooks/use-contacts-query";

function StatItem({
	label,
	value,
	isLoading,
}: {
	label: string;
	value: string;
	isLoading?: boolean;
}) {
	return (
		<div className="min-w-0">
			<p className="font-medium text-[11px] text-text-sub-600 uppercase tracking-wider">
				{label}
			</p>
			{isLoading ? (
				<Skeleton className="mt-1 h-5 w-20 rounded-lg" />
			) : (
				<p className="mt-1 truncate font-medium text-sm text-text-strong-950 tabular-nums">
					{value}
				</p>
			)}
		</div>
	);
}

function CreatedByValue({
	createdBy,
	isLoading,
}: {
	createdBy?: GroupCreatedBy;
	isLoading?: boolean;
}) {
	if (isLoading) {
		return <Skeleton className="mt-1 h-5 w-28 rounded-lg" />;
	}

	if (!createdBy) {
		return (
			<p className="mt-1 truncate font-medium text-sm text-text-strong-950">
				—
			</p>
		);
	}

	const label =
		createdBy.name ||
		(createdBy.email ? createdBy.email.split("@")[0] : "Unknown");
	const safeEmail = createdBy.email || "unknown@reloop.sh";

	return (
		<div className="mt-1 flex min-w-0 items-center gap-2">
			<Avatar.Root size="20" color="blue" className="shrink-0">
				{createdBy.image ? (
					<Avatar.Image src={createdBy.image} alt={label} />
				) : (
					<Avatar.Image asChild>
						<div
							className={cn(
								"flex h-full w-full items-center justify-center rounded-full font-medium text-[8px] text-white uppercase tracking-wide",
								getAvatarGradient(safeEmail),
							)}
						>
							{getAvatarInitial(createdBy.name ?? null, safeEmail)}
						</div>
					</Avatar.Image>
				)}
			</Avatar.Root>
			<p className="truncate font-medium text-sm text-text-strong-950">
				{label}
			</p>
		</div>
	);
}

/** Two-box snapshot matching the API key detail summary layout. */
export function GroupSummary({
	group,
	isLoading,
}: {
	group: GroupDetail | undefined;
	isLoading?: boolean;
}) {
	const { data: stats, isPending: statsLoading } = useGroupContactsCountQuery(
		group?.id,
	);

	const countsLoading = Boolean(isLoading || statsLoading);

	return (
		<div className="mt-8 grid gap-4 lg:grid-cols-2">
			{/* Contacts snapshot */}
			<div className="overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-bg-white-0/5">
				<div className="space-y-3 p-4">
					<div>
						<p className="font-medium text-sm text-text-strong-950">
							Contacts Staus
						</p>
						<p className="mt-0.5 text-[12px] text-text-sub-600 leading-relaxed">
							Membership and subscription status for this group.
						</p>
					</div>

					<div className="grid grid-cols-3 gap-4">
						<StatItem
							label="Total"
							value={(stats?.total ?? 0).toLocaleString()}
							isLoading={countsLoading}
						/>
						<StatItem
							label="Subscribed"
							value={(stats?.subscribedContacts ?? 0).toLocaleString()}
							isLoading={countsLoading}
						/>
						<StatItem
							label="Unsubscribed"
							value={(stats?.unsubscribedContacts ?? 0).toLocaleString()}
							isLoading={countsLoading}
						/>
					</div>
				</div>
			</div>

			{/* Meta */}
			<div className="overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-bg-white-0/5">
				<div className="space-y-3 p-4">
					<div>
						<p className="font-medium text-sm text-text-strong-950">Details</p>
						<p className="mt-0.5 text-[12px] text-text-sub-600 leading-relaxed">
							When this group was created and who created it.
						</p>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="min-w-0">
							<p className="font-medium text-[11px] text-text-sub-600 uppercase tracking-wider">
								Created at
							</p>
							{isLoading ? (
								<Skeleton className="mt-1 h-5 w-24 rounded-lg" />
							) : (
								<p className="mt-1 truncate font-medium text-sm text-text-strong-950">
									{group?.createdAt ? formatRelativeTime(group.createdAt) : "—"}
								</p>
							)}
						</div>
						<div className="min-w-0">
							<p className="font-medium text-[11px] text-text-sub-600 uppercase tracking-wider">
								Created by
							</p>
							<CreatedByValue
								createdBy={group?.createdBy}
								isLoading={isLoading}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
