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
import { useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { useSWRConfig } from "swr";

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
	badgeClass: string;
}[] = [
	{
		value: "string",
		label: "String",
		icon: "type",
		description: "Free-form text",
		color: "text-primary-base",
		badgeClass:
			"border border-primary-base text-primary-base bg-primary-light/20",
	},
	{
		value: "number",
		label: "Number",
		icon: "hash",
		description: "Integer or decimal",
		color: "text-primary-base",
		badgeClass:
			"border border-primary-base text-primary-base bg-primary-light/20",
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
	const { mutate } = useSWRConfig();
	const [isCreating, setIsCreating] = useState(false);
	const [propertyName, setPropertyName] = useState("");
	const [nameError, setNameError] = useState("");
	const [propertyType, setPropertyType] = useState<PropertyType>("string");
	const [defaultValue, setDefaultValue] = useState("");
	const [showPreview, setShowPreview] = useState(false);

	const nameInputRef = useRef<HTMLInputElement>(null);

	const selectedType = TYPE_OPTIONS.find((t) => t.value === propertyType)!;
	const previewName = propertyName || "property_name";
	const previewDefault = defaultValue || null;

	const handleOpenChange = (isOpen: boolean) => {
		if (!isOpen) {
			setPropertyName("");
			setNameError("");
			setPropertyType("string");
			setDefaultValue("");
			setShowPreview(false);
		}
		onOpenChange(isOpen);
	};

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

	const canSubmit = !!propertyName && !nameError && !isCreating;

	useHotkeys(
		"mod+enter",
		(e) => {
			e.preventDefault();
			if (open && canSubmit) {
				handleSubmit(new Event("submit") as unknown as React.FormEvent);
			}
		},
		{ enableOnFormTags: true, enabled: open },
		[open, canSubmit, propertyName, propertyType, defaultValue],
	);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!canSubmit) return;

		setIsCreating(true);
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

			toast.success("Property created successfully");
			handleOpenChange(false);
			await mutate(
				(key: string) =>
					typeof key === "string" &&
					key.includes("/api/contacts/v1/properties/list"),
			);
		} catch (error) {
			console.error("Failed to create property:", error);
			toast.error(
				error instanceof Error ? error.message : "Failed to create property",
			);
		} finally {
			setIsCreating(false);
		}
	};

	return (
		<Modal.Root open={open} onOpenChange={handleOpenChange}>
			<Modal.Content
				className={cn(
					"rounded-2xl border border-stroke-soft-100/50 p-0.5 transition-all duration-300",
					showPreview ? "sm:max-w-[760px]" : "sm:max-w-[480px]",
				)}
				showClose={true}
			>
				<div className="rounded-2xl border border-stroke-soft-100/50">
					<Modal.Header className="before:border-stroke-soft-200/50">
						<div className="flex items-center justify-center">
							<Icon name="tag" className="h-4 w-4" />
						</div>
						<div className="flex-1">
							<Modal.Title>Add Property</Modal.Title>
						</div>
						<button
							type="button"
							onClick={() => setShowPreview((v) => !v)}
							className={cn(
								"mr-7 inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 font-medium text-[11px] transition-colors",
								showPreview
									? "border-primary-base/30 bg-primary-light/10 text-primary-base"
									: "border-stroke-soft-100 bg-bg-soft-200/30 text-text-sub-600 hover:border-stroke-soft-200 hover:text-text-strong-950 dark:border-stroke-soft-100/40",
							)}
						>
							<Icon
								name={showPreview ? "eye-slash-outline" : "eye-outline"}
								className="h-3 w-3"
							/>
							{showPreview ? "Hide preview" : "Preview"}
						</button>
					</Modal.Header>

					<form onSubmit={handleSubmit}>
						<Modal.Body
							className={cn(
								"gap-6 sm:gap-8",
								showPreview
									? "grid grid-cols-1 sm:grid-cols-2"
									: "flex flex-col",
							)}
						>
							{/* ── Left: Form fields ───────────────────────────── */}
							<div className="flex flex-col gap-5">
								{/* Property Name */}
								<div className="flex flex-col gap-1.5">
									<Label.Root htmlFor="propertyName">
										Name
										<Label.Asterisk />
									</Label.Root>
									<Input.Root size="small" hasError={!!nameError}>
										<Input.Wrapper>
											<Input.Icon
												as={Icon}
												name="tag"
												size="small"
												className="h-3.5 w-3.5"
											/>
											<Input.Input
												ref={nameInputRef}
												id="propertyName"
												placeholder="e.g., first_name, company_plan"
												value={propertyName}
												onChange={handleNameChange}
												onBlur={handleSlugify}
												disabled={isCreating}
												autoComplete="off"
												spellCheck={false}
											/>
										</Input.Wrapper>
									</Input.Root>
									{nameError ? (
										<p className="text-error-base text-xs">{nameError}</p>
									) : (
										<p className="text-text-sub-600 text-xs">
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
											const isSelected = propertyType === opt.value;
											return (
												<button
													key={opt.value}
													type="button"
													onClick={() => setPropertyType(opt.value)}
													disabled={isCreating}
													className={cn(
														"flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition-all duration-150",
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
														{isSelected && (
															<div className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary-base">
																<Icon
																	name="check"
																	className="h-2 w-2 text-white"
																/>
															</div>
														)}
													</div>
													<div>
														<p className="font-semibold text-text-strong-950 text-xs">
															{opt.label}
														</p>
														<p className="text-[10px] text-text-sub-600">
															{opt.description}
														</p>
													</div>
												</button>
											);
										})}
									</div>
								</div>

								{/* Default Value */}
								<div className="flex flex-col gap-1.5">
									<Label.Root htmlFor="defaultValue">Default Value</Label.Root>
									<Input.Root size="small">
										<Input.Wrapper>
											<Input.Input
												id="defaultValue"
												placeholder={
													propertyType === "number"
														? "e.g., 0"
														: "e.g., unknown"
												}
												value={defaultValue}
												onChange={(e) => setDefaultValue(e.target.value)}
												disabled={isCreating}
												inputMode={
													propertyType === "number" ? "numeric" : "text"
												}
											/>
										</Input.Wrapper>
									</Input.Root>
									<p className="text-text-sub-600 text-xs">
										Used when a contact doesn&apos;t have this property set
									</p>
								</div>
							</div>

							{showPreview && (
								<div className="flex flex-col gap-3">
									<p className="font-medium text-[10px] text-text-sub-600 uppercase tracking-widest">
										Live preview
									</p>

									{/* Property card */}
									<div className="rounded-xl border border-stroke-soft-100 bg-bg-soft-200/20 p-4 dark:border-stroke-soft-100/30 dark:bg-bg-soft-200/10">
										<div className="mb-3 flex items-center gap-2.5">
											<div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-neutral-600 to-neutral-500 shadow-sm">
												<Icon name="tag" className="h-3.5 w-3.5 text-white" />
											</div>
											<div>
												<p className="font-semibold text-text-strong-950 text-xs">
													{previewName}
												</p>
												<span
													className={cn(
														"mt-0.5 inline-flex items-center rounded-md border-[1px] px-[5px] py-px font-medium text-[9px]",
														selectedType.badgeClass,
													)}
												>
													{selectedType.label}
												</span>
											</div>
										</div>

										<div className="divide-y divide-stroke-soft-100 rounded-lg border border-stroke-soft-100 bg-bg-white-0 dark:divide-stroke-soft-100/30 dark:border-stroke-soft-100/30 dark:bg-bg-weak-50/30">
											<div className="flex items-center justify-between px-3 py-2">
												<span className="font-medium text-[11px] text-text-sub-600">
													Name
												</span>
												<span className="font-mono font-semibold text-[11px] text-text-strong-950">
													{previewName}
												</span>
											</div>
											<div className="flex items-center justify-between px-3 py-2">
												<span className="font-medium text-[11px] text-text-sub-600">
													Type
												</span>
												<span
													className={cn(
														"inline-flex items-center rounded-md border-[1px] px-[5px] py-px font-medium text-[9px]",
														selectedType.badgeClass,
													)}
												>
													{selectedType.label}
												</span>
											</div>
											<div className="flex items-center justify-between px-3 py-2">
												<span className="font-medium text-[11px] text-text-sub-600">
													Default
												</span>
												<span className="font-medium font-mono text-[11px] text-text-strong-950">
													{previewDefault ?? (
														<span className="text-text-soft-400">—</span>
													)}
												</span>
											</div>
										</div>
									</div>

									{/* JSON snippet */}
									<div className="rounded-xl border border-stroke-soft-100 bg-bg-soft-200/20 p-4 dark:border-stroke-soft-100/30 dark:bg-bg-soft-200/10">
										<p className="mb-2 font-medium text-[10px] text-text-sub-600">
											Contact record snippet
										</p>
										<pre className="overflow-x-auto rounded-lg bg-bg-weak-50 p-2.5 font-mono text-[10px] text-text-strong-950 leading-relaxed dark:bg-bg-weak-50/50">
											<span className="text-text-sub-600">{"{"}</span>
											{"\n"}
											{"  "}
											<span className="text-primary-base">
												&quot;{previewName}&quot;
											</span>
											<span className="text-text-sub-600">: </span>
											{previewDefault ? (
												propertyType === "number" ? (
													<span className="text-violet-500">
														{previewDefault}
													</span>
												) : (
													<span className="text-success-base">
														&quot;{previewDefault}&quot;
													</span>
												)
											) : (
												<span className="text-text-soft-400">null</span>
											)}
											{"\n"}
											<span className="text-text-sub-600">{"}"}</span>
										</pre>
									</div>
								</div>
							)}
						</Modal.Body>

						{/* Footer */}
						<Modal.Footer className="mt-2 flex items-center justify-end gap-3 border-stroke-soft-100/50">
							<Button.Root
								type="button"
								variant="neutral"
								mode="stroke"
								size="xsmall"
								onClick={() => handleOpenChange(false)}
								disabled={isCreating}
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
								{isCreating ? (
									<>
										<Spinner size={14} color="currentColor" />
										Creating…
									</>
								) : (
									<>
										Add Property
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
