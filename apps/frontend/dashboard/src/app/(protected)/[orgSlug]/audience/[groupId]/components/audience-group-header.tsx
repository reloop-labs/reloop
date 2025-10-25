"use client";
import { formatRelativeTime } from "@fe/dashboard/utils/time";
import type { AudienceGroup } from "@reloop/api/types";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import {
	Content as PopoverContent,
	Root as PopoverRoot,
	Trigger as PopoverTrigger,
} from "@reloop/ui/popover";
import { Skeleton } from "@reloop/ui/skeleton";
import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { useState } from "react";
import { EditAudienceGroupModal } from "./edit-audience-group-modal";

interface AudienceGroupHeaderProps {
	group: AudienceGroup | null;
	isLoading: boolean;
}

export const AudienceGroupHeader = ({
	group,
	isLoading,
}: AudienceGroupHeaderProps) => {
	const { back } = useRouter();
	const [, setDeleteId] = useQueryState("delete");
	const [showEditModal, setShowEditModal] = useState(false);

	const handleEditClick = () => {
		setShowEditModal(true);
	};

	if (isLoading) {
		return (
			<div className="pt-10 pb-8">
				<Button.Root
					onClick={() => back()}
					variant="neutral"
					mode="stroke"
					size="xxsmall"
				>
					<Button.Icon>
						<Icon name="chevron-left" className="h-4 w-4" />
					</Button.Icon>
					Back
				</Button.Root>
				<div className="flex items-end justify-between pt-6">
					<div>
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
						<Skeleton className="mt-2 h-8 w-48" />
					</div>
					<div className="flex items-center gap-2">
						<Skeleton className="h-9 w-32 rounded-lg" />
						<Skeleton className="h-9 w-9 rounded-lg" />
					</div>
				</div>
			</div>
		);
	}

	if (!group) {
		return (
			<div className="pt-10 pb-8">
				<Button.Root
					onClick={() => back()}
					variant="neutral"
					mode="stroke"
					size="xxsmall"
				>
					<Button.Icon>
						<Icon name="chevron-left" className="h-4 w-4" />
					</Button.Icon>
					Back
				</Button.Root>
				<div className="flex items-end justify-between pt-6">
					<div>
						<div className="flex items-center gap-1.5">
							<p className="font-medium text-paragraph-sm text-text-sub-600">
								Audience Group{" "}
							</p>
							<p className="font-semibold text-paragraph-sm text-text-sub-600">
								•
							</p>
							<p className="font-medium text-paragraph-sm text-text-sub-600">
								---
							</p>
							<p className="font-semibold text-paragraph-sm text-text-sub-600">
								•
							</p>
							<div className="flex items-center gap-1 text-red-600">
								<Icon name="alert-circle" className="h-3.5 w-3.5" />
								<p className="font-medium text-paragraph-sm">Not found</p>
							</div>
						</div>
						<h1 className="font-medium text-title-h4 leading-8">
							Group not found
						</h1>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="pt-10 pb-8">
			<Button.Root
				onClick={() => back()}
				variant="neutral"
				mode="stroke"
				size="xxsmall"
			>
				<Button.Icon>
					<Icon name="chevron-left" className="h-4 w-4" />
				</Button.Icon>
				Back
			</Button.Root>
			<div className="flex items-end justify-between pt-6">
				<div>
					<div className="flex items-center gap-1.5">
						<p className="font-medium text-paragraph-sm text-text-sub-600">
							Audience Group{" "}
						</p>
						<p className="font-semibold text-paragraph-sm text-text-sub-600">
							•
						</p>
						<p className="font-medium text-paragraph-sm text-text-sub-600">
							{formatRelativeTime(group.createdAt)}
						</p>
						<p className="font-semibold text-paragraph-sm text-text-sub-600">
							•
						</p>
						<div className="flex items-center gap-1 text-blue-600">
							<Icon name="users" className="h-3.5 w-3.5" />
							<p className="font-medium text-paragraph-sm">
								{group.audienceCount} audiences
							</p>
						</div>
					</div>
					<div className="flex items-center">
						<h1 className="font-medium text-title-h4">{group.name}</h1>
						<Button.Root
							variant="neutral"
							mode="ghost"
							size="xxsmall"
							className="mt-1.5"
							onClick={handleEditClick}
						>
							<Icon name="edit" className="h-4 w-4" />
						</Button.Root>
					</div>
					{group.description && (
						<p className="mt-2 text-text-sub-600">{group.description}</p>
					)}
				</div>

				<div className="flex items-center gap-2">
					<PopoverRoot>
						<PopoverTrigger asChild>
							<Button.Root variant="neutral" mode="stroke" size="xsmall">
								<Icon name="more-vertical" className="h-4 w-4 rotate-90" />
							</Button.Root>
						</PopoverTrigger>
						<PopoverContent align="end" className="w-48 p-2">
							<div className="flex flex-col gap-1">
								<Button.Root
									variant="neutral"
									mode="ghost"
									size="small"
									onClick={() =>
										window.open("https://reloop.sh/docs/audience", "_blank")
									}
									className="w-full justify-start"
								>
									<Icon name="file-text" className="h-4 w-4" />
									Go to docs
								</Button.Root>
								<Button.Root
									variant="error"
									mode="ghost"
									size="small"
									onClick={() => setDeleteId(group.id)}
									className="w-full justify-start text-red-600 hover:bg-red-50"
								>
									<Icon name="trash" className="h-4 w-4" />
									Delete group
								</Button.Root>
							</div>
						</PopoverContent>
					</PopoverRoot>
				</div>
			</div>
			<div className="mt-4 flex gap-6">
				<div className="flex items-center gap-2">
					<Icon name="check-circle" className="h-4 w-4 text-success-base" />
					<span className="font-medium text-sm text-text-strong-950">
						{group.subscribedCount} subscribed
					</span>
				</div>
				<div className="flex items-center gap-2">
					<Icon name="minus-circle" className="h-4 w-4 text-text-sub-600" />
					<span className="font-medium text-sm text-text-strong-950">
						{group.unsubscribedCount} unsubscribed
					</span>
				</div>
			</div>

			<div className="my-9">
				<div className="w-full border-stroke-soft-200 border-t border-dashed" />
			</div>

			{/* Edit Group Modal */}
			{group && (
				<EditAudienceGroupModal
					group={group}
					open={showEditModal}
					onOpenChange={setShowEditModal}
				/>
			)}
		</div>
	);
};
