import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
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
import type { GroupDetail } from "#/features/contacts/hooks/use-contacts-query";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";
import { DeleteGroupModal } from "../components/groups/delete-group";
import { EditGroupModal } from "../components/groups/edit-group-modal";

/** Light keycap so it reads on filled primary buttons. */
const actionKbdOnSolidClassName =
	"border-white/25 bg-white/15 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]";

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

export const GroupHeader = ({ group, isLoading }: GroupHeaderProps) => {
	const router = useRouter();
	const [, setModal] = useQueryState("modal", { history: "replace" });
	const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	const currentTab = buttonRefs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();
	const hoveredItem = headerMenuItems[hoverIdx ?? -1];
	const isDanger = hoveredItem?.isDanger ?? false;

	const handleDeleteSuccess = () => {
		toast.success("Group deleted");
		router.push("/contacts/groups");
	};

	const handleMenuItemClick = (itemId: string) => {
		if (itemId === "delete") {
			setIsDeleteModalOpen(true);
		}
	};

	useHotkeys(
		"a c",
		(e) => {
			e.preventDefault();
			void setModal("add-contact-to-group");
		},
		{ enabled: !!group },
		[group],
	);

	useHotkeys(
		"e",
		(e) => {
			e.preventDefault();
			if (group) setIsRenameModalOpen(true);
		},
		{ enabled: !!group },
		[group],
	);

	if (!group && !isLoading) {
		return (
			<div className="pt-10 pb-8">
				<div className="flex items-center justify-between">
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
			<div className="pt-10 pb-2">
				<div className="flex items-center justify-between gap-4">
					<div className="min-w-0">
						{isLoading ? (
							<Skeleton className="h-7 w-48 rounded-lg" />
						) : (
							<div className="flex min-w-0 items-center">
								<div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-neutral-600 to-neutral-500 font-semibold text-white shadow-sm">
									<Icon name="modules" className="h-3 w-3" />
								</div>
								<h1 className="ml-2 truncate font-medium text-title-h6 leading-8">
									{group?.name}
								</h1>
							</div>
						)}
					</div>

					<div className="flex shrink-0 items-center gap-2">
						{isLoading ? (
							<>
								<Skeleton className="h-8 w-28 rounded-lg" />
								<Skeleton className="h-8 w-40 rounded-lg" />
								<Skeleton className="h-8 w-9 rounded-lg" />
							</>
						) : group ? (
							<>
								<Button.Root
									variant="neutral"
									mode="stroke"
									size="xsmall"
									className="gap-1.5 font-semibold"
									onClick={() => setIsRenameModalOpen(true)}
									aria-keyshortcuts="E"
								>
									<Icon name="edit" className="h-3.5 w-3.5" />
									<span>Rename group</span>
									<ActionKbd className="ml-0.5 w-auto min-w-4 px-1">
										E
									</ActionKbd>
								</Button.Root>
								<FancyButton.Root
									variant="blue"
									size="xsmall"
									onClick={() => void setModal("add-contact-to-group")}
									className="gap-1.5"
									aria-keyshortcuts="A C"
								>
									<Icon name="plus" className="h-3.5 w-3.5" />
									Add contact to group
									<span className="inline-flex items-center gap-0.5">
										<ActionKbd className={actionKbdOnSolidClassName}>
											A
										</ActionKbd>
										<ActionKbd className={actionKbdOnSolidClassName}>
											C
										</ActionKbd>
									</span>
								</FancyButton.Root>
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
			</div>

			{group ? (
				<EditGroupModal
					open={isRenameModalOpen}
					onOpenChange={setIsRenameModalOpen}
					group={group}
				/>
			) : null}

			{group && isDeleteModalOpen ? (
				<DeleteGroupModal
					open={isDeleteModalOpen}
					onOpenChange={setIsDeleteModalOpen}
					group={group}
					onDeleteSuccess={handleDeleteSuccess}
				/>
			) : null}
		</>
	);
};
