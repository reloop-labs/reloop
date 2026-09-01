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
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";

/** Light keycap so it reads on the blue FancyButton fill. */
const actionKbdOnBlueClassName =
	"border-white/25 bg-white/15 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]";

type PropertyType = "string" | "number";

const TYPE_OPTIONS: {
	value: PropertyType;
	label: string;
	description: string;
}[] = [
	{
		value: "string",
		label: "String",
		description: "Free-form text, names, or custom strings.",
	},
	{
		value: "number",
		label: "Number",
		description: "Integers, decimals, or numeric counts.",
	},
];

const slugify = (value: string) =>
	value
		.toLowerCase()
		.replace(/\s+/g, "_")
		.replace(/[^a-z0-9_]/g, "");

const validateVariableName = (name: string): string => {
	if (!name) return "";
	if (!/^[a-zA-Z0-9_]*$/.test(name))
		return "Only letters, numbers, and underscores";
	if (!/^[a-zA-Z_]/.test(name)) return "Must start with a letter or underscore";
	return "";
};

interface AddTemplateVariableModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onAdd: (
		name: string,
		type: "string" | "number",
		defaultValue: string | null,
	) => Promise<void>;
	isSubmitting: boolean;
	title?: string;
	submitLabel?: string;
	nameLabel?: string;
}

