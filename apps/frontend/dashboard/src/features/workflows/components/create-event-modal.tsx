"use client";

import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { FieldError, useFieldError } from "@reloop/ui/field-error";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";
import { queryKeys } from "#/lib/query-keys";
import {
	type CustomEvent,
	createCustomEvent,
	updateCustomEvent,
} from "../hooks/use-custom-events-api";
import {
	AutomationModalFrame,
	type AutomationModalStatus,
} from "./automation-modal-frame";
import { StepIcon } from "./step-icon";

const EMPTY_TRIGGER_ERROR = "Please enter a trigger key.";

type PropertyDraft = {
	id: string;
	name: string;
	propertyType: "string" | "number" | "boolean";
	/** Used when a tracked event leaves this property out. Empty = no default. */
	defaultValue: string;
	// Not editable here, but kept so saving doesn't wipe them.
	required?: boolean;
	description?: string | null;
};

const newPropertyDraft = (name = ""): PropertyDraft => ({
	id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
	name,
	propertyType: "string",
	defaultValue: "",
});

/** Why a default can't be stored for this type, if it can't. */
const defaultValueError = (p: PropertyDraft) => {
	const value = p.defaultValue.trim();
	if (!value) return null;
	if (p.propertyType === "number" && !Number.isFinite(Number(value))) {
		return `Default for "${p.name.trim()}" must be a number`;
	}
	if (p.propertyType === "boolean" && value !== "true" && value !== "false") {
		return `Default for "${p.name.trim()}" must be true or false`;
	}
	return null;
};

const DEFAULT_PLACEHOLDER: Record<PropertyDraft["propertyType"], string> = {
	string: "Default",
	number: "0",
	boolean: "true / false",
};

const TRIGGER_PREFIX = "trigger.";

const PROPERTY_TYPE_OPTIONS: Array<{
	value: PropertyDraft["propertyType"];
	label: string;
}> = [
	{ value: "string", label: "String" },
	{ value: "number", label: "Number" },
	{ value: "boolean", label: "Boolean" },
];

const slugifySuffix = (value: string) =>
	value
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9_.-]+/g, ".")
		.replace(/^\.+|\.+$/g, "");

const isValidPropertyName = (name: string) =>
	/^[a-zA-Z][a-zA-Z0-9_]*$/.test(name);

/** String / Number / Boolean picker, styled like the other menus (sliding hover pill). */
function PropertyTypeSelect({
	value,
	disabled,
	onChange,
}: {
	value: PropertyDraft["propertyType"];
	disabled?: boolean;
	onChange: (value: PropertyDraft["propertyType"]) => void;
}) {
	const [hoverIdx, setHoverIdx] = useState<number | undefined>();
	const itemRefs = useRef<HTMLElement[]>([]);
	const currentTab = itemRefs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();
	const label =
		PROPERTY_TYPE_OPTIONS.find((opt) => opt.value === value)?.label ?? "String";

	return (
		<Dropdown.Root onOpenChange={(open) => !open && setHoverIdx(undefined)}>
			<Dropdown.Trigger asChild>
				<button
					type="button"
					disabled={disabled}
					className="group/type inline-flex h-7 shrink-0 items-center gap-1 rounded-lg border border-stroke-soft-200/70 bg-bg-weak-50 pr-1.5 pl-2.5 font-medium text-text-sub-600 text-xs outline-none transition-colors duration-150 hover:bg-bg-soft-200/60 hover:text-text-strong-950 focus-visible:border-text-strong-950 disabled:opacity-50 data-[state=open]:text-text-strong-950 dark:border-white/[0.06] dark:bg-white/[0.04] dark:data-[state=open]:bg-white/[0.08] dark:hover:bg-white/[0.08]"
				>
					{label}
					<Icon
						name="chevron-down"
						className="h-3 w-3 text-text-soft-400 transition-transform duration-200 group-data-[state=open]/type:rotate-180"
					/>
				</button>
			</Dropdown.Trigger>
			<Dropdown.Content
				align="end"
				sideOffset={4}
				className="w-32 overflow-hidden rounded-2xl p-1.5"
			>
				<div className="relative">
					{PROPERTY_TYPE_OPTIONS.map((opt, idx) => (
						<Dropdown.Item
							key={opt.value}
							ref={(el) => {
								if (el) itemRefs.current[idx] = el;
							}}
							onPointerEnter={() => setHoverIdx(idx)}
							onPointerLeave={() => setHoverIdx(undefined)}
							// Arrow keys move the same pill as the pointer.
							onFocus={() => setHoverIdx(idx)}
							onSelect={() => onChange(opt.value)}
							className={cn(
								// The sliding pill is the only highlight: drop the item's own one.
								"relative z-10 flex cursor-pointer items-center justify-between gap-2 rounded-xl px-2.5 py-1.5 font-medium text-xs outline-none data-[highlighted]:bg-transparent",
								opt.value === value
									? "text-text-strong-950"
									: "text-text-sub-600 hover:text-text-strong-950",
								!currentRect && hoverIdx === idx && "bg-neutral-alpha-10",
							)}
						>
							{opt.label}
							{opt.value === value ? (
								<StepIcon name="check" className="size-3.5" />
							) : null}
						</Dropdown.Item>
					))}
					<AnimatedHoverBackground rect={currentRect} tabElement={currentTab} />
				</div>
			</Dropdown.Content>
		</Dropdown.Root>
	);
}

