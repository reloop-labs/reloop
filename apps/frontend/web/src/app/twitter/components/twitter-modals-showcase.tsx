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

function ModalStyleOne({ onClose }: { onClose: () => void }) {
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

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onClose();
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
			onClose();
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
			className="w-full max-w-[480px] overflow-hidden rounded-2xl border border-stroke-soft-100/50 bg-bg-white-0 p-0.5 shadow-regular-md sm:max-w-[480px] dark:border-stroke-soft-100/40 dark:bg-[#0c0c0c]"
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
						onClick={onClose}
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
							onClick={onClose}
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

function ModalStyleTwo({ onClose }: { onClose: () => void }) {
	const [name, setName] = useState("");
	const [status, setStatus] = useState<"idle" | "creating" | "success">("idle");
	const nameField = useFieldError();

	const handleClose = () => {
		if (status !== "idle") return;
		setName("");
		nameField.clear();
		setStatus("idle");
		onClose();
	};

	const handleSubmit = (e?: React.FormEvent) => {
		e?.preventDefault();
		if (status !== "idle") return;

		const trimmed = name.trim();
		if (!trimmed) {
			nameField.show("Please enter a campaign name.");
			return;
		}

		nameField.clear();
		setStatus("creating");
		setTimeout(() => {
			setStatus("success");
			setTimeout(() => {
				setName("");
				nameField.clear();
				setStatus("idle");
			}, 1500);
		}, 600);
	};

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
					<div className="flex items-start justify-between px-6 dark:border-stroke-soft-100/40">
						<div className="space-y-1">
							<div className="flex items-center gap-2">
								<Icon name="mega-phone" className="size-4" />
								<h2 className="font-medium text-text-strong-950 text-xl tracking-tight dark:text-white">
									Create campaign
								</h2>
							</div>
						</div>
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

					<div className="space-y-1.5 px-6 pb-7">
						<Label.Root
							htmlFor="campaign-name-style2"
							className="font-medium text-text-strong-950 text-xs dark:text-white"
						>
							Campaign name
							<Label.Asterisk />
						</Label.Root>
						<FieldError
							field={nameField}
							hint="Used internally to find this campaign in your list."
						>
							<Input.Root size="medium" hasError={nameField.hasError}>
								<Input.Wrapper>
									<Input.Input
										id="campaign-name-style2"
										{...nameField.controlProps}
										placeholder="e.g. April product update"
										value={name}
										onChange={(e) => {
											setName(e.target.value);
											if (nameField.hasError) nameField.clear();
										}}
										autoFocus
										disabled={status !== "idle"}
									/>
								</Input.Wrapper>
							</Input.Root>
						</FieldError>
					</div>
				</div>
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
							"min-w-[168px] justify-center overflow-hidden transition-all duration-200",
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
										Create campaign
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
	const [isLeftOpen, setIsLeftOpen] = useState(true);
	const [isRightOpen, setIsRightOpen] = useState(true);

	return (
		<div
			data-standalone="true"
			className="relative flex min-h-dvh w-full flex-col bg-white md:flex-row"
		>
			{/* LEFT HALF SCREEN */}
			<div className="relative flex flex-1 items-center justify-center border-stroke-soft-200 border-b p-6 md:border-r md:border-b-0 dark:border-stroke-soft-100/40">
				<AnimatePresence mode="wait">
					{isLeftOpen ? (
						<ModalStyleOne key="modal-1" onClose={() => setIsLeftOpen(false)} />
					) : (
						<motion.div
							key="trigger-1"
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.95 }}
							transition={{ duration: 0.2 }}
							className="flex flex-col items-center gap-3"
						>
							<FancyButton.Root
								type="button"
								variant="blue"
								size="medium"
								onClick={() => setIsLeftOpen(true)}
								className="min-w-48 justify-center shadow-sm"
							>
								Open modal
							</FancyButton.Root>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			{/* RIGHT HALF SCREEN */}
			<div className="relative flex flex-1 items-center justify-center p-6">
				<AnimatePresence mode="wait">
					{isRightOpen ? (
						<ModalStyleTwo
							key="modal-2"
							onClose={() => setIsRightOpen(false)}
						/>
					) : (
						<motion.div
							key="trigger-2"
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.95 }}
							transition={{ duration: 0.2 }}
							className="flex flex-col items-center gap-3"
						>
							<FancyButton.Root
								type="button"
								variant="blue"
								size="medium"
								onClick={() => setIsRightOpen(true)}
								className="min-w-48 justify-center shadow-sm"
							>
								Open modal
							</FancyButton.Root>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}
