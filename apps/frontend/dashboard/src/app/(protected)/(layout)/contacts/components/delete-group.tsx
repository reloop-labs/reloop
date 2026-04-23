"use client";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Kbd from "@reloop/ui/kbd";
import * as Modal from "@reloop/ui/modal";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";

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

	useEffect(() => {
		if (!open) {
			setConfirmationName("");
		}
	}, [open]);

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
		setConfirmationName("");
	};

	return (
		<Modal.Root open={open} onOpenChange={onOpenChange}>
			<Modal.Content
				className="rounded-2xl border border-stroke-soft-100/50 p-0.5 sm:max-w-[480px]"
				showClose={true}
			>
				<div className="rounded-2xl border border-stroke-soft-100/50">
					<Modal.Header className="before:border-stroke-soft-200/50">
						<div className="flex-1">
							<Modal.Title>Delete Group</Modal.Title>
						</div>
					</Modal.Header>
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
							<Modal.Body className="space-y-4">
								<div>
									<p className="text-sm text-text-sub-600">
										Are you sure you want to delete this group?
									</p>
									<p className="font-medium text-error-base text-sm">
										This action cannot be undone.
									</p>
								</div>

								<div className="space-y-2">
									<p className="text-sm text-text-strong-950">
										Type{" "}
										<span className="inline-flex max-w-xs items-center gap-1 truncate rounded-md border border-stroke-soft-100 bg-bg-weak-50/50 px-2 py-1 font-mono text-text-strong-950 text-xs">
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
										to confirm.
									</p>
									<Input.Root size="small">
										<Input.Wrapper>
											<Input.Input
												type="text"
												className="px-2"
												value={confirmationName}
												onChange={(e) => setConfirmationName(e.target.value)}
												placeholder="Enter group name"
											/>
										</Input.Wrapper>
									</Input.Root>
								</div>
							</Modal.Body>
							<Modal.Footer className="mt-4 flex items-center justify-end gap-3 border-stroke-soft-100/50">
								<Button.Root
									type="button"
									variant="neutral"
									mode="stroke"
									size="xsmall"
									onClick={handleCancel}
									disabled={isSubmitting}
								>
									Cancel
									<Kbd.Root className="bg-bg-weak-50 text-xs">Esc</Kbd.Root>
								</Button.Root>
								<Button.Root
									type="submit"
									variant="error"
									size="xsmall"
									disabled={confirmationName !== group.name || isSubmitting}
								>
									{isSubmitting ? (
										<>
											<Icon name="loader-2" className="h-4 w-4 animate-spin" />
											Deleting...
										</>
									) : (
										"Delete Group"
									)}
								</Button.Root>
							</Modal.Footer>
						</form>
					) : null}
				</div>
			</Modal.Content>
		</Modal.Root>
	);
};
