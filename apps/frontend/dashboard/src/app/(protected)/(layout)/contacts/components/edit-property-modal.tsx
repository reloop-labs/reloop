"use client";
import * as Badge from "@reloop/ui/badge";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { KbdCommand } from "@reloop/ui/kbd-command";
import { KbdEnter } from "@reloop/ui/kbd-enter";
import { KbdEsc } from "@reloop/ui/kbd-esc";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
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

interface EditPropertyModalProps {
	property: Property | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onEditSuccess?: () => void;
}

const getBadgeColor = (type: string) => {
	switch (type?.toLowerCase()) {
		case "string":
			return "blue";
		case "number":
			return "purple";
		default:
			return "gray";
	}
};

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
			setFallbackValue(property.defaultValue || "");
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
								<Modal.Title className="font-medium">Edit Property</Modal.Title>
							</div>
						</Modal.Header>
						<Modal.Body className="space-y-6">
							{/* Property Info Card */}
							<div className="rounded-xl border border-stroke-soft-100 bg-bg-soft-200/20 p-4 dark:border-stroke-soft-100/30 dark:bg-bg-soft-200/10">
								<div className="flex items-center gap-3">
									<div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-neutral-600 to-neutral-500 shadow-sm">
										<Icon name="tag" className="h-4 w-4 text-white" />
									</div>
									<div className="flex flex-1 items-center justify-between gap-2">
										<p className="font-semibold text-sm text-text-strong-950">
											{property.propertyName}
										</p>
										<div className="flex items-center">
											<Badge.Root
												size="small"
												variant="lighter"
												color={getBadgeColor(property.propertyType)}
												className="h-5 font-medium text-xs capitalize"
											>
												{property.propertyType}
											</Badge.Root>
										</div>
									</div>
								</div>
							</div>

							{/* Fallback Value (Editable) */}
							<div className="space-y-1.5">
								<Label.Root htmlFor="fallback-value">Default Value</Label.Root>
								<Input.Root size="small" className="rounded-xl">
									<Input.Wrapper>
										<Input.Input
											id="fallback-value"
											type="text"
											className="px-2"
											value={fallbackValue}
											onChange={(e) => setFallbackValue(e.target.value)}
											placeholder="e.g. unknown"
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
						<Modal.Footer className="mt-4 flex items-center justify-end gap-3 border-stroke-soft-100/50">
							<Button.Root
								type="button"
								variant="neutral"
								mode="stroke"
								size="xsmall"
								onClick={() => onOpenChange(false)}
								disabled={isSubmitting}
							>
								Cancel
								<KbdEsc />
							</Button.Root>
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
										Update Property
										<span className="inline-flex items-center gap-0.5">
											<KbdCommand />
											<KbdEnter />
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
