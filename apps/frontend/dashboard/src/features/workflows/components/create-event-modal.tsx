"use client";

import { cn } from "@reloop/ui/cn";
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
} from "../hooks/use-custom-events-api";
import {
	AutomationModalFrame,
	type AutomationModalStatus,
} from "./automation-modal-frame";

const EMPTY_NAME_ERROR = "Please enter an event name.";

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
		.replace(/[^a-z0-9]+/g, ".")
		.replace(/^\.+|\.+$/g, "");

const isValidPropertyName = (name: string) =>
	/^[a-zA-Z][a-zA-Z0-9_]*$/.test(name);

interface CreateEventModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onCreated?: (event: CustomEvent) => void;
}

export function CreateEventModal({
	open,
	onOpenChange,
	onCreated,
}: CreateEventModalProps) {
	const queryClient = useQueryClient();
	const [name, setName] = useState("");
	const [keySuffix, setKeySuffix] = useState("");
	const [properties, setProperties] = useState<PropertyDraft[]>([]);
	const [status, setStatus] = useState<AutomationModalStatus>("idle");
	const nameField = useFieldError();
	const clearNameError = nameField.clear;

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

	const handleUpdateProperty = (
		id: string,
		patch: Partial<PropertyDraft>,
	) => {
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

	const handleSubmit = async () => {
		if (status !== "idle") return;
		const trimmed = name.trim();
		if (!trimmed) {
			nameField.show(EMPTY_NAME_ERROR);
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

		nameField.clear();
		setStatus("busy");
		try {
			const key = buildKey();
			const normalizedProps =
				properties.length > 0
					? properties.map((p) => ({
							name: p.name.trim(),
							propertyType: p.propertyType,
						}))
					: undefined;

			const created = await createCustomEvent({
				name: trimmed,
				key,
				properties: normalizedProps,
			});
			await queryClient.invalidateQueries({
				queryKey: queryKeys.workflows.events(),
			});
			setStatus("success");
			setTimeout(() => {
				onCreated?.(created);
				onOpenChange(false);
				setName("");
				setKeySuffix("");
				setProperties([]);
				nameField.clear();
				setStatus("idle");
			}, 450);
		} catch (err) {
			setStatus("idle");
			const message =
				err instanceof Error ? err.message : "Failed to create event";
			nameField.show(message);
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
		[open, status, name, keySuffix, properties],
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
		if (!open) {
			const timer = setTimeout(() => {
				setName("");
				setKeySuffix("");
				setProperties([]);
				clearNameError();
				setStatus("idle");
			}, 300);
			return () => clearTimeout(timer);
		}
	}, [open, clearNameError]);

	const previewKey = (() => {
		const k = buildKey();
		if (k) return k;
		if (name.trim()) {
			const slug = slugifySuffix(name.trim());
			return `${TRIGGER_PREFIX}${slug || "event"}`;
		}
		return `${TRIGGER_PREFIX}...`;
	})();

	return (
		<AutomationModalFrame
			open={open}
			title="Create trigger"
			icon="zap"
			status={status}
			onSubmit={() => void handleSubmit()}
			onClose={handleClose}
			submitLabel="Create trigger"
			busyLabel="Creating..."
			successLabel="Created"
		>
			<div className="space-y-4 px-6 pb-7">
				<div className="space-y-1.5">
					<Label.Root
						htmlFor="evt-name"
						className="font-medium text-text-strong-950 text-xs"
					>
						Name
						<Label.Asterisk />
					</Label.Root>
					<FieldError
						field={nameField}
						hint="Shown on the trigger step. Use something you will recognize."
					>
						<Input.Root size="medium" hasError={nameField.hasError}>
							<Input.Wrapper>
								<Input.Input
									id="evt-name"
									{...nameField.controlProps}
									placeholder="e.g. User signed up"
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
				<div className="space-y-1.5">
					<Label.Root
						htmlFor="evt-key"
						className="font-medium text-text-strong-950 text-xs"
					>
						Key
						<Label.Sub className="ml-1 text-xs">(optional)</Label.Sub>
					</Label.Root>
					<div className="flex items-stretch overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 focus-within:border-primary-base focus-within:ring-4 focus-within:ring-primary-base/10 dark:border-stroke-soft-100/40">
						<span className="flex items-center bg-bg-weak-50 px-3 font-mono text-sm text-text-sub-600 dark:bg-bg-weak-50/40">
							{TRIGGER_PREFIX}
						</span>
						<input
							id="evt-key"
							placeholder="signup"
							value={keySuffix}
							onChange={(e) => setKeySuffix(e.target.value)}
							disabled={status !== "idle"}
							className="flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-text-soft-400 disabled:opacity-50"
						/>
					</div>
					<p className="font-mono text-[11px] text-text-sub-600">
						Full key: {previewKey}
					</p>
					<p className="text-[11px] text-text-sub-600">
						Defaults from the name if you leave this blank. Only type after{" "}
						<code className="rounded bg-bg-weak-50 px-1 py-0.5 font-mono text-[11px] dark:bg-bg-weak-50/60">
							trigger.
						</code>
					</p>
				</div>

				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<Label.Root className="font-medium text-text-strong-950 text-xs">
							Properties
							<Label.Sub className="ml-1 text-xs">(optional)</Label.Sub>
						</Label.Root>
						<button
							type="button"
							onClick={handleAddProperty}
							disabled={status !== "idle"}
							className="inline-flex items-center gap-1 rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-2.5 py-1 text-xs font-medium text-text-strong-950 hover:bg-bg-weak-50 disabled:opacity-50 dark:border-stroke-soft-100/40"
						>
							<Icon name="plus" className="h-3 w-3" />
							Add property
						</button>
					</div>

					{properties.length === 0 ? (
						<p className="rounded-lg border border-dashed border-stroke-soft-200 bg-bg-weak-50/30 px-3 py-3 text-center text-xs text-text-sub-600 dark:border-stroke-soft-100/40">
							No properties yet. Add dynamic properties like contact properties
							— each has a name and a type (no default values).
						</p>
					) : (
						<div className="space-y-2">
							{properties.map((p) => (
								<div
									key={p.id}
									className="flex items-center gap-2 rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-2 dark:border-stroke-soft-100/40"
								>
									<div className="flex-1">
										<Input.Root size="medium" className="rounded-lg">
											<Input.Wrapper>
												<Input.Input
													placeholder="plan"
													value={p.name}
													onChange={(e) =>
														handleUpdateProperty(p.id, {
															name: e.target.value,
														})
													}
													disabled={status !== "idle"}
													className="font-mono text-xs"
												/>
											</Input.Wrapper>
										</Input.Root>
									</div>
									<div className="flex shrink-0 items-center gap-1 rounded-lg border border-stroke-soft-200 bg-bg-weak-50 p-0.5 dark:border-stroke-soft-100/40">
										{PROPERTY_TYPE_OPTIONS.map((opt) => (
											<button
												key={opt.value}
												type="button"
												disabled={status !== "idle"}
												onClick={() =>
													handleUpdateProperty(p.id, {
														propertyType: opt.value,
													})
												}
												className={cn(
													"rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
													p.propertyType === opt.value
														? "bg-bg-white-0 text-text-strong-950 shadow-sm dark:bg-bg-white-0/10"
														: "text-text-sub-600 hover:text-text-strong-950",
												)}
											>
												{opt.label}
											</button>
										))}
									</div>
									<button
										type="button"
										onClick={() => handleRemoveProperty(p.id)}
										disabled={status !== "idle"}
										className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950 disabled:opacity-50"
										aria-label="Remove property"
									>
										<Icon name="close" className="h-3.5 w-3.5" />
									</button>
								</div>
							))}
							<p className="text-[11px] text-text-sub-600">
								Types are enforced when tracking. No default values — missing
								properties stay empty unless required.
							</p>
						</div>
					)}
				</div>
			</div>
		</AutomationModalFrame>
	);
}
