import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Modal from "@reloop/ui/modal";
import { Skeleton } from "@reloop/ui/skeleton";
import Spinner from "@reloop/ui/spinner";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import {
	type Group,
	useInvalidateContacts,
} from "#/features/contacts/hooks/use-contacts-query";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";

/** Light keycap so it reads on the destructive FancyButton fill. */
const actionKbdOnBlueClassName =
	"border-white/25 bg-white/15 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]";

interface DeleteGroupModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	group: Group | null;
	onDeleteSuccess?: (deletedName: string) => void;
}

type DeleteState = "idle" | "deleting" | "success";

export const DeleteGroupModal = ({
	open,
	onOpenChange,
	group,
	onDeleteSuccess,
}: DeleteGroupModalProps) => {
	const [deleteState, setDeleteState] = useState<DeleteState>("idle");
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
				const deletedName =
					targetGroupRef.current?.name || groupToDelete?.name || "";
				onDeleteSuccess?.(deletedName);
				setTimeout(() => {
					setDeleteState("idle");
					targetGroupRef.current = null;
				}, 300);
			}, 900);
		} catch {
			setDeleteState("idle");
		}
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

	useHotkeys(
		"escape",
		() => {
			if (open && deleteState === "idle") {
				onOpenChange(false);
			}
		},
		{ enabled: open },
		[open, deleteState],
	);

	useEffect(() => {
		if (!open) {
			const timer = setTimeout(() => {
				setDeleteState("idle");
				targetGroupRef.current = null;
			}, 300);
			return () => clearTimeout(timer);
		}
	}, [open]);

	const handleCancel = () => {
		if (deleteState !== "idle") return;
		onOpenChange(false);
	};

	return (
		<Modal.Root open={open} onOpenChange={(o) => !o && handleCancel()}>
			<Modal.Content
				className="overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0 p-6 sm:max-w-[460px] dark:border-stroke-soft-100/40"
				showClose={false}
			>
				<motion.div
					layout
					transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
				>
					{/* Header */}
					<div>
						<Modal.Title className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
							Delete group
						</Modal.Title>
						<p className="mt-2 text-sm text-text-sub-600 leading-relaxed">
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
							{isLoadingContacts ? (
								<Skeleton className="mt-1 h-4.5 w-32 rounded-full bg-black/10 dark:bg-white/15" />
							) : (
								<p className="mt-0.5 truncate font-medium text-sm text-text-strong-950">
									{contactsData?.total || 0} contact
									{contactsData?.total !== 1 ? "s" : ""} will be unlinked
								</p>
							)}
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
							mode="stroke"
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
							variant="destructive"
							size="small"
							onClick={() => void handleDelete()}
							disabled={deleteState !== "idle"}
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
				</motion.div>
			</Modal.Content>
		</Modal.Root>
	);
};