interface CreateEventModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	event?: CustomEvent | null;
	initialKey?: string;
	/** Editing: start with this property added (unless the event already has it). */
	initialProperty?: string;
	onCreated?: (event: CustomEvent) => void;
	onUpdated?: (event: CustomEvent) => void;
}

const suffixFromKey = (key: string) =>
	key.startsWith(TRIGGER_PREFIX) ? key.slice(TRIGGER_PREFIX.length) : key;

export function CreateEventModal({
	open,
	onOpenChange,
	event,
	initialKey,
	initialProperty,
	onCreated,
	onUpdated,
}: CreateEventModalProps) {
	const queryClient = useQueryClient();
	const [keySuffix, setKeySuffix] = useState("");
	const [properties, setProperties] = useState<PropertyDraft[]>([]);
	const [status, setStatus] = useState<AutomationModalStatus>("idle");
	const triggerField = useFieldError();
	const clearTriggerError = triggerField.clear;

	const handleClose = () => {
		if (status !== "idle") return;
		onOpenChange(false);
	};

	const handleAddProperty = () => {
		setProperties((prev) => [...prev, newPropertyDraft()]);
	};

	const handleUpdateProperty = (id: string, patch: Partial<PropertyDraft>) => {
		setProperties((prev) =>
			prev.map((p) => (p.id === id ? { ...p, ...patch } : p)),
		);
	};

	const handleRemoveProperty = (id: string) => {
		setProperties((prev) => prev.filter((p) => p.id !== id));
	};

	const buildKey = (): string | undefined => {
		const raw = keySuffix.trim();
		if (!raw) return undefined;
		let suffix = raw.toLowerCase();
		if (suffix.startsWith(TRIGGER_PREFIX)) {
			suffix = suffix.slice(TRIGGER_PREFIX.length);
		}
		suffix = slugifySuffix(suffix);
		if (!suffix) return undefined;
		return `${TRIGGER_PREFIX}${suffix}`;
	};

	const isEdit = !!event;

	const handleSubmit = async () => {
		if (status !== "idle") return;
		const fullKey = buildKey();
		const rawSuffix = keySuffix.trim();
		if (!rawSuffix || !fullKey) {
			triggerField.show(EMPTY_TRIGGER_ERROR);
			return;
		}

		// Validate properties
		const seen = new Set<string>();
		for (const p of properties) {
			const n = p.name.trim();
			if (!n) {
				toast.error("Property names cannot be empty");
				return;
			}
			if (!isValidPropertyName(n)) {
				toast.error(
					`Invalid property name "${n}": use letters, numbers, underscores, starting with a letter`,
				);
				return;
			}
			if (seen.has(n)) {
				toast.error(`Duplicate property name "${n}"`);
				return;
			}
			seen.add(n);
			const defaultError = defaultValueError(p);
			if (defaultError) {
				toast.error(defaultError);
				return;
			}
		}

		triggerField.clear();
		setStatus("busy");
		try {
			const normalizedProps = properties.map((p) => ({
				name: p.name.trim(),
				propertyType: p.propertyType,
				defaultValue: p.defaultValue.trim() || null,
				required: p.required,
				description: p.description,
			}));

			if (event) {
				const updated = await updateCustomEvent(event.id, {
					name: rawSuffix,
					properties: normalizedProps,
				});
				await queryClient.invalidateQueries({
					queryKey: queryKeys.workflows.events(),
				});
				await queryClient.invalidateQueries({
					queryKey: queryKeys.workflows.event(event.id),
				});
				setStatus("success");
				setTimeout(() => {
					onUpdated?.(updated);
					onOpenChange(false);
					triggerField.clear();
					setStatus("idle");
				}, 450);
				return;
			}

			const created = await createCustomEvent({
				name: rawSuffix,
				key: fullKey,
				properties: normalizedProps.length > 0 ? normalizedProps : undefined,
			});
			await queryClient.invalidateQueries({
				queryKey: queryKeys.workflows.events(),
			});
			setStatus("success");
			setTimeout(() => {
				onCreated?.(created);
				onOpenChange(false);
				setKeySuffix("");
				setProperties([]);
				triggerField.clear();
				setStatus("idle");
			}, 450);
		} catch (err) {
			setStatus("idle");
			const message =
				err instanceof Error
					? err.message
					: isEdit
						? "Failed to update trigger"
						: "Failed to create trigger";
			triggerField.show(message);
			toast.error(message);
		}
	};

	useHotkeys(
		"enter",
		(e) => {
			e.preventDefault();
			if (open && status === "idle") void handleSubmit();
		},
		{ enableOnFormTags: ["INPUT"], enabled: open },
		[open, status, keySuffix, properties],
	);

	useHotkeys(
		"escape",
		() => {
			if (open && status === "idle") handleClose();
		},
		{ enableOnFormTags: ["INPUT"], enabled: open },
		[open, status],
	);

	useEffect(() => {
		if (open) {
			if (event) {
				setKeySuffix(suffixFromKey(event.key));
				const existing = event.properties.map((p) => ({
					id: p.id,
					name: p.name,
					propertyType: p.propertyType,
					defaultValue: p.defaultValue ?? "",
					required: p.required,
					description: p.description,
				}));
				const extra = initialProperty?.trim();
				setProperties(
					extra && !existing.some((p) => p.name === extra)
						? [...existing, newPropertyDraft(extra)]
						: existing,
				);
			} else if (initialKey?.trim()) {
				setKeySuffix(suffixFromKey(initialKey.trim()));
			}
			return;
		}
		const timer = setTimeout(() => {
			setKeySuffix("");
			setProperties([]);
			clearTriggerError();
			setStatus("idle");
		}, 300);
		return () => clearTimeout(timer);
	}, [open, event, initialKey, initialProperty, clearTriggerError]);

	return (
		<AutomationModalFrame
			open={open}
			title={isEdit ? "Edit trigger" : "Create trigger"}
			icon="zap"
			status={status}
			onSubmit={() => void handleSubmit()}
			onClose={handleClose}
			submitLabel={isEdit ? "Save changes" : "Create trigger"}
			busyLabel={isEdit ? "Saving..." : "Creating..."}
			successLabel={isEdit ? "Saved" : "Created"}
		>
			<div className="space-y-4 px-6 pb-7">
				<div className="space-y-1.5">
					<Label.Root
						htmlFor="evt-trigger"
						className="font-medium text-text-strong-950 text-xs"
					>
						Trigger
						<Label.Asterisk />
					</Label.Root>
					<FieldError field={triggerField}>
						<Input.Root size="medium" hasError={triggerField.hasError}>
							<Input.Wrapper>
								<Input.Input
									id="evt-trigger"
									{...triggerField.controlProps}
									placeholder="e.g. signup"
									value={keySuffix}
									onChange={(e) => {
										setKeySuffix(e.target.value);
										if (triggerField.hasError) triggerField.clear();
									}}
									disabled={status !== "idle" || isEdit}
								/>
							</Input.Wrapper>
						</Input.Root>
					</FieldError>
				</div>

				<div className="space-y-2">
					<Label.Root className="font-medium text-text-strong-950 text-xs">
						Properties
					</Label.Root>

					{properties.length === 0 ? (
						<p className="rounded-lg border border-stroke-soft-200 border-dashed bg-bg-weak-50/30 px-3 py-3 text-center text-text-sub-600 text-xs dark:border-stroke-soft-100/40">
							No properties yet. Add dynamic properties like contact properties.
							Each has a name, a type and an optional default value.
						</p>
					) : (
						<div className="space-y-2">
							{properties.map((p) => (
								<div
									key={p.id}
									// The delete button gets its own fixed column and sits centered in it.
									className="grid grid-cols-[minmax(0,1fr)_2.75rem] items-center rounded-xl bg-bg-weak-50 p-0.5 dark:bg-bg-weak-50/40"
								>
									<div className="flex min-w-0 items-center gap-2 rounded-[10px] border border-stroke-soft-200/80 bg-bg-white-0 py-1 pr-1.5 pl-3 transition-colors focus-within:border-text-strong-950 focus-within:ring-4 focus-within:ring-text-strong-950/10 dark:border-stroke-soft-100/40 dark:bg-bg-white-0/5">
										<input
											placeholder="plan"
											value={p.name}
											onChange={(e) =>
												handleUpdateProperty(p.id, {
													name: e.target.value,
												})
											}
											disabled={status !== "idle"}
											className="h-7 min-w-0 flex-1 bg-transparent font-mono text-text-strong-950 text-xs outline-none placeholder:text-text-soft-400 disabled:opacity-50"
										/>
										<span
											aria-hidden
											className="h-4 w-px shrink-0 bg-stroke-soft-200 dark:bg-stroke-soft-100/40"
										/>
										<input
											aria-label={`Default value for ${p.name || "property"}`}
											placeholder={DEFAULT_PLACEHOLDER[p.propertyType]}
											value={p.defaultValue}
											inputMode={
												p.propertyType === "number" ? "decimal" : undefined
											}
											onChange={(e) =>
												handleUpdateProperty(p.id, {
													defaultValue: e.target.value,
												})
											}
											disabled={status !== "idle"}
											className="h-7 w-24 min-w-0 shrink-0 bg-transparent font-mono text-text-strong-950 text-xs outline-none placeholder:text-text-soft-400 disabled:opacity-50"
										/>
										<PropertyTypeSelect
											value={p.propertyType}
											disabled={status !== "idle"}
											onChange={(propertyType) =>
												handleUpdateProperty(p.id, { propertyType })
											}
										/>
									</div>
									<button
										type="button"
										onClick={() => handleRemoveProperty(p.id)}
										disabled={status !== "idle"}
										className="flex size-8 items-center justify-center justify-self-center rounded-[10px] text-text-sub-600 transition-colors hover:bg-error-lighter hover:text-error-base disabled:opacity-50 dark:hover:bg-error-base/10 dark:hover:text-error-base"
										aria-label="Remove property"
										title="Remove property"
									>
										<Icon name="trash" className="size-4" />
									</button>
								</div>
							))}
						</div>
					)}

					<div className="pt-0.5">
						<button
							type="button"
							onClick={handleAddProperty}
							disabled={status !== "idle"}
							className="inline-flex items-center gap-1 rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-2.5 py-1 font-medium text-text-strong-950 text-xs hover:bg-bg-weak-50 disabled:opacity-50 dark:border-stroke-soft-100/40 dark:bg-bg-white-0/5 dark:hover:bg-bg-white-0/10"
						>
							<Icon name="plus" className="h-3 w-3" />
							Add property
						</button>
					</div>
				</div>
			</div>
		</AutomationModalFrame>
	);
}
