"use client";

import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";
import {
	type Contact,
	useInvalidateContacts,
} from "../../hooks/use-contacts-query";

/** Light keycap so it reads on the destructive FancyButton fill. */
const actionKbdOnSolidClassName =
	"border-white/25 bg-white/15 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]";

type RemoveState = "idle" | "removing" | "success";

interface RemoveContactFromGroupModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	contact: Contact | null;
	groupId: string;
	groupName?: string;
}

export function RemoveContactFromGroupModal({
	open,
	onOpenChange,
	contact,
	groupId,
	groupName,
}: RemoveContactFromGroupModalProps) {
	const invalidate = useInvalidateContacts();
	const [removeState, setRemoveState] = useState<RemoveState>("idle");

	// Keep contact stable while the success animation plays
	const targetContactRef = useRef<Contact | null>(null);
	if (contact) {
		targetContactRef.current = contact;
	}
	const contactToRemove = contact || targetContactRef.current;

	const handleClose = () => {
		if (removeState !== "idle") return;
		onOpenChange(false);
	};

	const handleRemove = async () => {
		if (!contactToRemove || removeState !== "idle") return;
		try {
			setRemoveState("removing");
			const response = await fetch(`/api/contacts/group/${groupId}`, {
				method: "DELETE",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ contact_id: contactToRemove.id }),
			});
			if (!response.ok) {
				const data = (await response.json().catch(() => ({}))) as {
					message?: string;
				};
				throw new Error(data.message || "Failed to remove contact from group");
			}

			setRemoveState("success");
			void invalidate();
			toast.success("Contact removed from group");

			setTimeout(() => {
				onOpenChange(false);
				setTimeout(() => {
					setRemoveState("idle");
					targetContactRef.current = null;
				}, 300);
			}, 750);
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to remove contact from group",
			);
			setRemoveState("idle");
		}
	};

	useHotkeys(
		"enter",
		(e) => {
			e.preventDefault();
			if (open && removeState === "idle" && contactToRemove) {
				void handleRemove();
			}
		},
		{ enabled: open && !!contactToRemove },
		[open, removeState, contactToRemove],
	);

	useHotkeys(
		"escape",
		() => {
			if (open && removeState === "idle") {
				handleClose();
			}
		},
		{ enabled: open },
		[open, removeState],
	);

	useEffect(() => {
		if (!open) {
			const timer = setTimeout(() => {
				setRemoveState("idle");
				targetContactRef.current = null;
			}, 300);
			return () => clearTimeout(timer);
		}
	}, [open]);

	return (
		<Modal.Root open={open} onOpenChange={(o) => !o && handleClose()}>
			<Modal.Content
				className="overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0 p-6 sm:max-w-[460px] dark:border-stroke-soft-100/40"
				showClose={false}
			>
				<div>
					<Modal.Title className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
						Remove from group
					</Modal.Title>
					<p className="mt-2 text-sm text-text-sub-600 leading-relaxed">
						Are you sure you want to remove this contact from
						{groupName ? (
							<>
								{" "}
								<span className="font-medium text-text-strong-950">
									{groupName}
								</span>
							</>
						) : (
							" this group"
						)}
						? The contact itself will not be deleted.
					</p>
				</div>

				<div className="mt-5 rounded-xl border border-stroke-soft-100 bg-bg-weak-50/50 p-4 dark:border-stroke-soft-100/40">
					<p className="font-normal text-text-sub-600 text-xs">Contact</p>
					<p className="mt-0.5 truncate font-medium text-sm text-text-strong-950">
						{contactToRemove?.email || "Unnamed contact"}
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
							"gap-1.5 transition-opacity duration-200",
							removeState !== "idle" && "pointer-events-none opacity-50",
						)}
					>
						Cancel
						<ActionKbd className="lowercase! w-auto min-w-0 px-1">
							esc
						</ActionKbd>
					</Button.Root>

					<FancyButton.Root
						type="button"
						variant="destructive"
						size="small"
						onClick={() => void handleRemove()}
						disabled={removeState !== "idle"}
						className={cn(
							"relative min-w-[154px] select-none justify-center overflow-hidden transition-all duration-200",
							removeState !== "idle" && "pointer-events-none opacity-90",
						)}
					>
						<AnimatePresence mode="popLayout" initial={false}>
							<motion.span
								key={removeState}
								transition={{ type: "spring", duration: 0.25, bounce: 0 }}
								initial={{ opacity: 0, y: -14 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: 14 }}
								className="relative z-10 flex items-center justify-center gap-1.5"
							>
								{removeState === "removing" ? (
									<>
										<Spinner size={14} color="currentColor" />
										<span>Removing...</span>
									</>
								) : removeState === "success" ? (
									<>
										<Icon
											name="check-circle"
											className="h-4 w-4 shrink-0 text-white"
										/>
										<span>Removed</span>
									</>
								) : (
									<>
										<span>Remove</span>
										<ActionKbd className={actionKbdOnSolidClassName}>
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