export const AddTemplateVariableModal = ({
	open,
	onOpenChange,
	onAdd,
	isSubmitting: _externalSubmitting,
	title = "Create variable",
	submitLabel = "Create variable",
	nameLabel = "Variable name",
}: AddTemplateVariableModalProps) => {
	const [status, setStatus] = useState<"idle" | "creating" | "success">("idle");
	const [variableName, setVariableName] = useState("");
	const [variableType, setVariableType] = useState<PropertyType>("string");
	const [defaultValue, setDefaultValue] = useState("");
	const nameField = useFieldError();
	const clearNameError = nameField.clear;

	const handleClose = () => {
		if (status !== "idle") return;
		setVariableName("");
		nameField.clear();
		setVariableType("string");
		setDefaultValue("");
		setStatus("idle");
		onOpenChange(false);
	};

	useEffect(() => {
		if (!open) {
			const timer = setTimeout(() => {
				setVariableName("");
				clearNameError();
				setVariableType("string");
				setDefaultValue("");
				setStatus("idle");
			}, 300);
			return () => clearTimeout(timer);
		}
	}, [open, clearNameError]);

	const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setVariableName(value);
		if (nameField.hasError) nameField.clear();
	};

	const handleSlugify = () => {
		const slugged = slugify(variableName);
		setVariableName(slugged);
	};

	const defaultValueError =
		variableType === "number" &&
		defaultValue !== "" &&
		!/^-?\d+(?:\.\d+)?$/.test(defaultValue.trim())
			? "Must be a valid number"
			: "";

	const handleSubmit = async (e?: React.FormEvent) => {
		e?.preventDefault();
		if (status !== "idle") return;

		const trimmed = variableName.trim();
		if (!trimmed) {
			nameField.show(`Please enter a ${nameLabel.toLowerCase()}.`);
			return;
		}

		const validationError = validateVariableName(trimmed);
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
			await onAdd(trimmed, variableType, defaultValue.trim() || null);
			setStatus("success");
			setTimeout(() => {
				setVariableName("");
				nameField.clear();
				setVariableType("string");
				setDefaultValue("");
				setStatus("idle");
				onOpenChange(false);
			}, 450);
		} catch (error) {
			console.error("Failed to create variable:", error);
			const message =
				error instanceof Error ? error.message : "Failed to create variable";
			nameField.show(message);
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
		[open, status, variableName, variableType, defaultValue, nameLabel],
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
					<div className="relative m-0.5 space-y-5 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 pt-5 dark:border-stroke-soft-100/40 dark:bg-[#0c0c0c]">
						{/* Header */}
						<div className="flex items-center justify-between px-6 dark:border-stroke-soft-100/40">
							<div className="flex items-center gap-2">
								<Icon
									name="variable"
									className="size-4.5 text-text-strong-950 dark:text-white"
								/>
								<Modal.Title className="font-medium text-text-strong-950 text-xl tracking-tight dark:text-white">
									{title}
								</Modal.Title>
							</div>
							<button
								type="button"
								onClick={handleClose}
								aria-label="Close"
								disabled={status !== "idle"}
								className="flex h-7 w-7 items-center justify-center rounded-lg bg-bg-white-0 text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 active:scale-[0.95] disabled:opacity-50 dark:border-stroke-soft-100/40 dark:bg-transparent dark:hover:bg-white/[0.05] dark:hover:text-white"
							>
								<X className="size-3.5" strokeWidth={2.25} />
							</button>
						</div>

						{/* Form Content */}
						<div className="space-y-6 px-6 pb-6">
							{/* Variable Name */}
							<div className="space-y-1.5">
								<Label.Root
									htmlFor="templateVariableName"
									className="font-medium text-text-strong-950 text-xs dark:text-white"
								>
									{nameLabel}
									<Label.Asterisk />
								</Label.Root>
								<FieldError
									field={nameField}
									hint="Letters, numbers, and underscores only — spaces auto-convert"
								>
									<Input.Root
										size="medium"
										hasError={nameField.hasError}
										className="rounded-xl"
									>
										<Input.Wrapper>
											<Input.InlineAffix className="font-mono text-text-sub-600 text-xs focus:text-text-strong-950!">
												{"{{{"}
											</Input.InlineAffix>
											<Input.Input
												id="templateVariableName"
												{...nameField.controlProps}
												placeholder="variable_name"
												value={variableName}
												onChange={handleNameChange}
												onBlur={handleSlugify}
												disabled={status !== "idle"}
												autoComplete="off"
												spellCheck={false}
												autoFocus
											/>
											<Input.InlineAffix className="font-mono text-text-sub-600 text-xs focus:text-text-strong-950!">
												{"}}}"}
											</Input.InlineAffix>
										</Input.Wrapper>
									</Input.Root>
								</FieldError>
							</div>

							{/* Property Type Selector */}
							<div className="space-y-1.5">
								<div className="grid grid-cols-2 gap-2.5">
									{TYPE_OPTIONS.map((opt) => {
										const isSelected = variableType === opt.value;
										return (
											<button
												key={opt.value}
												type="button"
												onClick={() => setVariableType(opt.value)}
												disabled={status !== "idle"}
												className={cn(
													"group relative flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all duration-150 active:scale-[0.98]",
													isSelected
														? "border-primary-base bg-bg-white-0 shadow-[0_0_0_1px_#0055FF] dark:border-primary-base dark:bg-white/[0.04] dark:shadow-[0_0_0_1px_#0055FF]"
														: "border-stroke-soft-200 bg-bg-white-0 hover:border-stroke-sub-300 hover:bg-bg-weak-50/50 dark:border-stroke-soft-100/40 dark:bg-bg-soft-200/10 dark:hover:bg-white/[0.02]",
												)}
											>
												<div className="flex w-full items-center justify-between">
													<p className="font-medium text-text-strong-950 text-xs dark:text-white">
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
												<p className="text-[11px] text-text-sub-600 leading-snug dark:text-white/60">
													{opt.description}
												</p>
											</button>
										);
									})}
								</div>
							</div>

							{/* Default Value */}
							<div className="space-y-1.5">
								<Label.Root
									htmlFor="templateDefaultValue"
									className="font-medium text-text-strong-950 text-xs dark:text-white"
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
											id="templateDefaultValue"
											placeholder={variableType === "number" ? "0" : "unknown"}
											value={defaultValue}
											onChange={(e) => {
												const val = e.target.value;
												if (variableType === "number") {
													if (val === "" || /^-?\d*\.?\d*$/.test(val)) {
														setDefaultValue(val);
													}
												} else {
													setDefaultValue(val);
												}
											}}
											disabled={status !== "idle"}
											inputMode={variableType === "number" ? "numeric" : "text"}
										/>
									</Input.Wrapper>
								</Input.Root>
								{defaultValueError ? (
									<p className="text-[11px] text-error-base">
										{defaultValueError}
									</p>
								) : (
									<p className="text-[11px] text-text-sub-600 dark:text-white/60">
										Fallback value used when a contact is missing this variable
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
