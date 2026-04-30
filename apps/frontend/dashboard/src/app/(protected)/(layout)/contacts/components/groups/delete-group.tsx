"use client";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Modal from "@reloop/ui/modal";
import { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import useSWR, { useSWRConfig } from "swr";

interface Group {
	id: string;
	name: string;
}

interface DeleteGroupModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	group: Group | null;
	onDeleteSuccess?: () => void;
}

export const DeleteGroupModal = ({
	open,
	onOpenChange,
	group,
	onDeleteSuccess,
}: DeleteGroupModalProps) => {
	const [confirmationName, setConfirmationName] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isNameCopied, setIsNameCopied] = useState(false);
	const { mutate } = useSWRConfig();

	// Fetch contacts count for the group
	const { data: contactsData, isLoading: isLoadingContacts } = useSWR<{
		total: number;
	}>(
		group && open ? `/api/contacts/v1/groups/${group.id}/contacts?limit=1` : null,
	);

	useEffect(() => {
		if (!open) {
			const timer = setTimeout(() => {
				setConfirmationName("");
			}, 300); // Wait for transition
			return () => clearTimeout(timer);
		}
	}, [open]);

	useHotkeys(
		"mod+enter",
		(e) => {
			e.preventDefault();
			if (open && confirmationName === group?.name && !isSubmitting) {
				handleDelete();
			}
		},
		{ enableOnFormTags: ["INPUT"], enabled: open && !!group },
		[open, confirmationName, group, isSubmitting],
	);

	const handleDelete = async () => {
		if (!group) return;

		if (confirmationName !== group.name) {
			toast.error("Please enter the correct group name to confirm deletion");
			return;
		}

		setIsSubmitting(true);
		try {
			const response = await fetch(`/api/contacts/v1/groups/${group.id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || "Failed to delete group");
			}

			toast.success("Group deleted successfully");
			mutate(
				(key: string) =>
					typeof key === "string" && key.startsWith("/api/contacts/v1/groups"),
			);
			onOpenChange(false);
			setConfirmationName("");
			onDeleteSuccess?.();
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to delete group",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleCancel = () => {
		onOpenChange(false);
	};

	return (
		<Modal.Root open={open} onOpenChange={onOpenChange}>
			<Modal.Content
				className="rounded-20 border-none p-0 sm:max-w-[480px]"
				showClose={true}
			>
				<div className="rounded-20 border border-stroke-soft-100/50 bg-bg-white-0">
					{!group && open ? (
						<div className="flex h-[200px] flex-col items-center justify-center space-y-4 p-8 text-center">
							<Icon
								name="loader-2"
								className="h-8 w-8 animate-spin text-text-sub-600"
							/>
							<p className="text-sm text-text-sub-600">
								Loading group details...
							</p>
						</div>
					) : group ? (
						<form
							onSubmit={(e) => {
								e.preventDefault();
								if (confirmationName === group.name && !isSubmitting) {
									handleDelete();
								}
							}}
						>
							<div className="p-6">
								<div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-error-base/10">
									<Icon name="trash" className="h-4 w-4 text-error-base" />
								</div>

								<Modal.Title className="font-medium text-text-strong-950 text-title-h5">
									Delete group?
								</Modal.Title>
								<Modal.Description className="mb-6 text-pretty text-sm text-text-sub-600 leading-relaxed">
									This will permanently delete the group. Any contacts inside
									this group will be unlinked but{" "}
									<span className="font-semibold text-text-strong-950">
										they will not be deleted
									</span>
									. This action cannot be undone.
								</Modal.Description>

								{/* Group Stats Card */}
								<div className="mb-6 flex items-center gap-3 rounded-2xl border border-stroke-soft-100 bg-bg-weak-50/50 p-4 dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/30">
									<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-error-base/10 text-error-base">
										<Icon name="modules" className="h-5 w-5" />
									</div>
									<div className="min-w-0 flex-1">
										<p className="truncate font-medium text-sm text-text-strong-950">
											{group.name}
										</p>
										<p className="mt-0.5 truncate font-medium text-text-sub-600 text-xs">
											{isLoadingContacts ? (
												<span className="inline-flex items-center gap-1.5">
													<Icon
														name="loader-2"
														className="h-3 w-3 animate-spin"
													/>
													Loading contacts...
												</span>
											) : (
												<span>
													{contactsData?.total || 0} contact
													{contactsData?.total !== 1 ? "s" : ""} will be
													unlinked
												</span>
											)}
										</p>
									</div>
								</div>

								{/* Confirmation Input */}
								<div className="mb-2">
									<p className="mb-2 text-sm text-text-sub-600">
										Type{" "}
										<span className="inline-flex max-w-xs items-center gap-1 truncate rounded-[6px] border border-stroke-soft-100 bg-bg-weak-50/50 px-1.5 py-0.5 font-medium text-text-strong-950 text-xs dark:border-stroke-soft-100/40 dark:bg-bg-strong-200">
											{group.name}
											<button
												type="button"
												onClick={async () => {
													try {
														await navigator.clipboard.writeText(group.name);
														setIsNameCopied(true);
														setTimeout(() => setIsNameCopied(false), 2000);
													} catch {
														toast.error("Failed to copy group name");
													}
												}}
												className="text-text-sub-600 transition-colors hover:text-text-strong-950"
											>
												<Icon
													name={isNameCopied ? "check" : "copy"}
													className={`h-3 w-3 ${isNameCopied ? "text-success-base" : ""}`}
												/>
											</button>
										</span>{" "}
										to confirm
									</p>
									<Input.Root size="small" className="rounded-[10px]">
										<Input.Wrapper>
											<Input.Input
												type="text"
												value={confirmationName}
												onChange={(e) => setConfirmationName(e.target.value)}
												placeholder={group.name}
											/>
										</Input.Wrapper>
									</Input.Root>
								</div>
							</div>

							<div className="flex flex-col-reverse justify-end gap-2 px-6 pb-6 sm:flex-row sm:items-center">
								<Button.Root
									type="button"
									variant="neutral"
									mode="stroke"
									onClick={handleCancel}
									disabled={isSubmitting}
									className="gap-1.5"
								>
									Cancel
									<span className="flex h-[19px] w-7 items-center justify-center rounded-[5px] border border-stroke-soft-100 bg-bg-weak-50/50 p-px font-medium text-[10px]">
										Esc
									</span>
								</Button.Root>
								<Button.Root
									type="submit"
									variant="error"
									disabled={isSubmitting || confirmationName !== group.name}
								>
									{isSubmitting ? (
										"Deleting..."
									) : (
										<>
											Delete group
											<span className="inline-flex items-center gap-0.5">
												<Icon
													name="command"
													className="h-4 w-4 rounded-sm border border-stroke-soft-100/20 p-px"
												/>
												<Icon
													name="enter"
													className="h-4 w-4 rounded-sm border border-stroke-soft-100/20 p-px"
												/>
											</span>
										</>
									)}
								</Button.Root>
							</div>
						</form>
					) : null}
				</div>
			</Modal.Content>
		</Modal.Root>
	);
};
