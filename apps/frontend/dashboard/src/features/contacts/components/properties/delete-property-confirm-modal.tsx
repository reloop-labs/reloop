"use client";

import * as Badge from "@reloop/ui/badge";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import { AnimatePresence, motion } from "framer-motion";
import { useQueryState } from "nuqs";
import { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";
import {
	type Property,
	useInvalidateContacts,
} from "../../hooks/use-contacts-query";

const actionKbdOnBlueClassName =
	"border-white/25 bg-white/15 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]";

type DeleteState = "idle" | "deleting" | "success";

const getBadgeColor = (type: string) => {
	switch (type?.toLowerCase()) {
		case "string":
			return "blue";
		case "number":
			return "purple";
		default:
			return "gray";
	}
};

export function DeletePropertyConfirmModal({
	properties,
	selectedProperties = [],
	onClearSelection,
	onDeleteSuccess,
}: {
	properties: Property[];
	selectedProperties?: Property[];
	onClearSelection?: () => void;
	onDeleteSuccess?: (deletedName: string) => void;
}) {
	const [deleteId, setDeleteId] = useQueryState("delete");
	const [confirmationText, setConfirmationText] = useState("");
	const [deleteState, setDeleteState] = useState<DeleteState>("idle");
	const [nameCopied, setNameCopied] = useState(false);
	const inputRef = useRef<HTMLInputElement | null>(null);
	const invalidate = useInvalidateContacts();

	const isBulk = deleteId === "bulk" || deleteId === "selected";

	const targetPropertyRef = useRef<Property | null>(null);
	const currentProperty = properties.find((p) => p.id === deleteId);
	if (currentProperty) {
		targetPropertyRef.current = currentProperty;
	}
	const propertyToDelete = currentProperty || targetPropertyRef.current;

	const targetBulkPropertiesRef = useRef<Property[]>([]);
	if (isBulk && selectedProperties.length > 0) {
		targetBulkPropertiesRef.current = selectedProperties;
	}
	const bulkPropertiesToDelete = isBulk
		? selectedProperties.length > 0
			? selectedProperties
			: targetBulkPropertiesRef.current
		: [];

	const displayName = isBulk
		? `delete ${bulkPropertiesToDelete.length} propert${bulkPropertiesToDelete.length === 1 ? "y" : "ies"}`
		: propertyToDelete?.propertyName || "Unnamed property";

	const normalizedInput = confirmationText.trim().toLowerCase();
	const isConfirmed = isBulk
		? normalizedInput === displayName.toLowerCase() ||
			normalizedInput ===
				`delete ${bulkPropertiesToDelete.length} propert${bulkPropertiesToDelete.length === 1 ? "y" : "ies"}` ||
			normalizedInput === "delete"
		: confirmationText === displayName;

	const canDelete =
		isConfirmed &&
		deleteState === "idle" &&
		(isBulk ? bulkPropertiesToDelete.length > 0 : !!propertyToDelete);

	const handleCopyName = async () => {
		try {
			await navigator.clipboard.writeText(displayName);
			setNameCopied(true);
			setTimeout(() => setNameCopied(false), 1500);
		} catch {
			// silently fail
		}
	};

	const handleDelete = async () => {
		if (!canDelete) return;
		try {
			setDeleteState("deleting");
			if (isBulk) {
				let ok = 0;
				let failed = 0;
				for (const property of bulkPropertiesToDelete) {
					try {
						const response = await fetch(
							`/api/contacts/v1/properties/${property.id}`,
							{ method: "DELETE", credentials: "include" },
						);
						if (!response.ok) throw new Error("Failed");
						ok += 1;
					} catch {
						failed += 1;
					}
				}
				setDeleteState("success");
				await invalidate();

				setTimeout(() => {
					void setDeleteId(null);
					onClearSelection?.();
					onDeleteSuccess?.(`${ok} propert${ok === 1 ? "y" : "ies"}`);
					if (failed > 0) {
						toast.error(
							`${failed} propert${failed === 1 ? "y" : "ies"} failed to delete`,
						);
					}
					setTimeout(() => {
						setDeleteState("idle");
						setConfirmationText("");
						targetBulkPropertiesRef.current = [];
					}, 300);
				}, 300);
			} else {
				if (!propertyToDelete) return;
				const response = await fetch(
					`/api/contacts/v1/properties/${propertyToDelete.id}`,
					{ method: "DELETE", credentials: "include" },
				);
				if (!response.ok) throw new Error("Failed to delete property");
				setDeleteState("success");
				await invalidate();

				setTimeout(() => {
					void setDeleteId(null);
					onDeleteSuccess?.(displayName);
					setTimeout(() => {
						setDeleteState("idle");
						setConfirmationText("");
						targetPropertyRef.current = null;
					}, 300);
				}, 300);
			}
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to delete property(ies)",
			);
			setDeleteState("idle");
		}
	};

	useHotkeys(
		["enter", "mod+enter"],
		(e) => {
			e.preventDefault();
			if (canDelete) void handleDelete();
		},
		{ enableOnFormTags: ["INPUT"], enabled: !!deleteId },
	);

	useHotkeys(
		"escape",
		() => {
			if (deleteState === "idle") void setDeleteId(null);
		},
		{ enableOnFormTags: ["INPUT"], enabled: !!deleteId },
	);

	const deleteStateRef = useRef(deleteState);
	useEffect(() => {
		deleteStateRef.current = deleteState;
	}, [deleteState]);

	return (
		<Modal.Root
			open={!!deleteId}
			onOpenChange={(open) => {
				if (!open) {
					if (deleteStateRef.current === "success") {
						const name = isBulk
							? `${targetBulkPropertiesRef.current.length || bulkPropertiesToDelete.length} properties`
							: targetPropertyRef.current?.propertyName || "Unnamed property";
						onDeleteSuccess?.(name);
						if (isBulk) onClearSelection?.();
					}
					void setDeleteId(null);
					setTimeout(() => {
						setDeleteState("idle");
						setConfirmationText("");
						targetPropertyRef.current = null;
						targetBulkPropertiesRef.current = [];
					}, 300);
				}
			}}
		>
			<Modal.Content
				className="overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0 p-6 sm:max-w-[460px] dark:border-stroke-soft-100/40"
				showClose={false}
				onOpenAutoFocus={(e) => {
					e.preventDefault();
					setTimeout(() => inputRef.current?.focus(), 0);
				}}
			>
				<div>
					<Modal.Title className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
						{isBulk
							? `Delete ${bulkPropertiesToDelete.length || "selected"} properties`
							: "Delete property"}
					</Modal.Title>
					<Modal.Description className="text-sm text-text-sub-600 leading-relaxed">
						{isBulk
							? `Are you sure you want to delete ${bulkPropertiesToDelete.length > 1 ? `these ${bulkPropertiesToDelete.length} properties` : "this property"}? This action cannot be undone.`
							: "Are you sure you want to delete this property? This action cannot be undone."}
					</Modal.Description>
				</div>

				<div className="mt-4 rounded-xl border border-[#FBE3B5] bg-[#FEF6E6] p-4 text-[#8A5300] text-xs leading-relaxed dark:border-amber-800/40 dark:bg-amber-950/30 dark:text-amber-200">
					<span className="font-bold text-[#6D4000] dark:text-amber-100">
						Warning:
					</span>{" "}
					{isBulk
						? "Deleting these properties will permanently remove them and their values from all contacts."
						: "Deleting this property will permanently remove it and its values from all contacts."}
				</div>

				{isBulk ? (
					<div className="mt-5 space-y-2 rounded-xl border border-stroke-soft-100 bg-bg-weak-50/50 p-4 dark:border-stroke-soft-100/40">
						<p className="font-normal text-text-sub-600 text-xs">
							Selected properties ({bulkPropertiesToDelete.length})
						</p>
						<div className="flex flex-wrap gap-1.5 pt-1">
							{bulkPropertiesToDelete.slice(0, 4).map((p) => (
								<span
									key={p.id}
									className="inline-flex items-center rounded-md bg-bg-white-0 px-2 py-1 font-medium text-text-strong-950 text-xs shadow-2xs dark:bg-bg-weak-50/40"
								>
									{p.propertyName}
								</span>
							))}
							{bulkPropertiesToDelete.length > 4 ? (
								<span className="inline-flex items-center rounded-md bg-bg-weak-50 px-2 py-1 font-medium text-text-sub-600 text-xs dark:bg-bg-weak-50/30">
									+{bulkPropertiesToDelete.length - 4} more
								</span>
							) : null}
						</div>
					</div>
				) : (
					<div className="mt-5 grid grid-cols-2 gap-4 rounded-xl border border-stroke-soft-100 bg-bg-weak-50/50 p-4 dark:border-stroke-soft-100/40">
						<div>
							<p className="font-normal text-text-sub-600 text-xs">Name</p>
							<p className="mt-0.5 truncate font-medium text-sm text-text-strong-950">
								{propertyToDelete?.propertyName || "Unnamed property"}
							</p>
						</div>
						<div>
							<p className="font-normal text-text-sub-600 text-xs">Type</p>
							<div className="mt-1 flex items-center">
								{propertyToDelete ? (
									<Badge.Root
										size="small"
										variant="lighter"
										color={getBadgeColor(propertyToDelete.propertyType)}
										className="h-5 rounded-md px-1.5 font-medium text-xs capitalize"
									>
										{propertyToDelete.propertyType}
									</Badge.Root>
								) : (
									<span className="font-medium text-text-sub-600 text-xs">
										—
									</span>
								)}
							</div>
						</div>
					</div>
				)}

				<div className="mt-4 space-y-2">
					<Label.Root
						htmlFor="delete-property-confirmation"
						className="flex flex-wrap items-center gap-1.5"
					>
						<span>Type</span>
						<span className="inline-flex items-center gap-1 rounded-md bg-bg-weak-50 px-1.5 py-0.5 font-medium text-[12px] text-text-strong-950 dark:bg-bg-weak-50/20">
							{displayName}
							<button
								type="button"
								onClick={(e) => {
									e.preventDefault();
									void handleCopyName();
								}}
								className="-mr-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded transition-colors"
								aria-label={`Copy ${displayName}`}
								title="Copy name"
							>
								<Icon
									name={nameCopied ? "check" : "copy"}
									className="h-3 w-3 text-text-sub-600"
								/>
							</button>
						</span>
						<span>to confirm</span>
					</Label.Root>
					<Input.Root size="medium" className="rounded-xl">
						<Input.Wrapper>
							<Input.Input
								id="delete-property-confirmation"
								ref={inputRef}
								value={confirmationText}
								onChange={(e) => setConfirmationText(e.target.value)}
								placeholder={displayName}
								autoComplete="off"
								disabled={deleteState !== "idle"}
							/>
						</Input.Wrapper>
					</Input.Root>
				</div>

				<div className="mt-6 flex items-center justify-end gap-3">
					<Button.Root
						type="button"
						variant="neutral"
						mode="ghost"
						size="small"
						onClick={() => void setDeleteId(null)}
						className={cn(
							"transition-opacity duration-200",
							deleteState !== "idle" && "pointer-events-none opacity-50",
						)}
					>
						Cancel
					</Button.Root>

					<FancyButton.Root
						type="button"
						variant="destructive"
						size="small"
						disabled={!canDelete}
						onClick={() => void handleDelete()}
						className={cn(
							"relative min-w-[134px] select-none justify-center overflow-hidden transition-all duration-200",
							deleteState !== "idle" && "pointer-events-none opacity-90",
						)}
					>
						<AnimatePresence mode="popLayout" initial={false}>
							<motion.span
								key={deleteState}
								transition={{ type: "spring", duration: 0.25, bounce: 0 }}
								initial={{ opacity: 0, y: -14 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: 14 }}
								className="relative z-10 flex items-center justify-center gap-1.5"
							>
								{deleteState === "deleting" ? (
									<>
										<Spinner size={14} color="currentColor" />
										<span>Deleting...</span>
									</>
								) : deleteState === "success" ? (
									<>
										<Icon
											name="check-circle"
											className="h-4 w-4 shrink-0 text-white"
										/>
										<span>Deleted</span>
									</>
								) : (
									<>
										<span>Delete</span>
										<ActionKbd className={actionKbdOnBlueClassName}>
											↵
										</ActionKbd>
									</>
								)}
							</motion.span>
						</AnimatePresence>
					</FancyButton.Root>
				</div>
			</Modal.Content>
		</Modal.Root>
	);
}
