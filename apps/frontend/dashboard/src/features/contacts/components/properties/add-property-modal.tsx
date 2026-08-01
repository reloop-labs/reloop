import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { useInvalidateContacts } from "#/features/contacts/hooks/use-contacts-query";

interface AddPropertyModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

type PropertyType = "string" | "number";

const TYPE_OPTIONS: {
	value: PropertyType;
	label: string;
	icon: string;
	description: string;
	color: string;
}[] = [
	{
		value: "string",
		label: "String",
		icon: "text",
		description: "Free-form text",
		color: "text-primary-base",
	},
	{
		value: "number",
		label: "Number",
		icon: "hash",
		description: "Integer or decimal",
		color: "text-primary-base",
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
}: AddPropertyModalProps) => {
	const invalidate = useInvalidateContacts();
	const [status, setStatus] = useState<"idle" | "creating" | "success">("idle");
	const [propertyName, setPropertyName] = useState("");
	const [nameError, setNameError] = useState("");
	const [propertyType, setPropertyType] = useState<PropertyType>("string");
	const [defaultValue, setDefaultValue] = useState("");

	const nameInputRef = useRef<HTMLInputElement>(null);

	const handleClose = () => {
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

	const canSubmit =
		!!propertyName && !nameError && !defaultValueError && status !== "creating";

	useHotkeys(
		"enter",
		(e) => {
			e.preventDefault();
			if (open && canSubmit && status === "idle") {
				void handleSubmit();
			}
		},
		{ enableOnFormTags: ["INPUT"], enabled: open },
		[
			open,
			canSubmit,
			status,
			propertyName,
			propertyType,
			defaultValue,
			defaultValueError,
		],
	);

	const handleSubmit = async (e?: React.FormEvent) => {
		e?.preventDefault();
		if (!canSubmit || status !== "idle") return;

		setStatus("creating");
		try {
			const response = await fetch("/api/contacts/v1/properties/create", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: propertyName,
					type: propertyType,
					fallbackValue: defaultValue || undefined,
				}),
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.message || "Failed to create property");
			}

			setStatus("success");
			setTimeout(() => {
				void invalidate();
				handleClose();
			}, 750);
		} catch (error) {
			console.error("Failed to create property:", error);
			toast.error(
				error instanceof Error ? error.message : "Failed to create property",
			);
			setStatus("idle");
		}
	};

	return (
		<Modal.Root open={open} onOpenChange={(o) => !o && handleClose()}>
			<Modal.Content
				className="overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0 sm:max-w-[460px] dark:border-stroke-soft-100/40"
				showClose={true}
			>
				<motion.div
					layout
					transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
				>
					<div className="p-6">
						<div className="relative pr-6">
							<Modal.Title className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
								Add property
							</Modal.Title>
						</div>

						<form onSubmit={handleSubmit} className="mt-5">
							<div className="space-y-4">
								{/* Property Name */}
								<div className="space-y-2">
									<Label.Root htmlFor="propertyName">
										Name
										<Label.Asterisk />
									</Label.Root>
									<Input.Root
										size="medium"
										hasError={!!nameError}
										className="rounded-xl"
									>
										<Input.Wrapper>
											<Input.Icon
												as={Icon}
												name="tag"
												size="small"
												className="h-4 w-4"
											/>
											<Input.Input
												ref={nameInputRef}
												id="propertyName"
												placeholder="e.g., first_name, company_plan"
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
										<p className="text-error-base text-paragraph-xs">
											{nameError}
										</p>
									) : (
										<p className="text-paragraph-xs text-text-sub-600">
											Letters, numbers &amp; underscores — spaces auto-convert
										</p>
									)}
								</div>

								{/* Property Type */}
								<div className="space-y-2">
									<Label.Root>
										Type
										<Label.Asterisk />
									</Label.Root>
									<div className="grid grid-cols-2 gap-2">
										{TYPE_OPTIONS.map((opt) => {
											const isSelected = propertyType === opt.value;
											return (
												<motion.button
													whileTap={{ scale: 0.98 }}
													key={opt.value}
													type="button"
													onClick={() => setPropertyType(opt.value)}
													disabled={status !== "idle"}
													className={cn(
														"flex flex-col items-start gap-2 rounded-xl border-2 p-3 text-left transition-all duration-150",
														isSelected
															? "border-primary-base bg-primary-light/10"
															: "border-stroke-soft-100 bg-bg-soft-200/20 hover:border-stroke-soft-200 hover:bg-bg-soft-200/40 dark:border-stroke-soft-100/40 dark:bg-bg-soft-200/10",
													)}
												>
													<div className="flex w-full justify-between">
														<div
															className={cn(
																"flex h-6 w-6 items-center justify-center rounded-lg border",
																isSelected
																	? "border-primary-base/30 bg-primary-light/20"
																	: "border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/40",
															)}
														>
															<Icon
																name={
																	opt.icon as Parameters<typeof Icon>[0]["name"]
																}
																className={cn(
																	"h-3 w-3",
																	isSelected ? opt.color : "text-text-sub-600",
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
														<p className="font-semibold text-text-strong-950 text-xs">
															{opt.label}
														</p>
														<p className="text-[10px] text-text-sub-600">
															{opt.description}
														</p>
													</div>
												</motion.button>
											);
										})}
									</div>
								</div>

								{/* Default Value */}
								<div className="space-y-2">
									<Label.Root htmlFor="defaultValue">Default Value</Label.Root>
									<Input.Root
										size="medium"
										className="rounded-xl"
										hasError={!!defaultValueError}
									>
										<Input.Wrapper>
											<Input.Input
												id="defaultValue"
												placeholder={
													propertyType === "number"
														? "e.g., 0"
														: "e.g., unknown"
												}
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
												inputMode={
													propertyType === "number" ? "numeric" : "text"
												}
											/>
										</Input.Wrapper>
									</Input.Root>
									{defaultValueError ? (
										<p className="text-error-base text-paragraph-xs">
											{defaultValueError}
										</p>
									) : (
										<p className="text-paragraph-xs text-text-sub-600">
											Used when a contact doesn&apos;t have this property set
										</p>
									)}
								</div>
							</div>

							{/* Actions / Footer */}
							<div className="mt-6 flex items-center justify-end gap-3">
								<Button.Root
									type="button"
									variant="neutral"
									mode="ghost"
									size="small"
									onClick={handleClose}
									className={cn(
										"transition-opacity duration-200",
										status !== "idle" && "pointer-events-none opacity-50",
									)}
								>
									Cancel
								</Button.Root>

								<FancyButton.Root
									type="submit"
									variant={status === "success" ? "success" : "blue"}
									size="small"
									disabled={
										status === "creating" || (status === "idle" && !canSubmit)
									}
									className={cn(
										"w-[156px] min-w-[156px] justify-center overflow-hidden transition-all duration-200",
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
													<span>Property Created</span>
												</>
											) : (
												<>
													Add property
													<span className="inline-flex items-center gap-0.5 opacity-80">
														<Icon
															name="command"
															className="h-3.5 w-3.5 rounded-sm border border-white/20 p-px"
														/>
														<Icon
															name="enter"
															className="h-3.5 w-3.5 rounded-sm border border-white/20 p-px"
														/>
													</span>
												</>
											)}
										</motion.span>
									</AnimatePresence>
								</FancyButton.Root>
							</div>
						</form>
					</div>
				</motion.div>
			</Modal.Content>
		</Modal.Root>
	);
};
