"use client";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Modal from "@reloop/ui/modal";
import { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { useSWRConfig } from "swr";

interface Property {
	id: string;
	propertyName: string;
	propertyType: string;
	defaultValue: string | null;
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
			const timer = setTimeout(() => {
				setConfirmationName("");
			}, 300);
			return () => clearTimeout(timer);
		}
	}, [open]);

	useHotkeys(
		"mod+enter",
		(e) => {
			e.preventDefault();
			if (open && confirmationName === property?.propertyName && !isDeleting) {
				handleDelete();
			}
		},
		{ enableOnFormTags: ["INPUT"], enabled: open && !!property },
		[open, confirmationName, property, isDeleting],
	);

	const handleDelete = async () => {
		if (!property) return;

		if (confirmationName !== property.propertyName) {
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
					typeof key === "string" && key.includes("/api/contacts/v1/properties"),
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
	};

	return (
		<Modal.Root open={open} onOpenChange={onOpenChange}>
			<Modal.Content
				className="rounded-20 border-none p-0 sm:max-w-[480px]"
				showClose={true}
			>
				<div className="rounded-20 border border-stroke-soft-100/50 bg-bg-white-0">
					{!property && open ? (
						<div className="flex h-[200px] flex-col items-center justify-center space-y-4 p-8 text-center">
							<Icon
								name="loader-2"
								className="h-8 w-8 animate-spin text-text-sub-600"
							/>
							<p className="text-sm text-text-sub-600">
								Loading property details...
							</p>
						</div>
					) : property ? (
						<form
							onSubmit={(e) => {
								e.preventDefault();
								if (confirmationName === property.propertyName && !isDeleting) {
									handleDelete();
								}
							}}
						>
							<div className="p-6">
								<div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-error-base/10">
									<Icon name="trash" className="h-4 w-4 text-error-base" />
								</div>

								<h2 className="font-medium text-text-strong-950 text-title-h5">
									Delete property?
								</h2>
								<p className="mb-6 text-pretty text-sm text-text-sub-600 leading-relaxed">
									This will permanently delete the property. The property and
									its values will be{" "}
									<span className="font-semibold text-text-strong-950">
										removed from all contacts
									</span>
									. This action cannot be undone.
								</p>

								{/* Property Info Card */}
								<div className="mb-6 flex items-center gap-3 rounded-2xl border border-stroke-soft-100 bg-bg-weak-50/50 p-4 dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/30">
									<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-error-base/10 text-error-base">
										<Icon name="tag" className="h-5 w-5" />
									</div>
									<div className="min-w-0 flex-1">
										<p className="truncate font-medium text-sm text-text-strong-950">
											{property.propertyName}
										</p>
										<p className="mt-0.5 truncate font-medium text-text-sub-600 text-xs">
											{property.propertyType} property
										</p>
									</div>
								</div>

								{/* Confirmation Input */}
								<div className="mb-2">
									<p className="mb-2 text-sm text-text-sub-600">
										Type{" "}
										<span className="inline-flex max-w-xs items-center gap-1 truncate rounded-[6px] border border-stroke-soft-100 bg-bg-weak-50/50 px-1.5 py-0.5 font-medium text-text-strong-950 text-xs dark:border-stroke-soft-100/40 dark:bg-bg-strong-200">
											{property.propertyName}
											<button
												type="button"
												onClick={async () => {
													try {
														await navigator.clipboard.writeText(
															property.propertyName,
														);
														setIsNameCopied(true);
														setTimeout(() => setIsNameCopied(false), 2000);
													} catch {
														toast.error("Failed to copy property name");
													}
												}}
												className="text-text-soft-400 transition-colors hover:text-text-strong-950"
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
												placeholder={property.propertyName}
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
									disabled={
										isDeleting || confirmationName !== property.propertyName
									}
								>
									{isDeleting ? (
										"Deleting..."
									) : (
										<>
											Delete property
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
