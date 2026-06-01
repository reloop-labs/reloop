"use client";

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
import { Braces } from "lucide-react";
import { useEffect, useState } from "react";

type VariableType = "string" | "number";

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

const validateVariableName = (name: string): string => {
	if (!name) return "";
	if (!/^[a-zA-Z0-9_]+$/.test(name)) {
		return "Only letters, numbers, and underscores are allowed";
	}
	if (/^[0-9]/.test(name)) {
		return "Variable name cannot start with a number";
	}
	return "";
};

const slugify = (text: string) => {
	return text
		.toLowerCase()
		.trim()
		.replace(/\s+/g, "_")
		.replace(/[^a-z0-9_]/g, "");
};

interface EditTemplateVariableModalProps {
	variable: {
		name: string;
		type: "string" | "number";
		defaultValue: string | null;
	} | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSave: (
		originalName: string,
		variable: {
			name: string;
			type: "string" | "number";
			defaultValue: string | null;
		},
	) => Promise<void>;
	isSubmitting: boolean;
}

export const EditTemplateVariableModal = ({
	variable,
	open,
	onOpenChange,
	onSave,
	isSubmitting,
}: EditTemplateVariableModalProps) => {
	const [variableName, setVariableName] = useState("");
	const [nameError, setNameError] = useState("");
	const [fallbackValue, setFallbackValue] = useState("");
	const [variableType, setVariableType] = useState<VariableType>("string");

	useEffect(() => {
		if (open && variable) {
			setVariableName(variable.name);
			setNameError("");
			setFallbackValue(variable.defaultValue || "");
			setVariableType(variable.type);
		}
	}, [open, variable]);

	const fallbackValueError =
		variableType === "number" &&
		fallbackValue !== "" &&
		!/^-?\d+(?:\.\d+)?$/.test(fallbackValue.trim())
			? "Must be a valid number"
			: "";

	const canSubmit =
		!!variableName && !nameError && !fallbackValueError && !isSubmitting;

	const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setVariableName(value);
		setNameError(validateVariableName(value));
	};

	const handleSlugify = () => {
		const slugged = slugify(variableName);
		setVariableName(slugged);
		setNameError(validateVariableName(slugged));
	};

	const handleFallbackValueChange = (
		e: React.ChangeEvent<HTMLInputElement>,
	) => {
		const val = e.target.value;
		if (variableType === "number") {
			if (val === "" || /^-?\d*\.?\d*$/.test(val)) {
				setFallbackValue(val);
			}
		} else {
			setFallbackValue(val);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!variable || !canSubmit) return;
		await onSave(variable.name, {
			name: variableName,
			type: variableType,
			defaultValue: fallbackValue || null,
		});
		onOpenChange(false);
	};

	if (!variable) return null;

	return (
		<Modal.Root open={open} onOpenChange={onOpenChange}>
			<Modal.Content
				className="rounded-2xl border border-stroke-soft-100/50 p-0.5 sm:max-w-[480px]"
				showClose={true}
			>
				<div className="rounded-2xl border border-stroke-soft-100/50">
					<form onSubmit={handleSubmit}>
						<Modal.Header className="before:border-stroke-soft-200/50">
							<div className="flex items-center justify-center gap-1.5">
								<Braces
									size={15}
									className="text-text-strong-950 dark:text-white"
								/>
								<div className="flex-1">
									<Modal.Title className="font-medium">
										Edit Variable
									</Modal.Title>
								</div>
							</div>
						</Modal.Header>
						<Modal.Body className="space-y-6">
							{/* Variable Name */}
							<div className="flex flex-col gap-1.5">
								<Label.Root htmlFor="variableName">
									Name
									<Label.Asterisk />
								</Label.Root>
								<Input.Root size="small" className="rounded-xl">
									<Input.Wrapper>
										<Input.InlineAffix className="font-semibold focus:text-text-strong-950!">
											{"{{{"}
										</Input.InlineAffix>
										<Input.Input
											id="variableName"
											value={variable.name}
											disabled={true}
										/>
										<Input.InlineAffix className="font-semibold focus:text-text-strong-950!">
											{"}}}"}
										</Input.InlineAffix>
									</Input.Wrapper>
								</Input.Root>
							</div>

							{/* Type Card Picker */}
							<div className="flex flex-col gap-2">
								<Label.Root>
									Type
									<Label.Asterisk />
								</Label.Root>
								<div className="grid grid-cols-2 gap-2">
									{TYPE_OPTIONS.map((opt) => {
										const isSelected = variableType === opt.value;
										return (
											<motion.button
												whileTap={{ scale: 0.98 }}
												key={opt.value}
												type="button"
												onClick={() => setVariableType(opt.value)}
												disabled={isSubmitting}
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
													<p className="text-[10px] text-text-sub-600 leading-tight">
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
								<Label.Root htmlFor="edit-fallback-value">
									Default Value
								</Label.Root>
								<Input.Root
									size="small"
									className="rounded-xl"
									hasError={!!fallbackValueError}
								>
									<Input.Wrapper>
										<Input.Input
											id="edit-fallback-value"
											placeholder={
												variableType === "number" ? "e.g., 0" : "e.g., unknown"
											}
											value={fallbackValue}
											onChange={handleFallbackValueChange}
											disabled={isSubmitting}
											inputMode={variableType === "number" ? "numeric" : "text"}
										/>
									</Input.Wrapper>
								</Input.Root>
								{fallbackValueError ? (
									<p className="text-error-base text-xs">
										{fallbackValueError}
									</p>
								) : (
									<p className="text-text-sub-600 text-xs leading-normal">
										Used when a contact doesn&apos;t have this variable set
									</p>
								)}
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
								disabled={!canSubmit}
							>
								{isSubmitting ? (
									<>
										<Spinner size={14} color="currentColor" />
										Updating...
									</>
								) : (
									<>
										Update Variable
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
