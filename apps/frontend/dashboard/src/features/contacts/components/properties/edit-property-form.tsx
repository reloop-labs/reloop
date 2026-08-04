import * as Badge from "@reloop/ui/badge";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import Spinner from "@reloop/ui/spinner";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { useInvalidateContacts } from "#/features/contacts/hooks/use-contacts-query";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";

/** Light keycap so it reads on the blue FancyButton fill. */
const actionKbdOnBlueClassName =
	"border-white/25 bg-white/15 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]";

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
	const [status, setStatus] = useState<"idle" | "submitting" | "success">(
		"idle",
	);
	const invalidate = useInvalidateContacts();
	const isInline = variant === "inline";

	useEffect(() => {
		setFallbackValue(property.defaultValue || "");
		setStatus("idle");
	}, [property]);

	const fallbackValueError =
		property.propertyType?.toLowerCase() === "number" &&
		fallbackValue !== "" &&
		!/^-?\d+(?:\.\d+)?$/.test(fallbackValue.trim())
			? "Must be a valid number"
			: "";

	const canSubmit =
		!fallbackValueError &&
		status === "idle" &&
		fallbackValue !== (property.defaultValue || "");

	const handleSubmit = async (e?: React.FormEvent) => {
		e?.preventDefault();
		if (!canSubmit || status !== "idle") return;

		try {
			setStatus("submitting");
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

			setStatus("success");
			setTimeout(() => {
				void invalidate();
				onSuccess?.();
			}, 750);
		} catch (error) {
			console.error("Failed to update property:", error);
			toast.error("Failed to update property");
			setStatus("idle");
		}
	};

	useHotkeys(
		"enter",
		(e) => {
			e.preventDefault();
			if (canSubmit) {
				void handleSubmit();
			}
		},
		{ enableOnFormTags: ["INPUT"] },
		[canSubmit, fallbackValue, property],
	);

	useHotkeys(
		"escape",
		() => {
			if (status === "idle") onCancel();
		},
		{ enableOnFormTags: ["INPUT"] },
		[status, onCancel],
	);

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
			onSubmit={handleSubmit}
			onClick={(e) => e.stopPropagation()}
			className="w-full font-sans"
		>
			{/* Table inline: nested gray/white card. Modal: flat. */}
			<div
				className={cn(
					isInline &&
						"overflow-hidden rounded-[18px] border border-stroke-soft-200 bg-bg-soft-50",
				)}
			>
				<div
					className={cn(
						"space-y-4",
						isInline &&
							"m-0.5 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 px-6 pt-5 pb-6",
					)}
				>
					{/* Readonly Property Name */}
					<div className="space-y-2">
						<div className="flex items-center gap-1.5">
							<Label.Root htmlFor={`property-name-${property.id}`}>
								Name
							</Label.Root>
							<span className="font-normal text-text-sub-600 text-xs">
								(Property name cannot be edited after creation)
							</span>
						</div>
						<Input.Root
							size="medium"
							className="rounded-xl border border-stroke-soft-100 bg-bg-weak-50/50 dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/30"
						>
							<Input.Wrapper>
								<Input.Icon
									as={Icon}
									name="tag"
									size="small"
									className="h-4 w-4 text-text-sub-600"
								/>
								<Input.Input
									id={`property-name-${property.id}`}
									type="text"
									value={property.propertyName}
									readOnly
									className="cursor-not-allowed font-medium text-text-strong-950 opacity-100 focus:outline-none"
								/>
								<Icon
									name="lock"
									className="mr-1.5 h-3.5 w-3.5 shrink-0 text-text-sub-600"
								/>
							</Input.Wrapper>
						</Input.Root>
					</div>

					{/* Default Value */}
					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<Label.Root htmlFor={`fallback-value-${property.id}`}>
								Default Value
							</Label.Root>
							<Badge.Root
								size="small"
								variant="lighter"
								color={getBadgeColor(property.propertyType)}
								className="h-5 rounded-md px-1.5 font-medium text-xs capitalize"
							>
								{property.propertyType}
							</Badge.Root>
						</div>
						<Input.Root
							size="medium"
							className="rounded-xl"
							hasError={!!fallbackValueError}
						>
							<Input.Wrapper>
								<Input.Input
									id={`fallback-value-${property.id}`}
									type="text"
									value={fallbackValue}
									onChange={(e) => handleFallbackChange(e.target.value)}
									placeholder={
										property.propertyType?.toLowerCase() === "number"
											? "e.g., 0"
											: "e.g., unknown"
									}
									disabled={status !== "idle"}
									autoFocus={isInline}
								/>
							</Input.Wrapper>
						</Input.Root>
						{fallbackValueError ? (
							<p className="text-error-base text-paragraph-xs">
								{fallbackValueError}
							</p>
						) : (
							<p className="text-paragraph-xs text-text-sub-600">
								Used when a contact doesn&apos;t have this property set
							</p>
						)}
					</div>
				</div>

				{/* Actions / Footer */}
				<div
					className={cn(
						"flex items-center justify-end gap-3",
						isInline ? "px-6 pt-3 pb-3.5 dark:bg-bg-weak-50/40" : "mt-6",
					)}
				>
					<Button.Root
						type="button"
						variant="neutral"
						mode="stroke"
						size="small"
						onClick={onCancel}
						disabled={status !== "idle"}
						className={cn(
							"gap-1.5 transition-opacity duration-200",
							status !== "idle" && "pointer-events-none opacity-50",
						)}
					>
						Cancel
						<ActionKbd className="lowercase! w-auto min-w-0 px-1">
							esc
						</ActionKbd>
					</Button.Root>
					<FancyButton.Root
						type="submit"
						variant={status === "success" ? "success" : "blue"}
						size="small"
						disabled={!canSubmit}
						className={cn(
							"min-w-[172px] justify-center overflow-hidden transition-all duration-200",
							status !== "idle" && "pointer-events-none",
							status === "submitting" && "opacity-90",
						)}
					>
						<AnimatePresence mode="popLayout" initial={false}>
							<motion.span
								key={status}
								transition={{
									type: "spring",
									duration: 0.25,
									bounce: 0,
								}}
								initial={{ opacity: 0, y: -14 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: 14 }}
								className="flex items-center justify-center gap-1.5"
							>
								{status === "submitting" ? (
									<>
										<Spinner size={14} color="currentColor" />
										<span>Updating...</span>
									</>
								) : status === "success" ? (
									<>
										<Icon name="check-circle" className="h-4 w-4" />
										<span>Property updated</span>
									</>
								) : (
									<>
										Save changes
										<ActionKbd className={actionKbdOnBlueClassName}>
											↵
										</ActionKbd>
									</>
								)}
							</motion.span>
						</AnimatePresence>
					</FancyButton.Root>
				</div>
			</div>
		</form>
	);
}
