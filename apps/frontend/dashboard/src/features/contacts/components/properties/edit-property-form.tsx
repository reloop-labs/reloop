import * as Badge from "@reloop/ui/badge";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { KbdCommand } from "@reloop/ui/kbd-command";
import { KbdEnter } from "@reloop/ui/kbd-enter";
import { KbdEsc } from "@reloop/ui/kbd-esc";
import * as Label from "@reloop/ui/label";
import Spinner from "@reloop/ui/spinner";
import { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { useInvalidateContacts } from "#/features/contacts/hooks/use-contacts-query";

export interface EditPropertyFormProperty {
	id: string;
	propertyName: string;
	propertyType: string;
	defaultValue: string | null;
}

interface EditPropertyFormProps {
	property: EditPropertyFormProperty;
	onCancel: () => void;
	onSuccess?: () => void;
	variant?: "modal" | "inline";
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

export function EditPropertyForm({
	property,
	onCancel,
	onSuccess,
	variant = "modal",
}: EditPropertyFormProps) {
	const [fallbackValue, setFallbackValue] = useState(
		property.defaultValue || "",
	);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const invalidate = useInvalidateContacts();
	const isInline = variant === "inline";

	useEffect(() => {
		setFallbackValue(property.defaultValue || "");
	}, [property]);

	const fallbackValueError =
		property.propertyType?.toLowerCase() === "number" &&
		fallbackValue !== "" &&
		!/^-?\d+(?:\.\d+)?$/.test(fallbackValue.trim())
			? "Must be a valid number"
			: "";

	useHotkeys(
		"mod+enter",
		(e) => {
			e.preventDefault();
			if (!isSubmitting && !fallbackValueError) {
				void handleSubmit();
			}
		},
		{ enableOnFormTags: ["INPUT"] },
		[isSubmitting, fallbackValue, fallbackValueError],
	);

	useHotkeys(
		"escape",
		(e) => {
			e.preventDefault();
			if (!isSubmitting) onCancel();
		},
		{ enableOnFormTags: true },
	);

	const handleSubmit = async () => {
		if (fallbackValueError) return;

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
			await invalidate();
			onSuccess?.();
		} catch (error) {
			console.error("Failed to update property:", error);
			toast.error("Failed to update property");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleFallbackChange = (val: string) => {
		if (property.propertyType?.toLowerCase() === "number") {
			if (val === "" || /^-?\d*\.?\d*$/.test(val)) {
				setFallbackValue(val);
			}
		} else {
			setFallbackValue(val);
		}
	};

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				if (!isSubmitting) {
					void handleSubmit();
				}
			}}
			onClick={(e) => e.stopPropagation()}
			className={isInline ? "flex flex-col gap-4" : "flex flex-col"}
		>
			{!isInline && (
				<div className="mb-6 rounded-xl border border-stroke-soft-100 bg-bg-soft-200/20 p-4 dark:border-stroke-soft-100/30 dark:bg-bg-soft-200/10">
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
									className="h-5 rounded-md px-1.5 font-medium text-xs capitalize"
								>
									{property.propertyType}
								</Badge.Root>
							</div>
						</div>
					</div>
				</div>
			)}

			<div className={isInline ? "max-w-md space-y-1.5" : "mb-4 space-y-1.5"}>
				<Label.Root htmlFor={`fallback-value-${property.id}`}>
					Default Value
				</Label.Root>
				<Input.Root
					size="small"
					className="rounded-xl"
					hasError={!!fallbackValueError}
				>
					<Input.Wrapper>
						<Input.Input
							id={`fallback-value-${property.id}`}
							type="text"
							className="px-2"
							value={fallbackValue}
							onChange={(e) => handleFallbackChange(e.target.value)}
							placeholder="e.g. unknown"
							disabled={isSubmitting}
						/>
					</Input.Wrapper>
				</Input.Root>
				{fallbackValueError ? (
					<p className="text-error-base text-xs">{fallbackValueError}</p>
				) : (
					<p className="text-text-sub-600 text-xs">
						This value will be used when a contact doesn&apos;t have this
						property set.
					</p>
				)}
			</div>

			<div
				className={
					isInline
						? "flex items-center justify-end gap-3"
						: "mt-4 flex items-center justify-end gap-3"
				}
			>
				<Button.Root
					type="button"
					variant="neutral"
					mode="stroke"
					size="xsmall"
					onClick={onCancel}
					disabled={isSubmitting}
				>
					Cancel
					<KbdEsc />
				</Button.Root>
				<Button.Root
					type="submit"
					variant="neutral"
					size="xsmall"
					disabled={isSubmitting || !!fallbackValueError}
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
			</div>
		</form>
	);
}
