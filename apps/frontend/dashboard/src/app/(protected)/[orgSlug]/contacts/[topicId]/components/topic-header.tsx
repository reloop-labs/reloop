"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import {
	Content as PopoverContent,
	Root as PopoverRoot,
	Trigger as PopoverTrigger,
} from "@reloop/ui/popover";
import { Skeleton } from "@reloop/ui/skeleton";
import { useRouter } from "next/navigation";

interface Topic {
	id: string;
	name: string;
	description: string | null;
	organizationId: string;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
}

interface TopicHeaderProps {
	topic: Topic | undefined;
	isLoading: boolean;
	isFailed: boolean;
	onOpenAddContact: () => void;
	onOpenBulkImport: () => void;
}

export const TopicHeader = ({
	topic,
	isLoading,
	isFailed,
	onOpenAddContact,
	onOpenBulkImport,
}: TopicHeaderProps) => {
	const router = useRouter();
	const { activeOrganization } = useUserOrganization();

	if (isLoading) {
		return (
			<div className="pt-10 pb-6">
				<Button.Root
					onClick={() => router.push(`/${activeOrganization.slug}/contacts`)}
					variant="neutral"
					mode="stroke"
					size="xxsmall"
				>
					<Button.Icon>
						<Icon name="chevron-left" className="h-4 w-4" />
					</Button.Icon>
					Back
				</Button.Root>
				<div className="mt-6 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<Skeleton className="h-8 w-48 rounded" />
					</div>
				</div>
			</div>
		);
	}

	if (isFailed || !topic) {
		return (
			<div className="pt-10 pb-6">
				<Button.Root
					onClick={() => router.push(`/${activeOrganization.slug}/contacts`)}
					variant="neutral"
					mode="stroke"
					size="xxsmall"
				>
					<Button.Icon>
						<Icon name="chevron-left" className="h-4 w-4" />
					</Button.Icon>
					Back
				</Button.Root>
				<div className="mt-6">
					<h1 className="font-medium text-2xl text-text-sub-600">
						Topic not found
					</h1>
				</div>
			</div>
		);
	}

	return (
		<div className="pt-10 pb-6">
			<Button.Root
				onClick={() => router.push(`/${activeOrganization.slug}/contacts`)}
				variant="neutral"
				mode="stroke"
				size="xxsmall"
			>
				<Button.Icon>
					<Icon name="chevron-left" className="h-4 w-4" />
				</Button.Icon>
				Back
			</Button.Root>
			<div className="mt-6 flex items-center justify-between">
				<div>
					<div className="flex items-center gap-2">
						<Icon name="tag" className="h-5 w-5 text-text-sub-600" />
						<h1 className="font-medium text-2xl">{topic.name}</h1>
					</div>
					{topic.description && (
						<p className="mt-1 text-sm text-text-sub-600">
							{topic.description}
						</p>
					)}
				</div>
				<div className="flex items-center gap-2">
					<PopoverRoot>
						<PopoverTrigger asChild>
							<Button.Root variant="neutral" size="xsmall">
								<Icon name="plus" className="h-4 w-4" />
								Add Contact
								<Icon name="chevron-down" className="h-4 w-4" />
							</Button.Root>
						</PopoverTrigger>
						<PopoverContent
							align="end"
							side="bottom"
							className="p-2"
							sideOffset={3}
						>
							<div className="flex flex-col gap-1">
								<Button.Root
									variant="neutral"
									mode="ghost"
									size="small"
									onClick={onOpenAddContact}
									className="w-full justify-start"
								>
									<Icon name="user-plus" className="h-4 w-4" />
									Add Single Contact
								</Button.Root>
								<Button.Root
									variant="neutral"
									mode="ghost"
									size="small"
									onClick={onOpenBulkImport}
									className="w-full justify-start"
								>
									<Icon name="file-upload" className="h-4 w-4" />
									Bulk Import (CSV)
								</Button.Root>
							</div>
						</PopoverContent>
					</PopoverRoot>
				</div>
			</div>
		</div>
	);
};
