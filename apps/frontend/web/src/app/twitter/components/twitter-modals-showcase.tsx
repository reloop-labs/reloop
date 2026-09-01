"use client";

import { valibotResolver } from "@hookform/resolvers/valibot";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { FieldError, useFieldError } from "@reloop/ui/field-error";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { KbdCommand } from "@reloop/ui/kbd-command";
import { KbdEnter } from "@reloop/ui/kbd-enter";
import { KbdEsc } from "@reloop/ui/kbd-esc";
import { KbdKey } from "@reloop/ui/kbd-key";
import * as Label from "@reloop/ui/label";
import Spinner from "@reloop/ui/spinner";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import * as v from "valibot";

/** Keycap shortcut style */
const shortcutKbdClassName = cn(
	"h-4 w-4 min-w-4 rounded-[5px] px-0 text-[10px] leading-none",
	"border border-stroke-soft-200 bg-bg-weak-50 text-text-sub-600",
	"shadow-[0_1.5px_0_0_var(--color-stroke-soft-200)]",
	"dark:border-white/[0.14] dark:bg-white/[0.07] dark:text-white",
	"dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.55),0_0_0_0.5px_rgba(255,255,255,0.06),inset_0_0.5px_0_0_rgba(255,255,255,0.08)]",
);

function ActionKbd({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<KbdKey className={cn(shortcutKbdClassName, "max-sm:hidden", className)}>
			{children}
		</KbdKey>
	);
}

const actionKbdOnBlueClassName =
	"border-white/25 bg-white/15 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]";

/* -------------------------------------------------------------------------- */
/*                     MODAL 1 (TEMPLATE VARIABLE EDITOR)                     */
/* -------------------------------------------------------------------------- */

const TYPE_OPTIONS = [
	{
		value: "string" as const,
		label: "String",
		description: "Plain text, name, email, etc.",
		icon: "type",
		color: "text-blue-500",
		badgeColor: "blue" as const,
	},
	{
		value: "number" as const,
		label: "Number",
		description: "Integers, decimals, prices, etc.",
		icon: "hash",
		color: "text-purple-500",
		badgeColor: "purple" as const,
	},
];

const slugify = (text: string) => {
	return text
		.toLowerCase()
		.trim()
		.replace(/\s+/g, "_")
		.replace(/[^a-z0-9_]/g, "");
};

const addVariableSchema = v.pipe(
	v.object({
		variableName: v.pipe(
			v.string(),
			v.minLength(1, "Name is required"),
			v.regex(
				/^[a-zA-Z0-9_]*$/,
				"Only letters, numbers, and underscores are allowed",
			),
			v.regex(/^[^0-9]/, "Variable name cannot start with a number"),
		),
		variableType: v.union([v.literal("string"), v.literal("number")]),
		defaultValue: v.string(),
	}),
	v.forward(
		v.check((input) => {
			if (input.variableType === "number" && input.defaultValue.trim() !== "") {
				return /^-?\d+(?:\.\d+)?$/.test(input.defaultValue.trim());
			}
			return true;
		}, "Must be a valid number"),
		["defaultValue"],
	),
);

type VariableFormValues = v.InferInput<typeof addVariableSchema>;

