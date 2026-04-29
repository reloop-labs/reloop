"use client";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { KbdEsc } from "@reloop/ui/kbd-esc";
import * as Modal from "@reloop/ui/modal";
import { useEffect, useState } from "react";
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
			setConfirmationEmail("");
		}
	}, [open]);

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
		setConfirmationEmail("");
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
							<Modal.Title>Delete Contact</Modal.Title>
						</div>
					</Modal.Header>
					{!contact && open ? (
						<div className="flex h-[200px] flex-col items-center justify-center space-y-4 p-8 text-center">
							<Icon
								name="loader-2"
								className="h-8 w-8 animate-spin text-text-sub-600"
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
							<Modal.Body className="space-y-4">
								<div>
									<p className="text-sm text-text-sub-600">
										Are you sure you want to delete this contact?
									</p>
									<p className="font-medium text-error-base text-sm">
										This action cannot be undone.
									</p>
								</div>

								<div className="space-y-2">
									<p className="text-sm text-text-strong-950">
										Type{" "}
										<span className="inline-flex max-w-xs items-center gap-1 truncate rounded-md border border-stroke-soft-100 bg-bg-weak-50/50 px-2 py-1 font-mono text-text-strong-950 text-xs">
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
										to confirm.
									</p>
									<Input.Root size="small">
										<Input.Wrapper>
											<Input.Input
												type="text"
												className="px-2"
												value={confirmationEmail}
												onChange={(e) => setConfirmationEmail(e.target.value)}
												placeholder="Enter contact email"
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
									disabled={isDeleting}
								>
									Cancel
									<KbdEsc />
								</Button.Root>
								<Button.Root
									type="submit"
									variant="error"
									size="xsmall"
									disabled={confirmationEmail !== contact.email || isDeleting}
								>
									{isDeleting ? (
										<>
											<Icon name="loader-2" className="h-4 w-4 animate-spin" />
											Deleting...
										</>
									) : (
										"Delete Contact"
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
