"use client";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Kbd from "@reloop/ui/kbd";
import * as Modal from "@reloop/ui/modal";
import { useQueryState } from "nuqs";
import { useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";

interface Contact {
	id: string;
	email: string;
	firstName: string | null;
	lastName: string | null;
}

interface DeleteContactModalProps {
	contacts: Contact[];
}

export const DeleteContactModal = ({ contacts }: DeleteContactModalProps) => {
	const [deleteId, setDeleteId] = useQueryState("delete");
	const { mutate } = useSWRConfig();
	const [isDeleting, setIsDeleting] = useState(false);

	const contactToDelete = contacts.find((c) => c.id === deleteId);
	const isOpen = !!deleteId && !!contactToDelete;

	const handleClose = () => {
		setDeleteId(null);
	};

	const handleDelete = async () => {
		if (!deleteId) return;

		setIsDeleting(true);
		try {
			const response = await fetch(`/api/contacts/v1/contacts/${deleteId}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				throw new Error("Failed to delete contact");
			}

			toast.success("Contact deleted successfully");
			handleClose();

			// Refresh the contacts list
			await mutate(
				(key: string) =>
					typeof key === "string" &&
					key.includes("/api/contacts/v1/contacts/list"),
			);
		} catch (error) {
			console.error("Failed to delete contact:", error);
			toast.error("Failed to delete contact");
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<Modal.Root open={isOpen} onOpenChange={(open) => !open && handleClose()}>
			<Modal.Content className="data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-4 data-[state=open]:zoom-in-95 data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-4 data-[state=closed]:zoom-out-95 max-w-lg duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in">
				<Modal.Body>
					<div className="flex flex-col items-center gap-4 py-4">
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-error-lighter">
							<Icon name="delete" className="h-6 w-6 text-error-base" />
						</div>
						<div className="text-center">
							<h2 className="font-semibold text-gray-900 text-xl">
								Delete Contact
							</h2>
							<p className="mt-2 text-paragraph-sm text-text-sub-600">
								Are you sure you want to delete{" "}
								<span className="font-medium text-text-strong-950">
									{contactToDelete?.email}
								</span>
								? This action cannot be undone.
							</p>
						</div>
					</div>
				</Modal.Body>
				<Modal.Footer className="flex items-center justify-end gap-3">
					<Button.Root
						type="button"
						variant="neutral"
						mode="stroke"
						onClick={handleClose}
						disabled={isDeleting}
					>
						Cancel
						<Kbd.Root className="bg-bg-weak-50 text-xs">Esc</Kbd.Root>
					</Button.Root>
					<Button.Root
						type="button"
						variant="error"
						onClick={handleDelete}
						disabled={isDeleting}
					>
						{isDeleting ? (
							<>
								<Icon name="loader-2" className="mr-2 h-4 w-4 animate-spin" />
								Deleting...
							</>
						) : (
							<>
								<Icon name="delete" className="h-4 w-4" />
								Delete Contact
							</>
						)}
					</Button.Root>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	);
};
