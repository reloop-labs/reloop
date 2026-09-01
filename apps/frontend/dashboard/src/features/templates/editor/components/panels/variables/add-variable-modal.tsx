import { valibotResolver } from "@hookform/resolvers/valibot";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { KbdCommand } from "@reloop/ui/kbd-command";
import { KbdEnter } from "@reloop/ui/kbd-enter";
import { KbdEsc } from "@reloop/ui/kbd-esc";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import * as v from "valibot";

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

interface AddTemplateVariableModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onAdd: (
		name: string,
		type: "string" | "number",
		defaultValue: string | null,
	) => Promise<void>;
	isSubmitting: boolean;
}

export const AddTemplateVariableModal = ({
	open,
	onOpenChange,
	onAdd,
	isSubmitting,
}: AddTemplateVariableModalProps) => {
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

	const handleOpenChange = (isOpen: boolean) => {
		if (!isOpen) {
			reset({
				variableName: "",
				variableType: "string",
				defaultValue: "",
			});
			setIsSuccess(false);
		}
		onOpenChange(isOpen);
	};

	const handleFormSubmit = handleSubmit(async (data) => {
		try {
			await onAdd(
				data.variableName,
				data.variableType,
				data.defaultValue.trim() || null,
			);
			setIsSuccess(true);
			setTimeout(() => {
				setIsSuccess(false);
				handleOpenChange(false);
			}, 400);
		} catch {
			// Keep modal open on failure; caller surfaces the error toast
		}
	});

	const variableNameRegister = register("variableName");
	const canSubmit = isValid && !isSubmitting;

	useEffect(() => {
		if (!open) return;
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
				e.preventDefault();
				if (canSubmit) {
					void handleFormSubmit();
				}
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [open, canSubmit, handleFormSubmit]);

	return (
		<Modal.Root open={open} onOpenChange={handleOpenChange}>
			<Modal.Content
				className="w-full max-w-[480px] overflow-hidden rounded-2xl border border-stroke-soft-100/50 bg-bg-white-0 p-0.5 shadow-regular-md sm:max-w-[480px] dark:border-stroke-soft-100/40 dark:bg-[#0c0c0c]"
				showClose={false}
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
								<Modal.Title className="font-medium text-label-sm text-text-strong-950 dark:text-white">
									Create Variable
								</Modal.Title>
							</div>
						</div>
						<button
							type="button"
							onClick={() => handleOpenChange(false)}
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
								onClick={() => handleOpenChange(false)}
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
			</Modal.Content>
		</Modal.Root>
	);
};