function ModalStyleOne({ onClose }: { onClose?: () => void }) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		reset,
		getValues,
		trigger,
		formState: { errors, isValid },
	} = useForm<VariableFormValues>({
		resolver: valibotResolver(
			addVariableSchema,
		) as Resolver<VariableFormValues>,
		defaultValues: {
			variableName: "",
			variableType: "string",
			defaultValue: "",
		},
		mode: "onChange",
	});

	const watchVariableType = watch("variableType");

	const handleClose = () => {
		reset();
		onClose?.();
	};

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				handleClose();
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [onClose]);

	const handleFormSubmit = handleSubmit(async () => {
		setIsSubmitting(true);
		await new Promise((resolve) => setTimeout(resolve, 600));
		setIsSubmitting(false);
		setIsSuccess(true);
		setTimeout(() => {
			setIsSuccess(false);
			reset();
			onClose?.();
		}, 1000);
	});

	const variableNameRegister = register("variableName");
	const canSubmit = isValid && !isSubmitting;

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.96, y: 8 }}
			animate={{ opacity: 1, scale: 1, y: 0 }}
			exit={{ opacity: 0, scale: 0.96, y: 8 }}
			transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
			className="w-full max-w-[480px] overflow-hidden rounded-2xl border border-stroke-soft-100/50 bg-bg-white-0 p-0.5 sm:max-w-[480px] dark:border-stroke-soft-100/40 dark:bg-[#0c0c0c]"
		>
			<div className="rounded-2xl border border-stroke-soft-100/50 dark:border-stroke-soft-100/40">
				{/* Header */}
				<div className="relative flex items-center gap-3.5 py-4 pr-14 pl-5 before:absolute before:inset-x-0 before:bottom-0 before:border-stroke-soft-200/50 before:border-b dark:before:border-stroke-soft-100/40">
					<div className="flex items-center justify-center gap-1.5">
						<Icon
							name="brackets"
							className="h-3.5 w-3.5 text-text-strong-950 dark:text-white"
						/>
						<div className="flex-1">
							<h2 className="font-medium text-label-sm text-text-strong-950 dark:text-white">
								Create Variable
							</h2>
						</div>
					</div>
					<button
						type="button"
						onClick={handleClose}
						aria-label="Close"
						className="absolute top-4 right-4 z-20 flex h-7 w-7 items-center justify-center rounded-lg border border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 active:scale-[0.95] dark:border-stroke-soft-100/40 dark:bg-transparent dark:text-white/60 dark:hover:bg-white/[0.05] dark:hover:text-white"
					>
						<X className="h-3.5 w-3.5" />
					</button>
				</div>

				<form onSubmit={handleFormSubmit}>
					<div className="flex flex-col gap-5 p-5">
						{/* Variable Name */}
						<div className="flex flex-col gap-1.5">
							<Label.Root htmlFor="variableName">
								Name
								<Label.Asterisk />
							</Label.Root>
							<Input.Root
								size="small"
								hasError={!!errors.variableName}
								className="rounded-xl"
							>
								<Input.Wrapper>
									<Input.InlineAffix className="font-semibold focus:text-text-strong-950!">
										{"{{{"}
									</Input.InlineAffix>
									<Input.Input
										id="variableName"
										placeholder="variable_name"
										disabled={isSubmitting}
										autoComplete="off"
										spellCheck={false}
										autoFocus
										{...variableNameRegister}
										onBlur={(e) => {
											variableNameRegister.onBlur(e);
											const slugged = slugify(e.target.value);
											setValue("variableName", slugged, {
												shouldValidate: true,
											});
										}}
									/>
									<Input.InlineAffix className="font-semibold focus:text-text-strong-950!">
										{"}}}"}
									</Input.InlineAffix>
								</Input.Wrapper>
							</Input.Root>
							{errors.variableName ? (
								<p className="text-error-base text-xs">
									{errors.variableName.message}
								</p>
							) : (
								<p className="text-text-sub-600 text-xs dark:text-white/60">
									Letters, numbers &amp; underscores — spaces auto-convert
								</p>
							)}
						</div>

						{/* Type — card picker */}
						<div className="flex flex-col gap-2">
							<Label.Root>
								Type
								<Label.Asterisk />
							</Label.Root>
							<div className="grid grid-cols-2 gap-2">
								{TYPE_OPTIONS.map((opt) => {
									const isSelected = watchVariableType === opt.value;
									return (
										<motion.button
											whileTap={{ scale: 0.98 }}
											key={opt.value}
											type="button"
											onClick={() => {
												setValue("variableType", opt.value, {
													shouldValidate: true,
												});
												trigger("defaultValue");
											}}
											disabled={isSubmitting}
											className={cn(
												"flex flex-col items-start gap-2 rounded-xl border-2 p-3 text-left transition-all duration-150",
												isSelected
													? "border-primary-base bg-primary-light/10 dark:border-blue-500 dark:bg-blue-500/10"
													: "border-stroke-soft-200 bg-bg-soft-200/20 hover:border-stroke-soft-300 hover:bg-bg-soft-200/40 dark:border-stroke-soft-100/40 dark:bg-bg-soft-200/10 dark:hover:border-stroke-soft-100/60",
											)}
										>
											<div className="flex w-full justify-between">
												<div
													className={cn(
														"flex h-6 w-6 items-center justify-center rounded-lg border",
														isSelected
															? "border-primary-base/30 bg-primary-light/20 dark:border-blue-500/30 dark:bg-blue-500/20"
															: "border-stroke-soft-200 bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-white/[0.04]",
													)}
												>
													<Icon
														name={
															opt.icon as Parameters<typeof Icon>[0]["name"]
														}
														className={cn(
															"h-3 w-3",
															isSelected
																? opt.color
																: "text-text-sub-600 dark:text-white/60",
														)}
													/>
												</div>
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
															className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary-base"
														>
															<Icon
																name="check"
																className="h-2 w-2 text-white"
															/>
														</motion.div>
													)}
												</AnimatePresence>
											</div>
											<div>
												<p className="font-semibold text-text-strong-950 text-xs dark:text-white">
													{opt.label}
												</p>
												<p className="text-[10px] text-text-sub-600 leading-tight dark:text-white/60">
													{opt.description}
												</p>
											</div>
										</motion.button>
									);
								})}
							</div>
						</div>

						{/* Default Value */}
						<div className="flex flex-col gap-1.5">
							<Label.Root htmlFor="defaultValue">Default Value</Label.Root>
							<Input.Root
								size="small"
								className="rounded-xl"
								hasError={!!errors.defaultValue}
							>
								<Input.Wrapper>
									<Input.Input
										id="defaultValue"
										placeholder={
											watchVariableType === "number"
												? "e.g., 0"
												: "e.g., unknown"
										}
										disabled={isSubmitting}
										inputMode={
											watchVariableType === "number" ? "numeric" : "text"
										}
										{...register("defaultValue")}
										onChange={(e) => {
											const val = e.target.value;
											if (watchVariableType === "number") {
												if (val === "" || /^-?\d*\.?\d*$/.test(val)) {
													setValue("defaultValue", val, {
														shouldValidate: true,
													});
												} else {
													e.target.value = getValues("defaultValue") || "";
												}
											} else {
												setValue("defaultValue", val, {
													shouldValidate: true,
												});
											}
										}}
									/>
								</Input.Wrapper>
							</Input.Root>
							{errors.defaultValue ? (
								<p className="text-error-base text-xs">
									{errors.defaultValue.message}
								</p>
							) : (
								<p className="text-text-sub-600 text-xs leading-normal dark:text-white/60">
									Used when a contact doesn&apos;t have this variable set
								</p>
							)}
						</div>
					</div>

					{/* Footer */}
					<div className="mt-2 flex items-center justify-end gap-3 border-stroke-soft-100/50 border-t px-5 py-4 dark:border-stroke-soft-100/40">
						<Button.Root
							type="button"
							variant="neutral"
							mode="stroke"
							size="xsmall"
							onClick={handleClose}
							disabled={isSubmitting}
						>
							Cancel
							<KbdEsc />
						</Button.Root>
						<Button.Root
							type="submit"
							variant="neutral"
							size="xsmall"
							disabled={!canSubmit}
						>
							{isSubmitting ? (
								<>
									<Spinner size={14} color="currentColor" />
									Creating…
								</>
							) : isSuccess ? (
								<>
									<Icon name="check-circle" className="h-3.5 w-3.5" />
									Created
								</>
							) : (
								<>
									Create Variable
									<span className="inline-flex items-center gap-0.5">
										<KbdCommand />
										<KbdEnter />
									</span>
								</>
							)}
						</Button.Root>
					</div>
				</form>
			</div>
		</motion.div>
	);
}

