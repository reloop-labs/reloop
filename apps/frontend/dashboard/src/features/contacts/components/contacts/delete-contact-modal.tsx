import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import {
	AnimatePresence,
	type AnimationPlaybackControls,
	animate,
	motion,
	useMotionValue,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import {
	type AudienceStatus,
	getStatusColorClass,
	getStatusIcon,
	getStatusLabel,
} from "#/features/contacts/audience";
import { useInvalidateContacts } from "#/features/contacts/hooks/use-contacts-query";

interface Contact {
	id: string;
	email: string;
	status: AudienceStatus;
	organizationId: string;
	properties: Record<string, string | number>;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
}

interface DeleteContactModalProps {
	contact: Contact | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onDeleteSuccess?: (deletedEmail?: string) => void;
}

type DeleteState = "idle" | "deleting" | "success";

export const DeleteContactModal = ({
	contact,
	open,
	onOpenChange,
	onDeleteSuccess,
}: DeleteContactModalProps) => {
	const [deleteState, setDeleteState] = useState<DeleteState>("idle");
	const [isHolding, setIsHolding] = useState(false);
	const holdProgress = useMotionValue(0);
	const animationRef = useRef<AnimationPlaybackControls | null>(null);
	const invalidate = useInvalidateContacts();

	// Cache target contact so details remain stable during deletion animations
	const targetContactRef = useRef<Contact | null>(null);
	if (contact) {
		targetContactRef.current = contact;
	}
	const contactToDelete = contact || targetContactRef.current;

	const handleDelete = async () => {
		if (!contactToDelete || deleteState !== "idle") return;

		try {
			setDeleteState("deleting");
			const response = await fetch(`/api/contacts/${contactToDelete.id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				throw new Error("Failed to delete contact");
			}

			setDeleteState("success");
			const deletedEmail = contactToDelete.email;
			void invalidate();

			setTimeout(() => {
				onOpenChange(false);
				onDeleteSuccess?.(deletedEmail);
				setTimeout(() => {
					setDeleteState("idle");
					targetContactRef.current = null;
				}, 300);
			}, 750);
		} catch (error) {
			console.error("Failed to delete contact:", error);
			toast.error(
				error instanceof Error ? error.message : "Failed to delete contact",
			);
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
			if (open && contactToDelete && deleteState === "idle") {
				void handleDelete();
			}
		},
		{ enabled: open && !!contactToDelete },
		[open, contactToDelete, deleteState],
	);

	useEffect(() => {
		if (!open) {
			cancelHold();
			const timer = setTimeout(() => {
				setDeleteState("idle");
				targetContactRef.current = null;
			}, 300);
			return () => clearTimeout(timer);
		}
	}, [open]);

	const handleCancel = () => {
		cancelHold();
		onOpenChange(false);
	};

	return (
		<Modal.Root open={open} onOpenChange={(o) => !o && handleCancel()}>
			<Modal.Content
				className="overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0 p-6 sm:max-w-[460px] dark:border-stroke-soft-100/40"
				showClose={true}
			>
				<motion.div
					layout
					transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
				>
					{/* Header */}
					<div className="pr-6">
						<Modal.Title className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
							Delete contact
						</Modal.Title>
						<p className="text-sm text-text-sub-600 leading-relaxed">
							Are you sure you want to delete this contact? This action cannot
							be undone.
						</p>
					</div>

					{/* Details Card */}
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

					{/* Warning Banner */}
					<div className="mt-4 rounded-xl border border-[#FBE3B5] bg-[#FEF6E6] p-4 text-[#8A5300] text-xs leading-relaxed dark:border-amber-800/40 dark:bg-amber-950/30 dark:text-amber-200">
						<span className="font-bold text-[#6D4000] dark:text-amber-100">
							Warning:
						</span>{" "}
						Deleting this contact will permanently remove their profile,
						activity history, and custom property values across your
						organization.
					</div>

					{/* Footer Actions */}
					<div className="mt-6 flex items-center justify-end gap-3">
						<Button.Root
							type="button"
							variant="neutral"
							mode="ghost"
							size="small"
							onClick={handleCancel}
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
							{/* Hold progress overlay fill */}
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
												name="check-circle"
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
				</motion.div>
			</Modal.Content>
		</Modal.Root>
	);
};
