"use client";

import * as Dropdown from "@reloop/ui/dropdown";
import { FieldError, useFieldError } from "@reloop/ui/field-error";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
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

const EMPTY_TRIGGER_ERROR = "Please enter a trigger key.";

type PropertyDraft = {
	id: string;
	name: string;
	propertyType: "string" | "number" | "boolean";
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

interface CreateEventModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	event?: CustomEvent | null;
	onCreated?: (event: CustomEvent) => void;
	onUpdated?: (event: CustomEvent) => void;
}

const suffixFromKey = (key: string) =>
	key.startsWith(TRIGGER_PREFIX) ? key.slice(TRIGGER_PREFIX.length) : key;

export function CreateEventModal({
	open,
	onOpenChange,
	event,
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
		setProperties((prev) => [
			...prev,
			{
				id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
				name: "",
				propertyType: "string",
			},
		]);
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
		}

		triggerField.clear();
		setStatus("busy");
		try {
			const normalizedProps = properties.map((p) => ({
				name: p.name.trim(),
				propertyType: p.propertyType,
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
				setProperties(
					event.properties.map((p) => ({
						id: p.id,
						name: p.name,
						propertyType: p.propertyType,
					})),
				);
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
	}, [open, event, clearTriggerError]);

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
							No properties yet. Add dynamic properties like contact properties
							— each has a name and a type (no default values).
						</p>
					) : (
						<div className="space-y-2">
							{properties.map((p) => (
								<div
									key={p.id}
									className="flex items-center gap-2 rounded-xl bg-bg-weak-50 p-0.5 dark:bg-bg-weak-50/40"
								>
									<div className="flex flex-1 items-center gap-2 rounded-[10px] border border-stroke-soft-200/80 bg-bg-white-0 py-1 pr-1.5 pl-3 transition-colors focus-within:border-primary-base focus-within:ring-4 focus-within:ring-primary-base/10 dark:border-stroke-soft-100/40 dark:bg-bg-white-0/5">
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
										<Dropdown.Root>
											<Dropdown.Trigger asChild>
												<button
													type="button"
													disabled={status !== "idle"}
													className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md border border-stroke-soft-200/70 bg-bg-weak-50 px-2 font-medium text-text-strong-950 text-xs transition-colors hover:bg-bg-soft-200 focus:outline-none dark:border-stroke-soft-100/40 dark:bg-white/10 dark:hover:bg-white/15"
												>
													<span>
														{PROPERTY_TYPE_OPTIONS.find(
															(opt) => opt.value === p.propertyType,
														)?.label ?? "String"}
													</span>
													<Icon
														name="chevron-down"
														className="h-3 w-3 text-text-sub-600"
													/>
												</button>
											</Dropdown.Trigger>
											<Dropdown.Content
												align="end"
												className="w-32 rounded-xl p-1 shadow-regular-md"
											>
												{PROPERTY_TYPE_OPTIONS.map((opt) => (
													<Dropdown.Item
														key={opt.value}
														onClick={() =>
															handleUpdateProperty(p.id, {
																propertyType: opt.value,
															})
														}
														className="flex items-center justify-between py-1.5 text-xs"
													>
														<span>{opt.label}</span>
														{p.propertyType === opt.value ? (
															<Icon
																name="check"
																className="h-3.5 w-3.5 text-text-strong-950"
															/>
														) : null}
													</Dropdown.Item>
												))}
											</Dropdown.Content>
										</Dropdown.Root>
									</div>
									<button
										type="button"
										onClick={() => handleRemoveProperty(p.id)}
										disabled={status !== "idle"}
										className="flex size-8 shrink-0 items-center justify-center rounded-[10px] text-text-sub-600 transition-colors hover:bg-error-lighter hover:text-error-base disabled:opacity-50 dark:hover:bg-error-base/10 dark:hover:text-error-base"
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
