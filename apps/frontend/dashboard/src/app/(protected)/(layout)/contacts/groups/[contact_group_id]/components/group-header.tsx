"use client";
import { DeleteGroupModal } from "@fe/dashboard/app/(protected)/(layout)/contacts/components/delete-group";
import { EditGroupModal } from "@fe/dashboard/app/(protected)/(layout)/contacts/components/edit-group-modal";
import { AnimatedBackButton } from "@fe/dashboard/components/animated-back-button";
import { AnimatedHoverBackground } from "@fe/dashboard/components/animated-hover-background";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { formatRelativeTime } from "@fe/dashboard/utils/time";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { KbdKey } from "@reloop/ui/kbd-key";
import {
	Content as PopoverContent,
	Root as PopoverRoot,
	Trigger as PopoverTrigger,
} from "@reloop/ui/popover";
import { Skeleton } from "@reloop/ui/skeleton";
import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";

interface GroupData {
	id: string;
	name: string;
	organizationId: string;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
}

interface GroupHeaderProps {
	group: GroupData | undefined;
	isLoading: boolean;
}

const headerMenuItems = [
	{ id: "edit", label: "Edit group", icon: "edit" as const, isDanger: false },
	{
		id: "delete",
		label: "Delete group",
		icon: "trash" as const,
		isDanger: true,
	},
];

export const GroupHeader = ({ group, isLoading }: GroupHeaderProps) => {
	const { activeOrganization } = useUserOrganization();
	const router = useRouter();
	const [, setModal] = useQueryState("modal", { history: "replace" });
	const [copied, setCopied] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	const currentTab = buttonRefs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();
	const hoveredItem = headerMenuItems[hoverIdx ?? -1];
	const isDanger = hoveredItem?.isDanger ?? false;

	const handleCopyId = async () => {
		if (group?.id) {
			try {
				await navigator.clipboard.writeText(group.id);
				toast.success("Group ID copied to clipboard");
				setCopied(true);
				setTimeout(() => setCopied(false), 2000);
			} catch {
				toast.error("Failed to copy ID");
			}
		}
	};

	const handleDeleteSuccess = () => {
		toast.success("Group deleted");
		if (activeOrganization?.slug) {
			router.push("/contacts");
		}
	};

	const handleMenuItemClick = (itemId: string) => {
		if (itemId === "edit") {
			setIsEditModalOpen(true);
		} else if (itemId === "delete") {
			setIsDeleteModalOpen(true);
		}
	};

	useHotkeys(
		"a+c",
		(e) => {
			e.preventDefault();
			setModal("add-contact-to-group");
		},
		{
			enabled: !!group,
		},
	);

	if (!group && !isLoading) {
		return (
			<div className="pt-10 pb-8">
				<AnimatedBackButton onClick={() => router.push("/contacts/groups")} />
				<div className="flex items-center justify-between pt-6">
					<div>
						<div className="flex items-center gap-1.5">
							<p className="font-medium text-paragraph-xs text-text-sub-600">
								Group{" "}
							</p>
							<p className="font-semibold text-paragraph-xs text-text-sub-600">
								•
							</p>
							<div className="flex items-center gap-1 text-error-base">
								<Icon name="alert-circle" className="h-3.5 w-3.5" />
								<p className="font-medium text-paragraph-xs">Not found</p>
							</div>
						</div>
						<h1 className="font-medium text-title-h6 leading-8">
							Group not found
						</h1>
					</div>
				</div>
			</div>
		);
	}

	return (
		<>
			<div className="pt-10 pb-8">
				<AnimatedBackButton onClick={() => router.push("/contacts/groups")} />
				<div className="flex items-center justify-between pt-6">
					<div>
						{isLoading ? (
							<div className="flex items-center gap-1.5">
								<Skeleton className="h-4 w-12 rounded-full" />
								<Skeleton className="h-1 w-1 rounded-full" />
								<Skeleton className="h-4 w-20 rounded-full" />
							</div>
						) : (
							<div className="flex items-center gap-1.5">
								<p className="font-medium text-paragraph-xs text-text-sub-600">
									Group{" "}
								</p>
								<p className="font-semibold text-paragraph-xs text-text-sub-600">
									•
								</p>
								<p className="font-medium text-paragraph-xs text-text-sub-600">
									{group?.createdAt
										? formatRelativeTime(group.createdAt)
										: "---"}
								</p>
							</div>
						)}
						{isLoading ? (
							<Skeleton className="mt-2 h-7 w-48 rounded-lg" />
						) : (
							<div className="flex items-center gap-2">
								<div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-neutral-600 to-neutral-500 font-semibold text-white shadow-sm">
									<Icon name="modules" className="h-3 w-3" />
								</div>
								<h1 className="font-medium text-title-h6 leading-8">
									{group?.name}
								</h1>
							</div>
						)}
					</div>

					<div className="flex items-center gap-2">
						{isLoading ? (
							<>
								<Skeleton className="h-9 w-48 rounded-lg" />
								<Skeleton className="h-9 w-9 rounded-lg" />
							</>
						) : group ? (
							<>
								<Button.Root
									variant="neutral"
									size="xsmall"
									onClick={() => setModal("add-contact-to-group")}
									className="gap-2"
								>
									<Icon name="plus" className="h-4 w-4" />
									Add Contacts to Group
									<span className="inline-flex items-center gap-0.5">
										<KbdKey>a</KbdKey>
										<KbdKey>c</KbdKey>
									</span>
								</Button.Root>
								<PopoverRoot>
									<PopoverTrigger asChild>
										<Button.Root variant="neutral" mode="stroke" size="xsmall">
											<Icon
												name="more-horizontal"
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
											{headerMenuItems.map((item, idx) => (
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

				{/* Stats Grid - Row 1 */}
				<div className="mt-10 grid grid-cols-3 gap-x-12 gap-y-6">
					{/* Group Name */}
					<div className="flex flex-col gap-1.5">
						<div className="flex items-center gap-1.5">
							<Icon name="modules" className="h-3.5 w-3.5 text-text-sub-600" />
							<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
								Group Name
							</span>
						</div>
						{isLoading ? (
							<Skeleton className="h-5 w-32 rounded-lg" />
						) : (
							<span className="font-medium text-paragraph-sm text-text-strong-950">
								{group?.name || "---"}
							</span>
						)}
					</div>

					{/* Created */}
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
								{group?.createdAt ? formatRelativeTime(group.createdAt) : "---"}
							</span>
						)}
					</div>

					{/* Group ID */}
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
									{group?.id?.slice(0, 18)}...
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
				</div>
			</div>

			{/* Edit Group Modal */}
			{group && (
				<EditGroupModal
					open={isEditModalOpen}
					onOpenChange={setIsEditModalOpen}
					group={group}
				/>
			)}

			{/* Delete Group Modal */}
			{group && isDeleteModalOpen && (
				<DeleteGroupModal
					open={isDeleteModalOpen}
					onOpenChange={setIsDeleteModalOpen}
					group={group}
					onDeleteSuccess={handleDeleteSuccess}
				/>
			)}
		</>
	);
};
