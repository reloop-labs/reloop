import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import { useQuery } from "@tanstack/react-query";
import {
	AnimatePresence,
	animate,
	motion,
	useMotionValue,
	type AnimationPlaybackControls,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useInvalidateContacts, type Group } from "#/features/contacts/hooks/use-contacts-query";

interface DeleteGroupModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	group: Group | null;
	onDeleteSuccess?: () => void;
}

type DeleteState = "idle" | "deleting" | "success";

export const DeleteGroupModal = ({
	open,
	onOpenChange,
	group,
	onDeleteSuccess,
}: DeleteGroupModalProps) => {
	const [deleteState, setDeleteState] = useState<DeleteState>("idle");
	const [isHolding, setIsHolding] = useState(false);
	const holdProgress = useMotionValue(0);
	const animationRef = useRef<AnimationPlaybackControls | null>(null);
	const invalidate = useInvalidateContacts();

	// Cache the target group so details remain stable during deletion animations
	const targetGroupRef = useRef<Group | null>(null);
	if (group) {
		targetGroupRef.current = group;
	}
	const groupToDelete = group || targetGroupRef.current;

	// Fetch contacts count for the group
	const { data: contactsData, isPending: isLoadingContacts } = useQuery({
		queryKey: [
			"contacts",
			"legacy",
			groupToDelete && open
				? `/api/contacts/v1/groups/${groupToDelete.id}/contacts?limit=1`
				: null,
		],
		queryFn: async () => {
			const url =
				groupToDelete && open
					? `/api/contacts/v1/groups/${groupToDelete.id}/contacts?limit=1`
					: null;
			if (!url) throw new Error("Missing URL");
			const res = await fetch(url, { credentials: "include" });
			if (!res.ok) throw new Error("Failed to fetch contacts count");
			return res.json() as Promise<{ total: number }>;
		},
		enabled: Boolean(groupToDelete && open),
	});

	const handleDelete = async () => {
		if (!groupToDelete || deleteState !== "idle") return;
		try {
			setDeleteState("deleting");
			const response = await fetch(
				`/api/contacts/v1/groups/${groupToDelete.id}`,
				{
					method: "DELETE",
					credentials: "include",
				},
			);

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.message || "Failed to delete group");
			}

			setDeleteState("success");
			void invalidate();

			setTimeout(() => {
				onOpenChange(false);
				onDeleteSuccess?.();
				setTimeout(() => {
					setDeleteState("idle");
					targetGroupRef.current = null;
				}, 300);
			}, 900);
		} catch (error) {
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
			if (open && groupToDelete && deleteState === "idle") {
				void handleDelete();
			}
		},
		{ enabled: open && !!groupToDelete },
		[open, groupToDelete, deleteState],
	);

	useEffect(() => {
		if (!open) {
			cancelHold();
			const timer = setTimeout(() => {
				setDeleteState("idle");
				targetGroupRef.current = null;
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
							Delete group
						</Modal.Title>
						<p className="mt-2 text-sm leading-relaxed text-text-sub-600">
							Are you sure you want to delete this group? This action cannot be
							undone.
						</p>
					</div>

					{/* Details Card */}
					<div className="mt-5 space-y-3 rounded-xl border border-stroke-soft-100 bg-bg-weak-50/50 p-4 dark:border-stroke-soft-100/40">
						<div>
							<p className="font-normal text-text-sub-600 text-xs">
								Group name
							</p>
							<p className="mt-0.5 truncate font-medium text-sm text-text-strong-950">
								{groupToDelete?.name || "Unnamed group"}
							</p>
						</div>
						<div>
							<p className="font-normal text-text-sub-600 text-xs">
								Linked contacts
							</p>
							<p className="mt-0.5 truncate font-medium text-sm text-text-strong-950">
								{isLoadingContacts ? (
									<span className="inline-flex items-center gap-1.5 text-text-sub-600">
										<Icon name="loader-2" className="h-3 w-3 animate-spin" />
										Loading contacts...
									</span>
								) : (
									<span>
										{contactsData?.total || 0} contact
										{contactsData?.total !== 1 ? "s" : ""} will be unlinked
									</span>
								)}
							</p>
						</div>
					</div>

					{/* Warning Banner */}
					<div className="mt-4 rounded-xl border border-[#FBE3B5] bg-[#FEF6E6] p-4 text-[#8A5300] text-xs leading-relaxed dark:border-amber-800/40 dark:bg-amber-950/30 dark:text-amber-200">
						<span className="font-bold text-[#6D4000] dark:text-amber-100">
							Warning:
						</span>{" "}
						Deleting this group will permanently remove it along with all its
						settings. Any contacts in this group will be unlinked, but they will
						not be deleted.
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
								className="pointer-events-none absolute inset-0 bg-white/25 origin-left"
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
