import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { FieldError, useFieldError } from "@reloop/ui/field-error";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { useInvalidateContacts } from "#/features/contacts/hooks/use-contacts-query";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";

/** Light keycap so it reads on the blue FancyButton fill. */
const actionKbdOnBlueClassName =
	"border-white/25 bg-white/15 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]";

interface AddPropertyModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: (created: {
		name: string;
		type: PropertyType;
		defaultValue?: string;
	}) => void;
	title?: string;
	submitLabel?: string;
	nameLabel?: string;
}

type PropertyType = "string" | "number";

const TYPE_OPTIONS: {
	value: PropertyType;
	label: string;
	description: string;
}[] = [
	{
		value: "string",
		label: "String",
		description: "Free-form text",
	},
	{
		value: "number",
		label: "Number",
		description: "Integer or decimal",
	},
];

const slugify = (value: string) =>
	value
		.toLowerCase()
		.replace(/\s+/g, "_")
		.replace(/[^a-z0-9_]/g, "");

const validatePropertyName = (name: string): string => {
	if (!name) return "";
	if (!/^[a-zA-Z0-9_]*$/.test(name))
		return "Only letters, numbers, and underscores";
	if (!/^[a-zA-Z_]/.test(name)) return "Must start with a letter or underscore";
	return "";
};

