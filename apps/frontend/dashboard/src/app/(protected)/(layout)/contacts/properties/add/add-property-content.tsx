"use client";

import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import Spinner from "@reloop/ui/spinner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { KbdCommand } from "@reloop/ui/kbd-command";
import { KbdEnter } from "@reloop/ui/kbd-enter";

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
		description: "Free-form text — names, emails, plan labels",
		color: "text-primary-base",
		badgeClass:
			"border border-primary-base text-primary-base bg-primary-light/20",
	},
	{
		value: "number",
		label: "Number",
		icon: "hash",
		description: "Integer or decimal — counts, scores, amounts",
		color: "text-violet-600",
		badgeClass: "border border-violet-500 text-violet-600 bg-violet-100/20",
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
		return "Only letters, numbers, and underscores allowed";
	if (!/^[a-zA-Z_]/.test(name))
		return "Must start with a letter or underscore";
	return "";
};

export const AddPropertyContent = () => {
	const router = useRouter();
	const { mutate } = useSWRConfig();

	const [propertyName, setPropertyName] = useState("");
	const [propertyType, setPropertyType] = useState<PropertyType>("string");
	const [defaultValue, setDefaultValue] = useState("");
	const [nameError, setNameError] = useState("");
	const [isCreating, setIsCreating] = useState(false);

	const selectedType = TYPE_OPTIONS.find((t) => t.value === propertyType)!;

	const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const raw = e.target.value;
		setPropertyName(raw);
		setNameError(validatePropertyName(raw));
	};

	const handleSlugify = () => {
		const slugged = slugify(propertyName);
		setPropertyName(slugged);
		setNameError(validatePropertyName(slugged));
	};

	const canSubmit = !!propertyName && !nameError && !isCreating;

	const handleSubmit = async (e?: React.FormEvent) => {
		e?.preventDefault();
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
			await mutate(
				(key: string) =>
					typeof key === "string" &&
					key.includes("/api/contacts/v1/properties/list"),
			);
			router.push("/contacts/properties");
		} catch (error) {
			console.error("Failed to create property:", error);
			toast.error(
				error instanceof Error ? error.message : "Failed to create property",
			);
		} finally {
			setIsCreating(false);
		}
	};

	useHotkeys(
		"mod+enter",
		(e) => {
			e.preventDefault();
			if (canSubmit) handleSubmit();
		},
		{ enableOnFormTags: true },
		[canSubmit, propertyName, propertyType, defaultValue],
	);

	useHotkeys(
		"escape",
		() => router.back(),
		{ enableOnFormTags: true },
		[],
	);

	const previewName = propertyName || "property_name";
	const previewDefault = defaultValue || null;

	return (
		<div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
			{/* ── Left: Form ─────────────────────────────────────── */}
			<form onSubmit={handleSubmit} className="flex flex-col gap-6">
				{/* Property Name */}
				<div className="flex flex-col gap-1.5">
					<Label.Root htmlFor="propertyName">
						Property Name
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
								id="propertyName"
								placeholder="e.g., first_name, company_plan"
								value={propertyName}
								onChange={handleNameChange}
								onBlur={handleSlugify}
								disabled={isCreating}
								autoFocus
								autoComplete="off"
								spellCheck={false}
							/>
						</Input.Wrapper>
					</Input.Root>
					{nameError ? (
						<p className="text-error-base text-xs">{nameError}</p>
					) : (
						<p className="text-text-sub-600 text-xs">
							Letters, numbers, and underscores only — spaces auto-convert on
							blur
						</p>
					)}
				</div>

				{/* Type — Card picker */}
				<div className="flex flex-col gap-2">
					<Label.Root>
						Type
						<Label.Asterisk />
					</Label.Root>
					<div className="grid grid-cols-2 gap-2.5">
						{TYPE_OPTIONS.map((opt) => {
							const isSelected = propertyType === opt.value;
							return (
								<button
									key={opt.value}
									type="button"
									onClick={() => setPropertyType(opt.value)}
									disabled={isCreating}
									className={cn(
										"flex flex-col items-start gap-2 rounded-xl border p-3.5 text-left transition-all duration-150",
										isSelected
											? "border-primary-base bg-primary-light/10 ring-1 ring-primary-base/30"
											: "border-stroke-soft-100 bg-bg-soft-200/20 hover:border-stroke-soft-200 hover:bg-bg-soft-200/40 dark:border-stroke-soft-100/40 dark:bg-bg-soft-200/10",
									)}
								>
									<div
										className={cn(
											"flex h-7 w-7 items-center justify-center rounded-lg border",
											isSelected
												? "border-primary-base/30 bg-primary-light/20"
												: "border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/40",
										)}
									>
										<Icon
											name={opt.icon as Parameters<typeof Icon>[0]["name"]}
											className={cn(
												"h-3.5 w-3.5",
												isSelected ? opt.color : "text-text-sub-600",
											)}
										/>
									</div>
									<div>
										<p
											className={cn(
												"font-semibold text-sm",
												isSelected
													? "text-text-strong-950"
													: "text-text-strong-950",
											)}
										>
											{opt.label}
										</p>
										<p className="mt-0.5 text-[11px] text-text-sub-600 leading-relaxed">
											{opt.description}
										</p>
									</div>
									{isSelected && (
										<div className="ml-auto mt-[-26px] flex h-4 w-4 items-center justify-center rounded-full bg-primary-base self-end">
											<Icon
												name="check"
												className="h-2.5 w-2.5 text-white"
											/>
										</div>
									)}
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
								type={propertyType === "number" ? "text" : "text"}
								inputMode={propertyType === "number" ? "numeric" : "text"}
							/>
						</Input.Wrapper>
					</Input.Root>
					<p className="text-text-sub-600 text-xs">
						Used when a contact record doesn&apos;t have this property set
					</p>
				</div>

				{/* Footer */}
				<div className="flex items-center justify-between border-stroke-soft-100/60 border-t pt-5 dark:border-stroke-soft-100/20">
					<Button.Root
						type="button"
						variant="neutral"
						mode="stroke"
						size="xsmall"
						onClick={() => router.back()}
						disabled={isCreating}
					>
						Cancel
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
								Create Property
								<span className="inline-flex items-center gap-0.5">
									<KbdCommand />
									<KbdEnter />
								</span>
							</>
						)}
					</Button.Root>
				</div>
			</form>

			{/* ── Right: Live Preview ─────────────────────────────── */}
			<div className="flex flex-col gap-3 lg:sticky lg:top-6 lg:self-start">
				<p className="font-medium text-xs text-text-sub-600 uppercase tracking-widest">
					Live preview
				</p>

				{/* Property pill preview */}
				<div className="rounded-2xl border border-stroke-soft-100 bg-bg-soft-200/20 p-5 dark:border-stroke-soft-100/30 dark:bg-bg-soft-200/10">
					<div className="mb-4 flex items-center gap-2.5">
						<div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-neutral-600 to-neutral-500 shadow-sm">
							<Icon name="tag" className="h-4 w-4 text-white" />
						</div>
						<div>
							<p className="font-semibold text-sm text-text-strong-950">
								{previewName}
							</p>
							<span
								className={cn(
									"inline-flex items-center rounded-md border-[1px] px-[6px] py-0.5 font-medium text-[10px] mt-0.5",
									selectedType.badgeClass,
								)}
							>
								{selectedType.label}
							</span>
						</div>
					</div>

					{/* Property row preview */}
					<div className="rounded-xl border border-stroke-soft-100 bg-bg-white-0 divide-y divide-stroke-soft-100 dark:border-stroke-soft-100/30 dark:bg-bg-weak-50/30 dark:divide-stroke-soft-100/30">
						<div className="flex items-center justify-between px-3.5 py-2.5">
							<span className="text-xs font-medium text-text-sub-600">
								Property name
							</span>
							<span className="font-semibold text-xs text-text-strong-950 font-mono">
								{previewName}
							</span>
						</div>
						<div className="flex items-center justify-between px-3.5 py-2.5">
							<span className="text-xs font-medium text-text-sub-600">
								Type
							</span>
							<span
								className={cn(
									"inline-flex items-center rounded-md border-[1px] px-[6px] py-0.5 font-medium text-[10px]",
									selectedType.badgeClass,
								)}
							>
								{selectedType.label}
							</span>
						</div>
						<div className="flex items-center justify-between px-3.5 py-2.5">
							<span className="text-xs font-medium text-text-sub-600">
								Default
							</span>
							<span className="font-medium text-xs text-text-strong-950 font-mono">
								{previewDefault ?? (
									<span className="text-text-soft-400">—</span>
								)}
							</span>
						</div>
					</div>
				</div>

				{/* JSON snippet preview */}
				<div className="rounded-2xl border border-stroke-soft-100 bg-bg-soft-200/20 p-5 dark:border-stroke-soft-100/30 dark:bg-bg-soft-200/10">
					<p className="mb-3 text-xs font-medium text-text-sub-600">
						Contact record snippet
					</p>
					<pre className="overflow-x-auto rounded-lg bg-bg-weak-50 p-3 font-mono text-[11px] leading-relaxed text-text-strong-950 dark:bg-bg-weak-50/50">
						<span className="text-text-sub-600">{"{"}</span>
						{"\n"}
						{"  "}
						<span className="text-primary-base">&quot;{previewName}&quot;</span>
						<span className="text-text-sub-600">: </span>
						{previewDefault ? (
							propertyType === "number" ? (
								<span className="text-violet-500">{previewDefault}</span>
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

				{/* Keyboard shortcut hint */}
				<div className="flex items-center gap-2 rounded-xl border border-stroke-soft-100/60 bg-bg-soft-200/20 px-3.5 py-2.5 dark:border-stroke-soft-100/20 dark:bg-bg-soft-200/10">
					<Icon
						name="keyboard"
						className="h-3.5 w-3.5 flex-shrink-0 text-text-sub-600"
					/>
					<p className="text-[11px] text-text-sub-600">
						Press{" "}
						<span className="font-semibold text-text-strong-950">⌘ + Enter</span>{" "}
						to create ·{" "}
						<span className="font-semibold text-text-strong-950">Esc</span> to
						cancel
					</p>
				</div>
			</div>
		</div>
	);
};
