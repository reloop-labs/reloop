"use client";

import * as Badge from "@reloop/ui/badge";
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
import { useEffect, useState } from "react";

type PropertyType = "string" | "number";

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

interface EditTemplateVariableModalProps {
	property: {
		name: string;
		type: "string" | "number";
		defaultValue: string | null;
	} | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSave: (property: {
		name: string;
		type: "string" | "number";
		defaultValue: string | null;
	}) => Promise<void>;
	isSubmitting: boolean;
}

export const EditTemplateVariableModal = ({
	property,
	open,
	onOpenChange,
	onSave,
	isSubmitting,
}: EditTemplateVariableModalProps) => {
	const [fallbackValue, setFallbackValue] = useState("");
	const [propertyType, setPropertyType] = useState<PropertyType>("string");

	useEffect(() => {
		if (open && property) {
			setFallbackValue(property.defaultValue || "");
			setPropertyType(property.type);
		}
	}, [open, property]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!property) return;
		await onSave({
			name: property.name,
			type: propertyType,
			defaultValue: fallbackValue || null,
		});
		onOpenChange(false);
	};

	if (!property) return null;

	const selectedType = TYPE_OPTIONS.find((t) => t.value === propertyType)!;

	return (
		<Modal.Root open={open} onOpenChange={onOpenChange}>
			<Modal.Content
				className="rounded-2xl border border-stroke-soft-100/50 p-0.5 sm:max-w-[480px]"
				showClose={true}
			>
				<div className="rounded-2xl border border-stroke-soft-100/50">
					<form onSubmit={handleSubmit}>
						<Modal.Header className="before:border-stroke-soft-200/50">
							<div className="flex items-center justify-center">
								<Icon name="edit-2" className="h-4 w-4" />
							</div>
							<div className="flex-1">
								<Modal.Title className="font-medium">Edit Property</Modal.Title>
							</div>
						</Modal.Header>
						<Modal.Body className="space-y-6">
							{/* Property Info Card */}
							<div className="rounded-xl border border-stroke-soft-100 bg-bg-soft-200/20 p-4 dark:border-stroke-soft-100/30 dark:bg-bg-soft-200/10">
								<div className="flex items-center gap-3">
									<div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-neutral-600 to-neutral-500 shadow-sm">
										<Icon name="tag" className="h-4 w-4 text-white" />
									</div>
									<div className="flex flex-1 items-center justify-between gap-2">
										<p className="font-semibold text-sm text-text-strong-950">
											{property.name}
										</p>
										<div className="flex items-center">
											<Badge.Root
												size="small"
												variant="lighter"
												color={selectedType.badgeColor}
												className="h-5 rounded-md px-1.5 font-medium text-xs capitalize"
											>
												{propertyType}
											</Badge.Root>
										</div>
									</div>
								</div>
							</div>

							{/* Type Card Picker */}
							<div className="flex flex-col gap-2">
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

							{/* Fallback Value (Editable) */}
							<div className="space-y-1.5">
								<Label.Root htmlFor="edit-fallback-value">
									Default Value
								</Label.Root>
								<Input.Root size="small" className="rounded-xl">
									<Input.Wrapper>
										<Input.Input
											id="edit-fallback-value"
											type="text"
											className="px-2"
											value={fallbackValue}
											onChange={(e) => setFallbackValue(e.target.value)}
											placeholder="e.g. unknown"
											disabled={isSubmitting}
										/>
									</Input.Wrapper>
								</Input.Root>
								<p className="text-text-sub-600 text-xs leading-normal">
									This value will be used when a contact doesn't have this
									property set.
								</p>
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
								disabled={isSubmitting}
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
						</Modal.Footer>
					</form>
				</div>
			</Modal.Content>
		</Modal.Root>
	);
};
