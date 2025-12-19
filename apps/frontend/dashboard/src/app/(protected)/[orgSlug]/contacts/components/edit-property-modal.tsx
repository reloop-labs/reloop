"use client";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
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

interface EditPropertyModalProps {
	property: Property | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onEditSuccess?: () => void;
}

export const EditPropertyModal = ({
	property,
	open,
	onOpenChange,
	onEditSuccess,
}: EditPropertyModalProps) => {
	const [fallbackValue, setFallbackValue] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { mutate } = useSWRConfig();

	// Initialize fallback value when modal opens or property changes
	useEffect(() => {
		if (open && property) {
			setFallbackValue(property.fallbackValue || "");
		}
	}, [open, property]);

	// Cmd/Ctrl + Enter to submit
	useHotkeys(
		"mod+enter",
		(e) => {
			e.preventDefault();
			if (open && !isSubmitting && property) {
				handleSubmit();
			}
		},
		{ enableOnFormTags: ["INPUT"] },
	);

	const handleSubmit = async () => {
		if (!property) return;

		try {
			setIsSubmitting(true);
			const response = await fetch(
				`/api/contacts/v1/properties/${property.id}`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						fallbackValue: fallbackValue || null,
					}),
				},
			);

			if (!response.ok) {
				throw new Error("Failed to update property");
			}

			toast.success("Property updated successfully");
			onOpenChange(false);
			await mutate(
				(key: string) =>
					typeof key === "string" &&
					key.includes("/api/contacts/v1/properties"),
			);

			onEditSuccess?.();
		} catch (error) {
			console.error("Failed to update property:", error);
			toast.error("Failed to update property");
		} finally {
			setIsSubmitting(false);
		}
	};

	const _handleCancel = () => {
		onOpenChange(false);
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
							if (!isSubmitting) {
								handleSubmit();
							}
						}}
					>
						<Modal.Header className="before:border-stroke-soft-200/50">
							<div className="flex items-center justify-center">
								<Icon name="edit-2" className="h-4 w-4" />
							</div>
							<div className="flex-1">
								<Modal.Title>Edit Property</Modal.Title>
							</div>
						</Modal.Header>
						<Modal.Body className="space-y-5">
							{/* Property Name (Read-only) */}
							<div className="space-y-1.5">
								<label className="font-medium text-sm text-text-strong-950">
									Property Name
								</label>
								<Input.Root size="small">
									<Input.Wrapper>
										<Input.Input
											type="text"
											className="cursor-not-allowed bg-bg-weak-50 px-2 text-text-sub-600"
											value={property.name}
											disabled
											readOnly
										/>
									</Input.Wrapper>
								</Input.Root>
							</div>

							{/* Property Type (Read-only) */}
							<div className="space-y-1.5">
								<label className="font-medium text-sm text-text-strong-950">
									Property Type
								</label>
								<Input.Root size="small">
									<Input.Wrapper>
										<Input.Input
											type="text"
											className="cursor-not-allowed bg-bg-weak-50 px-2 text-text-sub-600 capitalize"
											value={property.type}
											disabled
											readOnly
										/>
									</Input.Wrapper>
								</Input.Root>
							</div>

							{/* Fallback Value (Editable) */}
							<div className="space-y-1.5">
								<label className="font-medium text-sm text-text-strong-950">
									Default Value
								</label>
								<Input.Root size="small">
									<Input.Wrapper>
										<Input.Input
											type="text"
											className="px-2"
											value={fallbackValue}
											onChange={(e) => setFallbackValue(e.target.value)}
											placeholder="Default value when property is empty"
											disabled={isSubmitting}
										/>
									</Input.Wrapper>
								</Input.Root>
								<p className="text-text-sub-600 text-xs">
									This value will be used when a contact doesn't have this
									property set.
								</p>
							</div>
						</Modal.Body>
						<Modal.Footer className="mt-4 justify-end border-stroke-soft-100/50">
							<Button.Root
								type="submit"
								variant="neutral"
								size="xsmall"
								disabled={isSubmitting}
							>
								{isSubmitting ? (
									<>
										<Spinner size={14} color="currentColor" />
										Updating...
									</>
								) : (
									<>
										Update
										<span className="inline-flex items-center gap-0.5">
											<Icon
												name="enter"
												className="h-4 w-4 rounded-sm border border-stroke-soft-100/20 p-px"
											/>
										</span>
									</>
								)}
							</Button.Root>
						</Modal.Footer>
					</form>
				</div>
			</Modal.Content>
		</Modal.Root>
	);
};
