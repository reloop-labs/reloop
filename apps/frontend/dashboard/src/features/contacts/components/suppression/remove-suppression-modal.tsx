"use client";

import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { EnterIcon } from "@reloop/ui/enter-icon";
import * as FancyButton from "@reloop/ui/fancy-button";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import { useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import {
	ActionKbd,
	actionKbdOnSolidClassName,
} from "#/features/dashboard/keyboard-shortcuts-reveal";
import {
	type Contact,
	useInvalidateContacts,
} from "../../hooks/use-contacts-query";
import {
	getSuppressionReasonText,
	getSuppressionSource,
} from "./reason-labels";
import { SuppressionSourceBadge } from "./suppression-source-badge";

export function RemoveSuppressionModal({
	contact,
	onOpenChange,
}: {
	contact: Contact | null;
	onOpenChange: (open: boolean) => void;
}) {
	const invalidate = useInvalidateContacts();
	const [isRemoving, setIsRemoving] = useState(false);
	const open = Boolean(contact);

	// Keep the row's details on screen while the modal animates out
	const lastContactRef = useRef<Contact | null>(null);
	if (contact) lastContactRef.current = contact;
	const shown = contact ?? lastContactRef.current;

	const handleClose = () => {
		if (isRemoving) return;
		onOpenChange(false);
	};

	const handleRemove = async () => {
		if (!contact || isRemoving) return;
		setIsRemoving(true);
		try {
			// Re-subscribing clears suppressionReason and suppressedAt server-side
			const response = await fetch(`/api/contacts/${contact.id}`, {
				method: "PATCH",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status: "subscribed" }),
			});
			if (!response.ok) {
				const data = (await response.json().catch(() => ({}))) as {
					message?: string;
				};
				throw new Error(data.message || "Failed to remove suppression");
			}
			toast.success(`${contact.email} can receive email again`);
			await invalidate();
			onOpenChange(false);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to remove suppression",
			);
		} finally {
			setIsRemoving(false);
		}
	};

	useHotkeys(
		"enter",
		(e) => {
			e.preventDefault();
			void handleRemove();
		},
		{ enabled: open },
		[contact, isRemoving],
	);

	const reason = shown ? getSuppressionReasonText(shown) : "";

	return (
		<Modal.Root open={open} onOpenChange={(o) => !o && handleClose()}>
			<Modal.Content
				className="overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0 p-6 sm:max-w-[460px] dark:border-stroke-soft-100/40"
				showClose={false}
			>
				<div>
					<Modal.Title className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
						Remove from suppression list
					</Modal.Title>
					<p className="mt-2 text-sm text-text-sub-600 leading-relaxed">
						This address will be resubscribed and can receive email again. If it
						bounces or reports spam again it will be suppressed again, and
						repeated bounces hurt your sending reputation.
					</p>
				</div>

				<div className="mt-5 rounded-xl border border-stroke-soft-100 bg-bg-weak-50/50 p-4 dark:border-stroke-soft-100/40">
					<p className="font-normal text-text-sub-600 text-xs">Contact</p>
					<p className="mt-0.5 truncate font-medium text-sm text-text-strong-950">
						{shown?.email}
					</p>
					<p className="mt-2 font-normal text-text-sub-600 text-xs">Source</p>
					<div className="mt-1">
						<SuppressionSourceBadge
							source={shown ? getSuppressionSource(shown) : "manual"}
						/>
					</div>
					<p className="mt-2 font-normal text-text-sub-600 text-xs">Reason</p>
					<p className="mt-0.5 whitespace-pre-wrap break-words font-medium text-sm text-text-strong-950">
						{reason}
					</p>
				</div>

				<div className="mt-6 flex items-center justify-end gap-3">
					<Button.Root
						type="button"
						variant="neutral"
						mode="stroke"
						size="small"
						onClick={handleClose}
						className={cn(
							"gap-1.5",
							isRemoving && "pointer-events-none opacity-50",
						)}
					>
						Cancel
						<ActionKbd className="lowercase! w-auto min-w-0 px-1">
							esc
						</ActionKbd>
					</Button.Root>

					<FancyButton.Root
						type="button"
						variant="neutral"
						size="small"
						onClick={() => void handleRemove()}
						disabled={isRemoving}
						className="min-w-[120px] justify-center gap-1.5"
					>
						{isRemoving ? (
							<>
								<Spinner size={14} color="currentColor" />
								Removing...
							</>
						) : (
							<>
								Remove
								<ActionKbd className={actionKbdOnSolidClassName}>
									<EnterIcon />
								</ActionKbd>
							</>
						)}
					</FancyButton.Root>
				</div>
			</Modal.Content>
		</Modal.Root>
	);
}
