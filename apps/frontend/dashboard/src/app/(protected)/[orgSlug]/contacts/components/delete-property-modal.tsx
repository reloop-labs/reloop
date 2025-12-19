"use client";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Kbd from "@reloop/ui/kbd";
import * as Modal from "@reloop/ui/modal";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";

interface Property {
	id: string;
	name: string;
	type: string;
	fallbackValue: string | null;
	organizationId: string;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
}

interface DeletePropertyModalProps {
	property: Property | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onDeleteSuccess?: () => void;
}

export const DeletePropertyModal = ({
	property,
	open,
	onOpenChange,
	onDeleteSuccess,
}: DeletePropertyModalProps) => {
	const [confirmationName, setConfirmationName] = useState("");
	const [isDeleting, setIsDeleting] = useState(false);
	const [isNameCopied, setIsNameCopied] = useState(false);
	const { mutate } = useSWRConfig();

	// Reset confirmation when modal closes or property changes
	useEffect(() => {
		if (!open) {
			setConfirmationName("");
		}
	}, [open]);

	const handleDelete = async () => {
		if (!property) return;

		if (confirmationName !== property.name) {
			toast.error("Please enter the correct property name to confirm deletion");
			return;
		}

		try {
			setIsDeleting(true);
			const response = await fetch(
				`/api/contacts/v1/properties/${property.id}`,
				{
					method: "DELETE",
				},
			);

			if (!response.ok) {
				throw new Error("Failed to delete property");
			}

			toast.success("Property deleted successfully");
			onOpenChange(false);
			setConfirmationName("");
			await mutate(
				(key: string) =>
					typeof key === "string" &&
					key.includes("/api/contacts/v1/properties"),
			);

			onDeleteSuccess?.();
		} catch (error) {
			console.error("Failed to delete property:", error);
			toast.error("Failed to delete property");
		} finally {
			setIsDeleting(false);
		}
	};

	const handleCancel = () => {
		onOpenChange(false);
		setConfirmationName("");
	};

	if (!property) return null;

	return (
		<Modal.Root open={open} onOpenChange={onOpenChange}>
			<Modal.Content
				className="rounded-2xl border border-stroke-soft-100/50 p-0.5 sm:max-w-[480px]"
				showClose={true}
			>
				<div className="rounded-2xl border border-stroke-soft-100/50">
					<form
						onSubmit={(e) => {
							e.preventDefault();
							if (confirmationName === property.name && !isDeleting) {
								handleDelete();
							}
						}}
					>
						<Modal.Header className="before:border-stroke-soft-200/50">
							<div className="flex-1">
								<Modal.Title>Delete Property</Modal.Title>
							</div>
						</Modal.Header>
						<Modal.Body className="space-y-4">
							<div>
								<p className="text-sm text-text-sub-600">
									Are you sure you want to delete this property?
								</p>
								<p className="font-medium text-error-base text-sm">
									This action cannot be undone.
								</p>
							</div>

							<div className="space-y-2">
								<p className="text-sm text-text-strong-950">
									Type{" "}
									<span className="inline-flex max-w-xs items-center gap-1 truncate rounded-md border border-stroke-soft-200 bg-bg-weak-50 px-2 py-1 font-mono text-text-strong-950 text-xs">
										{property.name}
										<button
											type="button"
											onClick={async () => {
												try {
													await navigator.clipboard.writeText(property.name);
													setIsNameCopied(true);
													setTimeout(() => setIsNameCopied(false), 2000);
												} catch {
													toast.error("Failed to copy property name");
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
											placeholder="Enter property name"
										/>
									</Input.Wrapper>
								</Input.Root>
							</div>
						</Modal.Body>
						<Modal.Footer className="mt-4 justify-end gap-2 border-stroke-soft-100/50">
							<Button.Root
								type="button"
								variant="neutral"
								mode="stroke"
								size="xsmall"
								onClick={handleCancel}
								disabled={isDeleting}
							>
								Cancel
								<Kbd.Root className="bg-bg-weak-50 text-xs">Esc</Kbd.Root>
							</Button.Root>
							<Button.Root
								type="submit"
								variant="error"
								size="xsmall"
								disabled={confirmationName !== property.name || isDeleting}
							>
								{isDeleting ? (
									<>
										<Icon name="loader-2" className="h-4 w-4 animate-spin" />
										Deleting...
									</>
								) : (
									"Delete Property"
								)}
							</Button.Root>
						</Modal.Footer>
					</form>
				</div>
			</Modal.Content>
		</Modal.Root>
	);
};
