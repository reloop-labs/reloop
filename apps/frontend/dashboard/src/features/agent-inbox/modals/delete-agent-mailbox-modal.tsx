import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useQueryState } from "nuqs";
import { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";
import { useAgentInbox } from "../components/agent-inbox-provider";
import type { AgentMailbox } from "../types";

/** Light keycap so it reads on the red/destructive FancyButton fill. */
const actionKbdOnBlueClassName =
	"border-white/25 bg-white/15 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]";

type DeleteState = "idle" | "deleting" | "success";

export function DeleteAgentMailboxModal({
	mailboxes,
	onDeleteSuccess,
}: {
	mailboxes: AgentMailbox[];
	onDeleteSuccess?: (deletedLabel: string) => void;
}) {
	const [deleteId, setDeleteId] = useQueryState("delete");
	const [confirmationText, setConfirmationText] = useState("");
	const [deleteState, setDeleteState] = useState<DeleteState>("idle");
	const [nameCopied, setNameCopied] = useState(false);
	const inputRef = useRef<HTMLInputElement | null>(null);
	const { deleteMailbox } = useAgentInbox();

	// Cache the selected mailbox so details stay stable when the list refreshes
	const targetMailboxRef = useRef<AgentMailbox | null>(null);
	const currentMailbox = mailboxes.find((m) => m.id === deleteId);
	if (currentMailbox) {
		targetMailboxRef.current = currentMailbox;
	}
	const mailboxToDelete = currentMailbox || targetMailboxRef.current;

	const displayLabel =
		mailboxToDelete?.label || mailboxToDelete?.email || "Address";
	const displayEmail = mailboxToDelete?.email || "-";
	const isConfirmed =
		confirmationText.trim() !== "" && confirmationText.trim() === displayEmail;

	const canDelete = isConfirmed && deleteState === "idle" && !!mailboxToDelete;

	const handleCopyName = async () => {
		try {
			await navigator.clipboard.writeText(displayEmail);
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
			if (!mailboxToDelete) return;
			await deleteMailbox(mailboxToDelete.id);
			setDeleteState("success");

			setTimeout(() => {
				void setDeleteId(null);
				onDeleteSuccess?.(displayLabel);
				setTimeout(() => {
					setDeleteState("idle");
					setConfirmationText("");
					targetMailboxRef.current = null;
				}, 300);
			}, 300);
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Failed to delete address";
			toast.error(message);
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

	// Keep a ref so onOpenChange can read the latest deleteState without stale closure
	const deleteStateRef = useRef(deleteState);
	useEffect(() => {
		deleteStateRef.current = deleteState;
	}, [deleteState]);

	const handleClose = () => {
		if (deleteState !== "idle") return;
		void setDeleteId(null);
		setTimeout(() => {
			setDeleteState("idle");
			setConfirmationText("");
		}, 300);
	};

	return (
		<Modal.Root
			open={!!deleteId}
			onOpenChange={(open) => {
				if (!open) {
					if (deleteStateRef.current === "success") {
						const name =
							targetMailboxRef.current?.label ||
							targetMailboxRef.current?.email ||
							"Address";
						onDeleteSuccess?.(name);
					}
					void setDeleteId(null);
					setTimeout(() => {
						setDeleteState("idle");
						setConfirmationText("");
						targetMailboxRef.current = null;
					}, 300);
				}
			}}
		>
			<Modal.Content
				className="overflow-hidden rounded-[18px] border border-stroke-soft-200 bg-bg-soft-50 p-0 sm:max-w-[460px] dark:border-stroke-soft-100/40 dark:bg-white/[0.03]"
				showClose={false}
				onOpenAutoFocus={(e) => {
					e.preventDefault();
					setTimeout(() => {
						inputRef.current?.focus();
					}, 0);
				}}
			>
				{/* Inner card, mirrors CreateCampaignModal but lighter, no red box */}
				<div className="relative m-0.5 space-y-5 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 pt-5 dark:border-stroke-soft-100/40 dark:bg-[#0c0c0c]">
					{/* Header: clean title only, no repetitive description */}
					<div className="flex items-start justify-between gap-4 px-6">
						<div className="flex items-center gap-2">
							<Icon name="trash" className="size-4 text-text-sub-600" />
							<Modal.Title className="font-medium text-text-strong-950 text-xl tracking-tight">
								Delete address
							</Modal.Title>
						</div>
						<button
							type="button"
							onClick={handleClose}
							aria-label="Close"
							disabled={deleteState !== "idle"}
							className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-bg-white-0 text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 active:scale-[0.95] disabled:opacity-50 dark:bg-transparent dark:hover:bg-white/[0.05]"
						>
							<X className="size-3.5" strokeWidth={2.25} />
						</button>
					</div>

					<div className="space-y-4 px-6 pb-6">
						{/* Lightweight context: address + consequence, no red outline/background */}
						<p className="text-sm text-text-sub-600 leading-relaxed">
							Permanently deletes{" "}
							<span className="inline-flex items-center rounded-md bg-bg-weak-50 px-1.5 py-0.5 font-medium font-mono text-text-strong-950 text-xs dark:bg-white/[0.06]">
								{displayEmail}
							</span>{" "}
							and everything in it.{" "}
							<span className="font-medium text-text-strong-950">
								This cannot be undone.
							</span>
						</p>

						{/* Confirmation Input */}
						<div className="space-y-2">
							<Label.Root
								htmlFor="delete-mailbox-confirmation"
								className="flex flex-wrap items-center gap-1.5"
							>
								<span>Type</span>
								<span className="inline-flex items-center gap-1 rounded-md bg-bg-weak-50 px-1.5 py-0.5 font-medium font-mono text-[12px] text-text-strong-950 dark:bg-bg-weak-50/20">
									{displayEmail}
									<button
										type="button"
										onClick={(e) => {
											e.preventDefault();
											void handleCopyName();
										}}
										className="-mr-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded transition-colors"
										aria-label={`Copy ${displayEmail}`}
										title="Copy email"
									>
										<AnimatePresence mode="popLayout" initial={false}>
											<motion.span
												key={nameCopied ? "check" : "copy"}
												initial={{ opacity: 0, scale: 0.6 }}
												animate={{ opacity: 1, scale: 1 }}
												exit={{ opacity: 0, scale: 0.6 }}
												transition={{
													type: "spring",
													duration: 0.2,
													bounce: 0.3,
												}}
												className="flex items-center justify-center"
											>
												<Icon
													name={nameCopied ? "check" : "copy"}
													className={cn(
														"h-3 w-3",
														nameCopied ? "text-green-500" : "text-text-sub-600",
													)}
												/>
											</motion.span>
										</AnimatePresence>
									</button>
								</span>
								<span>to confirm</span>
							</Label.Root>
							<Input.Root size="medium">
								<Input.Wrapper>
									<Input.Input
										ref={inputRef}
										id="delete-mailbox-confirmation"
										value={confirmationText}
										onChange={(e) => setConfirmationText(e.target.value)}
										placeholder={displayEmail}
										disabled={deleteState !== "idle"}
										autoComplete="off"
									/>
								</Input.Wrapper>
							</Input.Root>
						</div>
					</div>
				</div>

				{/* Footer Actions outside inner card, like CreateCampaignModal */}
				<div className="relative flex items-center justify-between gap-3 px-3 pt-2 pb-3">
					<Button.Root
						type="button"
						variant="neutral"
						mode="ghost"
						size="small"
						onClick={handleClose}
						className={cn(
							"gap-1.5 transition-opacity duration-200",
							deleteState !== "idle" && "pointer-events-none opacity-50",
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
								initial={{
									opacity: 0,
									y: -14,
								}}
								animate={{
									opacity: 1,
									y: 0,
								}}
								exit={{
									opacity: 0,
									y: 14,
								}}
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
											name="check"
											className="h-4 w-4 shrink-0 text-white"
										/>
										<span>Deleted</span>
									</>
								) : (
									<>
										Delete address
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
