"use client";

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
	getStatusColorClass,
	getStatusIcon,
	getStatusLabel,
} from "../../audience";
import {
	type Contact,
	useInvalidateContacts,
} from "../../hooks/use-contacts-query";

/** Light keycap so it reads on the red/destructive FancyButton fill. */
const actionKbdOnBlueClassName =
	"border-white/25 bg-white/15 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]";

type DeleteState = "idle" | "deleting" | "success";

export function DeleteContactConfirmModal({
	contacts,
	selectedContacts = [],
	onClearSelection,
	onDeleteSuccess,
}: {
	contacts: Contact[];
	selectedContacts?: Contact[];
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

	const targetContactRef = useRef<Contact | null>(null);
	const currentContact = contacts.find((c) => c.id === deleteId);
	if (currentContact) {
		targetContactRef.current = currentContact;
	}
	const contactToDelete = currentContact || targetContactRef.current;

	const targetBulkContactsRef = useRef<Contact[]>([]);
	if (isBulk && selectedContacts.length > 0) {
		targetBulkContactsRef.current = selectedContacts;
	}
	const bulkContactsToDelete = isBulk
		? selectedContacts.length > 0
			? selectedContacts
			: targetBulkContactsRef.current
		: [];

	const displayName = isBulk
		? `delete ${bulkContactsToDelete.length} contact${bulkContactsToDelete.length === 1 ? "" : "s"}`
		: contactToDelete?.email || "Unnamed contact";

	const normalizedInput = confirmationText.trim().toLowerCase();
	const isConfirmed = isBulk
		? normalizedInput === displayName.toLowerCase() ||
			normalizedInput === `delete ${bulkContactsToDelete.length} contact` ||
			normalizedInput === "delete"
		: confirmationText === displayName;

	const canDelete =
		isConfirmed &&
		deleteState === "idle" &&
		(isBulk ? bulkContactsToDelete.length > 0 : !!contactToDelete);

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
				for (const contact of bulkContactsToDelete) {
					try {
						const response = await fetch(`/api/contacts/${contact.id}`, {
							method: "DELETE",
							credentials: "include",
						});
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
					const summaryMsg = `${ok} contact${ok === 1 ? "" : "s"}`;
					onDeleteSuccess?.(summaryMsg);
					if (failed > 0) {
						toast.error(
							`${failed} contact${failed === 1 ? "" : "s"} failed to delete`,
						);
					}
					setTimeout(() => {
						setDeleteState("idle");
						setConfirmationText("");
						targetBulkContactsRef.current = [];
					}, 300);
				}, 300);
			} else {
				if (!contactToDelete) return;
				const response = await fetch(`/api/contacts/${contactToDelete.id}`, {
					method: "DELETE",
					credentials: "include",
				});
				if (!response.ok) throw new Error("Failed to delete contact");
				setDeleteState("success");
				await invalidate();

				setTimeout(() => {
					void setDeleteId(null);
					onDeleteSuccess?.(displayName);
					setTimeout(() => {
						setDeleteState("idle");
						setConfirmationText("");
						targetContactRef.current = null;
					}, 300);
				}, 300);
			}
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to delete contact(s)",
			);
			setDeleteState("idle");
		}
	};

	useHotkeys(
		["enter", "mod+enter"],
		(e) => {
			e.preventDefault();
			if (canDelete) {
				void handleDelete();
			}
		},
		{ enableOnFormTags: ["INPUT"], enabled: !!deleteId },
	);

	useHotkeys(
		"escape",
		() => {
			if (deleteState === "idle") {
				void setDeleteId(null);
			}
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
							? `${targetBulkContactsRef.current.length || bulkContactsToDelete.length} contacts`
							: targetContactRef.current?.email || "Unnamed contact";
						onDeleteSuccess?.(name);
						if (isBulk) onClearSelection?.();
					}
					void setDeleteId(null);
					setTimeout(() => {
						setDeleteState("idle");
						setConfirmationText("");
						targetContactRef.current = null;
						targetBulkContactsRef.current = [];
					}, 300);
				}
			}}
		>
			<Modal.Content
				className="overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0 p-6 sm:max-w-[460px] dark:border-stroke-soft-100/40"
				showClose={false}
				onOpenAutoFocus={(e) => {
					e.preventDefault();
					setTimeout(() => {
						inputRef.current?.focus();
					}, 0);
				}}
			>
				<div>
					<Modal.Title className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
						{isBulk
							? `Delete ${bulkContactsToDelete.length || "selected"} contacts`
							: "Delete contact"}
					</Modal.Title>
					<Modal.Description className="text-sm text-text-sub-600 leading-relaxed">
						{isBulk
							? `Are you sure you want to delete ${bulkContactsToDelete.length > 1 ? `these ${bulkContactsToDelete.length} contacts` : "this contact"}? This action cannot be undone.`
							: "Are you sure you want to delete this contact? This action cannot be undone."}
					</Modal.Description>
				</div>

				<div className="mt-4 rounded-xl border border-[#FBE3B5] bg-[#FEF6E6] p-4 text-[#8A5300] text-xs leading-relaxed dark:border-amber-800/40 dark:bg-amber-950/30 dark:text-amber-200">
					<span className="font-bold text-[#6D4000] dark:text-amber-100">
						Warning:
					</span>{" "}
					{isBulk
						? `Deleting ${bulkContactsToDelete.length > 1 ? `these ${bulkContactsToDelete.length} contacts` : "this contact"} will permanently remove their profiles, activity history, and custom property values.`
						: "Deleting this contact will permanently remove their profile, activity history, and custom property values across your organization."}
				</div>

				{isBulk ? (
					<div className="mt-5 space-y-2 rounded-xl border border-stroke-soft-100 bg-bg-weak-50/50 p-4 dark:border-stroke-soft-100/40">
						<p className="font-normal text-text-sub-600 text-xs">
							Selected contacts ({bulkContactsToDelete.length})
						</p>
						<div className="flex flex-wrap gap-1.5 pt-1">
							{bulkContactsToDelete.slice(0, 4).map((c) => (
								<span
									key={c.id}
									className="inline-flex items-center rounded-md bg-bg-white-0 px-2 py-1 font-medium text-text-strong-950 text-xs shadow-2xs dark:bg-bg-weak-50/40"
								>
									{c.email}
								</span>
							))}
							{bulkContactsToDelete.length > 4 ? (
								<span className="inline-flex items-center rounded-md bg-bg-weak-50 px-2 py-1 font-medium text-text-sub-600 text-xs dark:bg-bg-weak-50/30">
									+{bulkContactsToDelete.length - 4} more
								</span>
							) : null}
						</div>
					</div>
				) : (
					<div className="mt-5 grid grid-cols-2 gap-4 rounded-xl border border-stroke-soft-100 bg-bg-weak-50/50 p-4 dark:border-stroke-soft-100/40">
						<div>
							<p className="font-normal text-text-sub-600 text-xs">Email</p>
							<p className="mt-0.5 truncate font-medium text-sm text-text-strong-950">
								{contactToDelete?.email || "Unnamed contact"}
							</p>
						</div>
						<div>
							<p className="font-normal text-text-sub-600 text-xs">Status</p>
							<div className="mt-1 flex items-center">
								{contactToDelete ? (
									<div
										className={cn(
											"flex items-center gap-1.5 font-medium text-xs capitalize",
											getStatusColorClass(contactToDelete.status),
										)}
									>
										<Icon
											name={getStatusIcon(contactToDelete.status)}
											className="h-3.5 w-3.5"
										/>
										{getStatusLabel(contactToDelete.status)}
									</div>
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
						htmlFor="delete-contact-confirmation"
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
								id="delete-contact-confirmation"
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
								transition={{
									type: "spring",
									duration: 0.25,
									bounce: 0,
								}}
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
