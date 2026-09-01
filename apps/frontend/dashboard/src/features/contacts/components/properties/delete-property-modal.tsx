import * as Badge from "@reloop/ui/badge";
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
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { useInvalidateContacts } from "#/features/contacts/hooks/use-contacts-query";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";

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

interface Property {
	id: string;
	propertyName: string;
	propertyType: string;
	defaultValue: string | null;
	organizationId: string;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
}

interface DeletePropertyModalProps {
	property: Property | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onDeleteSuccess?: (deletedName: string) => void;
}

type DeleteState = "idle" | "deleting" | "success";

export const DeletePropertyModal = ({
	property,
	open,
	onOpenChange,
	onDeleteSuccess,
}: DeletePropertyModalProps) => {
	const [deleteState, setDeleteState] = useState<DeleteState>("idle");
	const [isHolding, setIsHolding] = useState(false);
	const holdProgress = useMotionValue(0);
	const animationRef = useRef<AnimationPlaybackControls | null>(null);
	const invalidate = useInvalidateContacts();

	// Cache target property so details remain stable during deletion animations
	const targetPropertyRef = useRef<Property | null>(null);
	if (property) {
		targetPropertyRef.current = property;
	}
	const propertyToDelete = property || targetPropertyRef.current;

	const handleDelete = async () => {
		if (!propertyToDelete || deleteState !== "idle") return;

		try {
			setDeleteState("deleting");
			const response = await fetch(
				`/api/contacts/v1/properties/${propertyToDelete.id}`,
				{
					method: "DELETE",
				},
			);

			if (!response.ok) {
				throw new Error("Failed to delete property");
			}

			setDeleteState("success");
			const deletedName = propertyToDelete.propertyName;
			void invalidate();

			setTimeout(() => {
				onOpenChange(false);
				onDeleteSuccess?.(deletedName);
				setTimeout(() => {
					setDeleteState("idle");
					targetPropertyRef.current = null;
				}, 300);
			}, 450);
		} catch (error) {
			console.error("Failed to delete property:", error);
			toast.error(
				error instanceof Error ? error.message : "Failed to delete property",
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
			if (open && propertyToDelete && deleteState === "idle") {
				void handleDelete();
			}
		},
		{ enabled: open && !!propertyToDelete },
		[open, propertyToDelete, deleteState],
	);

	useEffect(() => {
		if (!open) {
			cancelHold();
			const timer = setTimeout(() => {
				setDeleteState("idle");
				targetPropertyRef.current = null;
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
				className="overflow-hidden rounded-[18px] border border-stroke-soft-200 bg-bg-soft-50 p-0 sm:max-w-[460px] dark:border-stroke-soft-100/40 dark:bg-white/[0.03]"
				showClose={false}
			>
				<div className="relative m-0.5 space-y-4 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 pt-5 dark:border-stroke-soft-100/40 dark:bg-[#0c0c0c]">
					{/* Header */}
					<div className="flex items-start justify-between px-6 dark:border-stroke-soft-100/40">
						<Modal.Title className="font-medium text-text-strong-950 text-xl tracking-tight">
							Delete property
						</Modal.Title>
						<button
							type="button"
							onClick={handleCancel}
							aria-label="Close"
							disabled={deleteState !== "idle"}
							className="flex h-7 w-7 items-center justify-center rounded-lg bg-bg-white-0 text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 active:scale-[0.95] disabled:opacity-50 dark:border-stroke-soft-100/40 dark:bg-transparent dark:hover:bg-white/[0.05]"
						>
							<X className="size-3.5" strokeWidth={2.25} />
						</button>
					</div>

					<div className="space-y-3 px-6 pb-6">
						<p className="text-text-sub-600 text-xs leading-relaxed">
							Are you sure you want to delete this property? This action cannot
							be undone.
						</p>

						{/* Details Card */}
						<div className="grid grid-cols-3 gap-3 rounded-xl border border-stroke-soft-200 bg-bg-soft-50 p-3.5 dark:border-stroke-soft-100/40 dark:bg-white/[0.02]">
							<div>
								<p className="font-normal text-text-sub-600 text-[11px]">
									Property name
								</p>
								<p className="mt-0.5 truncate font-semibold text-text-strong-950 text-xs">
									{propertyToDelete?.propertyName || "—"}
								</p>
							</div>
							<div>
								<p className="font-normal text-text-sub-600 text-[11px]">
									Property type
								</p>
								<div className="mt-0.5 flex items-center">
									<Badge.Root
										size="small"
										variant="lighter"
										color={getBadgeColor(
											propertyToDelete?.propertyType || "String",
										)}
										className="h-[18px] rounded-full px-1.5 font-semibold text-[10px] capitalize"
									>
										{propertyToDelete?.propertyType || "String"}
									</Badge.Root>
								</div>
							</div>
							<div>
								<p className="font-normal text-text-sub-600 text-[11px]">
									Default value
								</p>
								<p className="mt-0.5 truncate font-mono text-text-strong-950 text-xs">
									{propertyToDelete?.defaultValue
										? `"${propertyToDelete.defaultValue}"`
										: "—"}
								</p>
							</div>
						</div>

						{/* Warning Banner */}
						<div className="rounded-xl border border-amber-200/60 bg-amber-50/50 p-3 text-amber-900 text-[11px] leading-relaxed dark:border-amber-800/40 dark:bg-amber-950/20 dark:text-amber-200">
							<span className="font-semibold text-amber-950 dark:text-amber-100">
								Warning:
							</span>{" "}
							Deleting this property will permanently remove it along with all its
							values from all contacts across your organization.
						</div>
					</div>
				</div>

				{/* Actions / Footer */}
				<div className="relative flex items-center justify-between gap-3 px-3 pt-2 pb-3">
					<Button.Root
						type="button"
						variant="neutral"
						mode="ghost"
						size="small"
						onClick={handleCancel}
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
						variant={deleteState === "success" ? "success" : "destructive"}
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
			</Modal.Content>
		</Modal.Root>
	);
};
