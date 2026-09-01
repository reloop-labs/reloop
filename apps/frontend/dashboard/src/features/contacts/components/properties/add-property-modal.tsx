import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
	const [nameError, setNameError] = useState("");
	const [propertyType, setPropertyType] = useState<PropertyType>("string");
	const [defaultValue, setDefaultValue] = useState("");

	const nameInputRef = useRef<HTMLInputElement>(null);

	const handleClose = () => {
		if (status !== "idle") return;
		setPropertyName("");
		setNameError("");
		setPropertyType("string");
		setDefaultValue("");
		setStatus("idle");
		onOpenChange(false);
	};

	useEffect(() => {
		if (!open) {
			const timer = setTimeout(() => {
				setPropertyName("");
				setNameError("");
				setPropertyType("string");
				setDefaultValue("");
				setStatus("idle");
			}, 300);
			return () => clearTimeout(timer);
		}
	}, [open]);

	const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setPropertyName(value);
		setNameError(validatePropertyName(value));
	};

	const handleSlugify = () => {
		const slugged = slugify(propertyName);
		setPropertyName(slugged);
		setNameError(validatePropertyName(slugged));
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
			setNameError(`Please enter a ${nameLabel.toLowerCase()}`);
			nameInputRef.current?.focus();
			return;
		}

		const validationError = validatePropertyName(trimmed);
		if (validationError) {
			setNameError(validationError);
			nameInputRef.current?.focus();
			return;
		}

		if (defaultValueError) {
			return;
		}

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
				setNameError("");
				setPropertyType("string");
				setDefaultValue("");
				setStatus("idle");
				onOpenChange(false);
			}, 450);
		} catch (error) {
			console.error("Failed to create property:", error);
			toast.error(
				error instanceof Error ? error.message : "Failed to create property",
			);
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
								<Input.Root
									size="medium"
									hasError={!!nameError}
									className="rounded-xl"
								>
									<Input.Wrapper>
										<Input.Input
											ref={nameInputRef}
											id="propertyName"
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
								{nameError ? (
									<p className="text-[11px] text-error-base">{nameError}</p>
								) : (
									<p className="text-[11px] text-text-sub-600">
										Letters, numbers &amp; underscores — spaces auto-convert
									</p>
								)}
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
													? "border-primary-base bg-primary-light/10 shadow-[0_0_0_1px_rgba(0,85,255,1)] dark:border-primary-base dark:bg-primary-base/10"
													: "border-stroke-soft-200 bg-bg-white-0 hover:border-stroke-soft-200 hover:bg-bg-weak-50 dark:border-stroke-soft-100/40 dark:bg-bg-soft-200/10 dark:hover:bg-white/[0.04]",
											)}
										>
											<div className="flex w-full items-center justify-between">
												<p className="font-semibold text-text-strong-950 text-xs">
													{opt.label}
												</p>
												<AnimatePresence>
													{isSelected && (
														<motion.div
															initial={{ scale: 0, opacity: 0 }}
															animate={{ scale: 1, opacity: 1 }}
															exit={{ scale: 0, opacity: 0 }}
															transition={{
																type: "spring",
																stiffness: 500,
																damping: 30,
															}}
															className="flex h-4 w-4 items-center justify-center rounded-full bg-primary-base"
														>
															<Icon
																name="check"
																className="h-2.5 w-2.5 text-white"
															/>
														</motion.div>
													)}
												</AnimatePresence>
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