export const AddPropertyModal = ({
	open,
	onOpenChange,
	onSuccess,
	title = "Add property",
	submitLabel = "Add property",
	nameLabel = "Property name",
}: AddPropertyModalProps) => {
	const invalidate = useInvalidateContacts();
	const [status, setStatus] = useState<"idle" | "creating" | "success">("idle");
	const [propertyName, setPropertyName] = useState("");
	const [propertyType, setPropertyType] = useState<PropertyType>("string");
	const [defaultValue, setDefaultValue] = useState("");
	const nameField = useFieldError();
	const clearNameError = nameField.clear;

	const handleClose = () => {
		if (status !== "idle") return;
		setPropertyName("");
		nameField.clear();
		setPropertyType("string");
		setDefaultValue("");
		setStatus("idle");
		onOpenChange(false);
	};

	useEffect(() => {
		if (!open) {
			const timer = setTimeout(() => {
				setPropertyName("");
				clearNameError();
				setPropertyType("string");
				setDefaultValue("");
				setStatus("idle");
			}, 300);
			return () => clearTimeout(timer);
		}
	}, [open, clearNameError]);

	const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setPropertyName(value);
		if (nameField.hasError) nameField.clear();
	};

	const handleSlugify = () => {
		const slugged = slugify(propertyName);
		setPropertyName(slugged);
	};

	const defaultValueError =
		propertyType === "number" &&
		defaultValue !== "" &&
		!/^-?\d+(?:\.\d+)?$/.test(defaultValue.trim())
			? "Must be a valid number"
			: "";

	const handleSubmit = async (e?: React.FormEvent) => {
		e?.preventDefault();
		if (status !== "idle") return;

		const trimmed = propertyName.trim();
		if (!trimmed) {
			nameField.show(`Please enter a ${nameLabel.toLowerCase()}.`);
			return;
		}

		const validationError = validatePropertyName(trimmed);
		if (validationError) {
			nameField.show(validationError);
			return;
		}

		if (defaultValueError) {
			return;
		}

		nameField.clear();
		setStatus("creating");
		try {
			const response = await fetch("/api/contacts/v1/properties/create", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: trimmed,
					type: propertyType,
					fallbackValue: defaultValue.trim() || undefined,
				}),
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.message || "Failed to create property");
			}

			const createdPayload = {
				name: trimmed,
				type: propertyType,
				defaultValue: defaultValue.trim() || undefined,
			};

			setStatus("success");
			setTimeout(() => {
				void invalidate();
				onSuccess?.(createdPayload);
				setPropertyName("");
				nameField.clear();
				setPropertyType("string");
				setDefaultValue("");
				setStatus("idle");
				onOpenChange(false);
			}, 450);
		} catch (error) {
			console.error("Failed to create property:", error);
			const message =
				error instanceof Error ? error.message : "Failed to create property";
			nameField.show(message);
			toast.error(message);
			setStatus("idle");
		}
	};

	useHotkeys(
		"enter",
		(e) => {
			e.preventDefault();
			if (open && status === "idle") {
				void handleSubmit();
			}
		},
		{ enableOnFormTags: ["INPUT"], enabled: open },
		[open, status, propertyName, propertyType, defaultValue, nameLabel],
	);

	useHotkeys(
		"escape",
		() => {
			if (open && status === "idle") {
				handleClose();
			}
		},
		{ enableOnFormTags: ["INPUT"], enabled: open },
		[open, status],
	);

	return (
		<Modal.Root open={open} onOpenChange={(o) => !o && handleClose()}>
			<Modal.Content
				className="overflow-hidden rounded-[18px] border border-stroke-soft-200 bg-bg-soft-50 p-0 sm:max-w-[460px] dark:border-stroke-soft-100/40 dark:bg-white/[0.03]"
				showClose={false}
			>
				<form onSubmit={handleSubmit} noValidate>
					<div className="relative m-0.5 space-y-4 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 pt-5 dark:border-stroke-soft-100/40 dark:bg-[#0c0c0c]">
						{/* Header */}
						<div className="flex items-start justify-between px-6 dark:border-stroke-soft-100/40">
							<Modal.Title className="font-medium text-text-strong-950 text-xl tracking-tight">
								{title}
							</Modal.Title>
							<button
								type="button"
								onClick={handleClose}
								aria-label="Close"
								disabled={status !== "idle"}
								className="flex h-7 w-7 items-center justify-center rounded-lg bg-bg-white-0 text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 active:scale-[0.95] disabled:opacity-50 dark:border-stroke-soft-100/40 dark:bg-transparent dark:hover:bg-white/[0.05]"
							>
								<X className="size-3.5" strokeWidth={2.25} />
							</button>
						</div>

						{/* Form Content */}
						<div className="space-y-4 px-6 pb-6">
							{/* Property Name */}
							<div className="space-y-1.5">
								<Label.Root
									htmlFor="propertyName"
									className="font-medium text-text-strong-950 text-xs"
								>
									{nameLabel}
									<Label.Asterisk />
								</Label.Root>
								<FieldError
									field={nameField}
									hint="Letters, numbers &amp; underscores — spaces auto-convert"
								>
									<Input.Root
										size="medium"
										hasError={nameField.hasError}
										className="rounded-xl"
									>
										<Input.Wrapper>
											<Input.Input
												id="propertyName"
												{...nameField.controlProps}
												placeholder="first_name"
												value={propertyName}
												onChange={handleNameChange}
												onBlur={handleSlugify}
												disabled={status !== "idle"}
												autoComplete="off"
												spellCheck={false}
												autoFocus
											/>
										</Input.Wrapper>
									</Input.Root>
								</FieldError>
							</div>

							{/* Property Type Selector */}
							<div className="grid grid-cols-2 gap-2.5">
								{TYPE_OPTIONS.map((opt) => {
									const isSelected = propertyType === opt.value;
									return (
										<button
											key={opt.value}
											type="button"
											onClick={() => setPropertyType(opt.value)}
											disabled={status !== "idle"}
											className={cn(
												"group relative flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all duration-150 active:scale-[0.98]",
												isSelected
													? "border-primary-base shadow-[0_0_0_1px_#0055FF] bg-bg-white-0 dark:border-primary-base dark:shadow-[0_0_0_1px_#0055FF] dark:bg-white/[0.04]"
													: "border-stroke-soft-200 bg-bg-white-0 hover:border-stroke-sub-300 hover:bg-bg-weak-50/50 dark:border-stroke-soft-100/40 dark:bg-bg-soft-200/10 dark:hover:bg-white/[0.02]",
											)}
										>
											<div className="flex w-full items-center justify-between">
												<p className="font-medium text-text-strong-950 text-xs">
													{opt.label}
												</p>
												{isSelected ? (
													<div className="flex size-4.5 items-center justify-center rounded-full bg-primary-base">
														<div className="size-1.5 rounded-full bg-white" />
													</div>
												) : (
													<div className="size-4.5 rounded-full border-2 border-stroke-soft-200 transition-colors group-hover:border-stroke-sub-300 dark:border-stroke-soft-100/60" />
												)}
											</div>
											<p className="text-[11px] text-text-sub-600">
												{opt.description}
											</p>
										</button>
									);
								})}
							</div>

							{/* Default Value */}
							<div className="space-y-1.5">
								<Label.Root
									htmlFor="defaultValue"
									className="font-medium text-text-strong-950 text-xs"
								>
									Default Value
								</Label.Root>
								<Input.Root
									size="medium"
									className="rounded-xl"
									hasError={!!defaultValueError}
								>
									<Input.Wrapper>
										<Input.Input
											id="defaultValue"
											placeholder={propertyType === "number" ? "0" : "unknown"}
											value={defaultValue}
											onChange={(e) => {
												const val = e.target.value;
												if (propertyType === "number") {
													if (val === "" || /^-?\d*\.?\d*$/.test(val)) {
														setDefaultValue(val);
													}
												} else {
													setDefaultValue(val);
												}
											}}
											disabled={status !== "idle"}
											inputMode={propertyType === "number" ? "numeric" : "text"}
										/>
									</Input.Wrapper>
								</Input.Root>
								{defaultValueError ? (
									<p className="text-[11px] text-error-base">
										{defaultValueError}
									</p>
								) : (
									<p className="text-[11px] text-text-sub-600">
										Used when a contact doesn&apos;t have this property set
									</p>
								)}
							</div>
						</div>
					</div>

					{/* Actions / Footer */}
					<div className="relative flex items-center justify-between gap-3 px-3 pt-2 pb-3">
						<Button.Root
							type="button"
							variant="neutral"
							mode="ghost"
							size="small"
							onClick={handleClose}
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
							disabled={status !== "idle"}
							className={cn(
								"min-w-[156px] justify-center overflow-hidden transition-all duration-200",
								status !== "idle" && "pointer-events-none",
								status === "creating" && "opacity-90",
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
									{status === "creating" ? (
										<>
											<Spinner size={14} color="currentColor" />
											<span>Creating...</span>
										</>
									) : status === "success" ? (
										<>
											<Icon name="check-circle" className="h-4 w-4" />
											<span>Created</span>
										</>
									) : (
										<>
											{submitLabel}
											<ActionKbd className={actionKbdOnBlueClassName}>
												↵
											</ActionKbd>
										</>
									)}
								</motion.span>
							</AnimatePresence>
						</FancyButton.Root>
					</div>
				</form>
			</Modal.Content>
		</Modal.Root>
	);
};
