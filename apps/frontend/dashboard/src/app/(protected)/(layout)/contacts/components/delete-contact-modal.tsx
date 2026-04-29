"use client";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Modal from "@reloop/ui/modal";
import { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import type { AudienceStatus } from "@fe/dashboard/utils/audience";

interface Contact {
	id: string;
	email: string;
	status: AudienceStatus;
	organizationId: string;
	properties: Record<string, string | number>;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
}

interface DeleteContactModalProps {
	contact: Contact | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onDeleteSuccess?: () => void;
}

export const DeleteContactModal = ({
	contact,
	open,
	onOpenChange,
	onDeleteSuccess,
}: DeleteContactModalProps) => {
	const [confirmationEmail, setConfirmationEmail] = useState("");
	const [isDeleting, setIsDeleting] = useState(false);
	const [isEmailCopied, setIsEmailCopied] = useState(false);
	const { mutate } = useSWRConfig();

	// Reset confirmation when modal closes or contact changes
	useEffect(() => {
		if (!open) {
			const timer = setTimeout(() => {
				setConfirmationEmail("");
			}, 300);
			return () => clearTimeout(timer);
		}
	}, [open]);

	useHotkeys(
		"mod+enter",
		(e) => {
			e.preventDefault();
			if (open && confirmationEmail === contact?.email && !isDeleting) {
				handleDelete();
			}
		},
		{ enableOnFormTags: ["INPUT"], enabled: open && !!contact },
		[open, confirmationEmail, contact, isDeleting],
	);

	const handleDelete = async () => {
		if (!contact) return;

		if (confirmationEmail !== contact.email) {
			toast.error("Please enter the correct email to confirm deletion");
			return;
		}

		try {
			setIsDeleting(true);
			const response = await fetch(`/api/contacts/${contact.id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				throw new Error("Failed to delete contact");
			}

			toast.success("Contact deleted successfully");
			onOpenChange(false);
			setConfirmationEmail("");
			await mutate(
				(key: string) =>
					typeof key === "string" && key.includes("/api/contacts"),
			);

			onDeleteSuccess?.();
		} catch (error) {
			console.error("Failed to delete contact:", error);
			toast.error("Failed to delete contact");
		} finally {
			setIsDeleting(false);
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
					{!contact && open ? (
						<div className="flex h-[200px] flex-col items-center justify-center space-y-4 p-8 text-center">
							<Icon
								name="loader-2"
								className="h-8 w-8 animate-spin text-text-soft-400"
							/>
							<p className="text-sm text-text-sub-600">
								Loading contact details...
							</p>
						</div>
					) : contact ? (
						<form
							onSubmit={(e) => {
								e.preventDefault();
								if (confirmationEmail === contact.email && !isDeleting) {
									handleDelete();
								}
							}}
						>
							<div className="p-6">
								<div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-error-base/10">
									<Icon name="trash" className="h-4 w-4 text-error-base" />
								</div>

								<h2 className="font-medium text-text-strong-950 text-title-h5">
									Delete contact?
								</h2>
								<p className="mb-6 text-pretty text-sm text-text-sub-600 leading-relaxed">
									This will permanently delete the contact and all associated
									data. This action cannot be undone.
								</p>

								{/* Contact Card */}
								<div className="mb-6 flex items-center gap-3 rounded-2xl border border-stroke-soft-100 bg-bg-weak-50/50 p-4 dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/30">
									<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-error-base/10 text-error-base">
										<Icon name="user" className="h-5 w-5" />
									</div>
									<div className="min-w-0 flex-1">
										<p className="truncate font-medium text-sm text-text-strong-950">
											{contact.email}
										</p>
										<p className="mt-0.5 truncate font-medium text-text-sub-600 text-xs capitalize">
											{contact.status.replace("_", " ")}
										</p>
									</div>
								</div>

								{/* Confirmation Input */}
								<div className="mb-2">
									<p className="mb-2 text-sm text-text-sub-600">
										Type{" "}
										<span className="inline-flex max-w-xs items-center gap-1 truncate rounded-[6px] border border-stroke-soft-100 bg-bg-weak-50/50 px-1.5 py-0.5 font-medium text-text-strong-950 text-xs dark:border-stroke-soft-100/40 dark:bg-bg-strong-200">
											{contact.email}
											<button
												type="button"
												onClick={async () => {
													try {
														await navigator.clipboard.writeText(contact.email);
														setIsEmailCopied(true);
														setTimeout(() => setIsEmailCopied(false), 2000);
													} catch {
														toast.error("Failed to copy email");
													}
												}}
												className="text-text-sub-600 transition-colors hover:text-text-strong-950"
											>
												<Icon
													name={isEmailCopied ? "check" : "copy"}
													className={`h-3 w-3 ${isEmailCopied ? "text-success-base" : ""}`}
												/>
											</button>
										</span>{" "}
										to confirm
									</p>
									<Input.Root size="small" className="rounded-[10px]">
										<Input.Wrapper>
											<Input.Input
												type="text"
												value={confirmationEmail}
												onChange={(e) => setConfirmationEmail(e.target.value)}
												placeholder={contact.email}
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
									disabled={isDeleting}
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
									disabled={isDeleting || confirmationEmail !== contact.email}
								>
									{isDeleting ? (
										"Deleting..."
									) : (
										<>
											Delete contact
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
