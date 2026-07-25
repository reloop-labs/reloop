import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import axios from "axios";
import {
	AnimatePresence,
	type AnimationPlaybackControls,
	animate,
	motion,
	useMotionValue,
} from "framer-motion";
import { useQueryState } from "nuqs";
import { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import type { AgentMailbox } from "../types";

type DeleteState = "idle" | "deleting" | "success";

export function DeleteAgentMailboxModal({
	mailboxes,
	onDeleteSuccess,
}: {
	mailboxes: AgentMailbox[];
	onDeleteSuccess?: (deletedLabel: string) => void;
}) {
	const [deleteId, setDeleteId] = useQueryState("delete");
	const [deleteState, setDeleteState] = useState<DeleteState>("idle");
	const [isHolding, setIsHolding] = useState(false);
	const holdProgress = useMotionValue(0);
	const animationRef = useRef<AnimationPlaybackControls | null>(null);

	// Cache the selected mailbox so details stay stable when the list refreshes
	const targetMailboxRef = useRef<AgentMailbox | null>(null);
	const currentMailbox = mailboxes.find((m) => m.id === deleteId);
	if (currentMailbox) {
		targetMailboxRef.current = currentMailbox;
	}
	const mailboxToDelete = currentMailbox || targetMailboxRef.current;

	const displayLabel =
		mailboxToDelete?.label || mailboxToDelete?.email || "Agent address";
	const displayEmail = mailboxToDelete?.email || "—";

	const handleDelete = async () => {
		if (!mailboxToDelete || deleteState !== "idle") return;
		try {
			setDeleteState("deleting");
			await axios.delete(`/api/inbox/v1/mailboxes/${mailboxToDelete.id}`, {
				withCredentials: true,
			});
			setDeleteState("success");

			setTimeout(() => {
				void setDeleteId(null);
				onDeleteSuccess?.(displayLabel);
				setTimeout(() => {
					setDeleteState("idle");
				}, 300);
			}, 900);
		} catch (error) {
			const message = axios.isAxiosError(error)
				? error.response?.data?.message || "Failed to delete agent address"
				: "Failed to delete agent address";
			toast.error(message);
			setDeleteState("idle");
		}
	};

	const startHold = () => {
		if (deleteState !== "idle") return;
		setIsHolding(true);
		holdProgress.set(0);
		animationRef.current = animate(holdProgress, 1, {
			duration: 1.2,
			ease: "linear",
			onComplete: () => {
				setIsHolding(false);
				holdProgress.set(0);
				void handleDelete();
			},
		});
	};

	const cancelHold = () => {
		if (!isHolding && holdProgress.get() === 0) return;
		setIsHolding(false);
		animationRef.current?.stop();
		animate(holdProgress, 0, {
			duration: 0.2,
			ease: "easeOut",
		});
	};

	useHotkeys(
		"enter",
		(e) => {
			e.preventDefault();
			if (mailboxToDelete && deleteState === "idle") {
				void handleDelete();
			}
		},
		{ enabled: !!deleteId },
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
					cancelHold();
					if (deleteStateRef.current === "success") {
						const name =
							targetMailboxRef.current?.label ||
							targetMailboxRef.current?.email ||
							"Agent address";
						onDeleteSuccess?.(name);
					}
					void setDeleteId(null);
					setTimeout(() => {
						setDeleteState("idle");
						targetMailboxRef.current = null;
					}, 300);
				}
			}}
		>
			<Modal.Content
				className="overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0 p-6 sm:max-w-[460px] dark:border-stroke-soft-100/40"
				showClose={true}
			>
				<div className="pr-6">
					<Modal.Title className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
						Delete agent address
					</Modal.Title>
					<p className="text-sm text-text-sub-600 leading-relaxed">
						Are you sure you want to delete this agent address? This action
						cannot be undone.
					</p>
				</div>

				<div className="mt-5 space-y-3 rounded-xl border border-stroke-soft-100 bg-bg-weak-50/50 p-4 dark:border-stroke-soft-100/40">
					<div>
						<p className="font-normal text-text-sub-600 text-xs">Agent name</p>
						<p className="mt-0.5 truncate font-medium text-sm text-text-strong-950">
							{displayLabel}
						</p>
					</div>
					<div>
						<p className="font-normal text-text-sub-600 text-xs">
							Email address
						</p>
						<p className="mt-0.5 truncate font-medium font-mono text-sm text-text-strong-950">
							{displayEmail}
						</p>
					</div>
				</div>

				<div className="mt-4 rounded-xl border border-[#FBE3B5] bg-[#FEF6E6] p-4 text-[#8A5300] text-xs leading-relaxed dark:border-amber-800/40 dark:bg-amber-950/30 dark:text-amber-200">
					<span className="font-bold text-[#6D4000] dark:text-amber-100">
						Warning:
					</span>{" "}
					Deleting this address permanently removes the inbox and all of its
					messages, drafts, and labels. Agents and integrations using this
					address will stop receiving mail immediately.
				</div>

				<div className="mt-6 flex items-center justify-end gap-3">
					<Button.Root
						type="button"
						variant="neutral"
						mode="ghost"
						size="small"
						onClick={() => {
							if (deleteState === "idle") {
								cancelHold();
								void setDeleteId(null);
								setDeleteState("idle");
							}
						}}
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
						onPointerDown={startHold}
						onPointerUp={cancelHold}
						onPointerLeave={cancelHold}
						onPointerCancel={cancelHold}
						className={cn(
							"relative min-w-[134px] select-none justify-center overflow-hidden transition-all duration-200",
							deleteState !== "idle" && "pointer-events-none opacity-90",
						)}
					>
						<motion.div
							className="pointer-events-none absolute inset-0 origin-left bg-white/25"
							style={{ scaleX: holdProgress }}
						/>

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
											name="check"
											className="h-4 w-4 shrink-0 text-white"
										/>
										<span>Deleted</span>
									</>
								) : (
									<span>Hold to delete</span>
								)}
							</motion.span>
						</AnimatePresence>
					</FancyButton.Root>
				</div>
			</Modal.Content>
		</Modal.Root>
	);
}
