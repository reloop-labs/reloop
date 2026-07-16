import { AnimatedBackButton } from "#/features/dashboard/animated-back-button";
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";
import {
	type GroupDetail,
	useGroupContactsCountQuery,
	useInvalidateContacts,
} from "#/features/contacts/hooks/use-contacts-query";
import { formatRelativeTime } from "#/utils/format-relative-time";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { KbdCommand } from "@reloop/ui/kbd-command";
import { KbdEnter } from "@reloop/ui/kbd-enter";
import { KbdEsc } from "@reloop/ui/kbd-esc";
import { KbdKey } from "@reloop/ui/kbd-key";
import {
	Content as PopoverContent,
	Root as PopoverRoot,
	Trigger as PopoverTrigger,
} from "@reloop/ui/popover";
import { Skeleton } from "@reloop/ui/skeleton";
import Spinner from "@reloop/ui/spinner";
import { useNavigate } from "@tanstack/react-router";
import { useQueryState } from "nuqs";
import { useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { DeleteGroupModal } from "../components/groups/delete-group";

interface GroupHeaderProps {
	group: GroupDetail | undefined;
	isLoading: boolean;
}

const headerMenuItems = [
	{
		id: "delete",
		label: "Delete group",
		icon: "trash" as const,
		isDanger: true,
	},
];

const GroupContactsCount = ({ groupId }: { groupId: string }) => {
	const { data, isPending: isLoading } = useGroupContactsCountQuery(groupId);

	if (isLoading) return <Skeleton className="h-5 w-8 rounded-lg" />;
	return (
		<span className="font-medium text-paragraph-sm text-text-strong-950">
			{data?.total?.toLocaleString() ?? "0"}
		</span>
	);
};

export const GroupHeader = ({ group, isLoading }: GroupHeaderProps) => {
	const invalidate = useInvalidateContacts();
	const navigate = useNavigate();
	const [, setModal] = useQueryState("modal", { history: "replace" });
	const [copied, setCopied] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [editName, setEditName] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
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
		void navigate({ to: "/contacts/groups" });
	};

	const handleEditStart = () => {
		setEditName(group?.name || "");
		setIsEditing(true);
	};

	const handleEditCancel = () => {
		setIsEditing(false);
		setEditName(group?.name || "");
	};

	const handleEditSubmit = async (e?: React.FormEvent) => {
		e?.preventDefault();
		if (!group || !editName.trim() || editName === group.name) {
			setIsEditing(false);
			return;
		}

		setIsSubmitting(true);
		try {
			const response = await fetch(`/api/contacts/v1/groups/${group.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ name: editName }),
			});

			if (!response.ok) {
				const errorData = (await response.json().catch(() => ({}))) as {
					message?: string;
				};
				throw new Error(errorData.message || "Failed to update group");
			}

			toast.success("Group updated successfully");
			await invalidate();
			setIsEditing(false);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to update group",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleMenuItemClick = (itemId: string) => {
		if (itemId === "delete") {
			setIsDeleteModalOpen(true);
		}
	};

	useHotkeys(
		"m+c",
		(e) => {
			e.preventDefault();
			void setModal("add-contact-to-group");
		},
		{ enabled: !!group },
	);

	useHotkeys(
		"mod+enter",
		(e) => {
			e.preventDefault();
			if (
				isEditing &&
				!isSubmitting &&
				editName.trim() &&
				editName !== group?.name
			) {
				void handleEditSubmit();
			}
		},
		{ enableOnFormTags: true, enabled: isEditing },
		[isEditing, isSubmitting, editName, group],
	);

	useHotkeys(
		"esc",
		(e) => {
			e.preventDefault();
			if (isEditing) {
				handleEditCancel();
			}
		},
		{ enableOnFormTags: true, enabled: isEditing },
		[isEditing],
	);

	if (!group && !isLoading) {
		return (
			<div className="pt-10 pb-8">
				<AnimatedBackButton
					onClick={() => void navigate({ to: "/contacts/groups" })}
				/>
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
				<AnimatedBackButton
					onClick={() => void navigate({ to: "/contacts/groups" })}
				/>
				<div className="flex items-center justify-between pt-6">
					<div>
						{isLoading ? (
							<Skeleton className="h-7 w-48 rounded-lg" />
						) : isEditing ? (
							<form
								onSubmit={(e) => void handleEditSubmit(e)}
								className="flex items-center"
							>
								<div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-neutral-600 to-neutral-500 font-semibold text-white">
									<Icon name="modules" className="h-3 w-3" />
								</div>
								<input
									value={editName}
									onChange={(e) => setEditName(e.target.value)}
									// biome-ignore lint/a11y/noAutofocus: edit mode focus
									autoFocus
									disabled={isSubmitting}
									className="ml-2 w-[160px] border-0 bg-transparent px-0 py-0 font-medium text-text-strong-950 text-title-h6 leading-8 focus:border-text-strong-950 focus:outline-none focus:ring-0"
								/>
								<Button.Root
									type="submit"
									variant="neutral"
									size="xxsmall"
									disabled={
										isSubmitting || !editName.trim() || editName === group?.name
									}
									className="ml-3 gap-2"
								>
									{isSubmitting ? (
										<Spinner size={14} color="currentColor" />
									) : (
										<>
											Save
											<span className="inline-flex items-center gap-0.5">
												<KbdCommand />
												<KbdEnter />
											</span>
										</>
									)}
								</Button.Root>
								<Button.Root
									type="button"
									variant="neutral"
									mode="stroke"
									size="xxsmall"
									onClick={handleEditCancel}
									disabled={isSubmitting}
									className="ml-2 gap-2"
								>
									Cancel
									<KbdEsc />
								</Button.Root>
							</form>
						) : (
							<div className="flex items-center">
								<div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-neutral-600 to-neutral-500 font-semibold text-white shadow-sm">
									<Icon name="modules" className="h-3 w-3" />
								</div>
								<button
									type="button"
									className="ml-2 cursor-pointer font-medium text-title-h6 leading-8 transition-colors hover:text-text-sub-600"
									onClick={handleEditStart}
								>
									{group?.name}
								</button>
								<button
									type="button"
									onClick={handleEditStart}
									className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-md text-text-sub-600 transition-colors hover:bg-neutral-alpha-10"
								>
									<Icon name="edit" className="h-3.5 w-3.5" />
								</button>
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
									onClick={() => void setModal("add-contact-to-group")}
									className="gap-2"
								>
									Manage Contacts
									<span className="inline-flex items-center gap-0.5">
										<KbdKey>M</KbdKey>
										<KbdKey>C</KbdKey>
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

				<div className="mt-10 grid grid-cols-3 gap-x-12 gap-y-6">
					<div className="flex flex-col gap-1.5">
						<div className="flex items-center gap-1.5">
							<Icon name="users" className="h-3.5 w-3.5 text-text-sub-600" />
							<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
								Total Contacts
							</span>
						</div>
						{isLoading ? (
							<Skeleton className="h-5 w-32 rounded-lg" />
						) : (
							<GroupContactsCount groupId={group?.id || ""} />
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
								{group?.createdAt ? formatRelativeTime(group.createdAt) : "---"}
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