/* -------------------------------------------------------------------------- */
/*                           MODAL 2 (NESTED CARD)                            */
/* -------------------------------------------------------------------------- */

type PropertyTypeStyleTwo = "string" | "number";

const TYPE_OPTIONS_STYLE_TWO: {
	value: PropertyTypeStyleTwo;
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

const validateVariableNameStyleTwo = (name: string): string => {
	if (!name) return "";
	if (!/^[a-zA-Z0-9_]*$/.test(name))
		return "Only letters, numbers, and underscores";
	if (!/^[a-zA-Z_]/.test(name)) return "Must start with a letter or underscore";
	return "";
};

function ModalStyleTwo({ onClose }: { onClose?: () => void }) {
	const [status, setStatus] = useState<"idle" | "creating" | "success">("idle");
	const [variableName, setVariableName] = useState("");
	const [variableType, setVariableType] =
		useState<PropertyTypeStyleTwo>("string");
	const [defaultValue, setDefaultValue] = useState("");
	const nameField = useFieldError();

	const handleClose = () => {
		if (status !== "idle") return;
		nameField.clear();
		setVariableName("");
		setDefaultValue("");
		setVariableType("string");
		setStatus("idle");
		onClose?.();
	};

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

	const handleSubmit = (e?: React.FormEvent) => {
		e?.preventDefault();
		if (status !== "idle") return;

		const trimmed = variableName.trim();
		if (!trimmed) {
			nameField.show("Please enter a variable name.");
			return;
		}

		const validationError = validateVariableNameStyleTwo(trimmed);
		if (validationError) {
			nameField.show(validationError);
			return;
		}

		if (defaultValueError) {
			return;
		}

		nameField.clear();
		setStatus("creating");
		setTimeout(() => {
			setStatus("success");
			setTimeout(() => {
				setStatus("idle");
				setVariableName("");
				setDefaultValue("");
				setVariableType("string");
				onClose?.();
			}, 1200);
		}, 600);
	};

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape" && status === "idle") {
				handleClose();
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [status]);

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.96, y: 8 }}
			animate={{ opacity: 1, scale: 1, y: 0 }}
			exit={{ opacity: 0, scale: 0.96, y: 8 }}
			transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
			className="w-full max-w-[460px] overflow-hidden rounded-[18px] border border-stroke-soft-200 bg-bg-soft-50 p-0 sm:max-w-[460px] dark:border-stroke-soft-100/40 dark:bg-white/[0.03]"
		>
			<form onSubmit={(e) => void handleSubmit(e)} noValidate>
				<div className="relative m-0.5 space-y-5 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 pt-5 dark:border-stroke-soft-100/40 dark:bg-[#0c0c0c]">
					{/* Header */}
					<div className="flex items-center justify-between px-6 dark:border-stroke-soft-100/40">
						<div className="flex items-center gap-2">
							<Icon
								name="variable"
								className="size-4.5 text-text-strong-950 dark:text-white"
							/>
							<h2 className="font-medium text-text-strong-950 text-xl tracking-tight dark:text-white">
								Create variable
							</h2>
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
					<div className="space-y-4.5 px-6 pb-6">
						{/* Variable Name */}
						<div className="space-y-1.5">
							<Label.Root
								htmlFor="variable-name-style2"
								className="font-semibold text-text-strong-950 text-xs dark:text-white"
							>
								Variable name
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
											id="variable-name-style2"
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
								{TYPE_OPTIONS_STYLE_TWO.map((opt) => {
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
												<p className="font-semibold text-sm text-text-strong-950 dark:text-white">
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
								htmlFor="default-value-style2"
								className="font-semibold text-text-strong-950 text-xs dark:text-white"
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
										id="default-value-style2"
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
										Create variable
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
		</motion.div>
	);
}

/* -------------------------------------------------------------------------- */
/*                            SPLIT SCREEN SHOWCASE                           */
/* -------------------------------------------------------------------------- */

export function TwitterModalsShowcase() {
	return (
		<div
			data-standalone="true"
			className="relative flex min-h-dvh w-full items-center justify-center bg-white p-6 sm:p-10 dark:bg-[#080808]"
		>
			<div className="flex w-full max-w-6xl flex-col items-center justify-center gap-8 lg:flex-row lg:gap-16">
				{/* LEFT CARD */}
				<div className="flex w-full max-w-[480px] items-center justify-center">
					<ModalStyleOne />
				</div>

				{/* RIGHT CARD */}
				<div className="flex w-full max-w-[460px] items-center justify-center">
					<ModalStyleTwo />
				</div>
			</div>
		</div>
	);
}
