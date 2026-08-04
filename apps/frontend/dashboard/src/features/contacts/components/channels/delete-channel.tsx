import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import { Skeleton } from "@reloop/ui/skeleton";
import Spinner from "@reloop/ui/spinner";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { useInvalidateContacts } from "#/features/contacts/hooks/use-contacts-query";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";

/** Light keycap so it reads on the destructive FancyButton fill. */
const actionKbdOnDestructiveClassName =
	"border-white/25 bg-white/15 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]";

interface Channel {
	id: string;
	name: string;
	description: string | null;
	organizationId: string;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
}

interface DeleteChannelModalProps {
	channels: Channel[];
	onDeleteSuccess?: (deletedName: string) => void;
}

type DeleteState = "idle" | "deleting" | "success";

export const DeleteChannelModal = ({
	channels,
	onDeleteSuccess,
}: DeleteChannelModalProps) => {
	const pathname = usePathname();
	const router = useRouter();

	const [modal, setModal] = useQueryState("modal");
	const [id, setId] = useQueryState("id");
	const [deleteState, setDeleteState] = useState<DeleteState>("idle");
	const [confirmationText, setConfirmationText] = useState("");
	const [nameCopied, setNameCopied] = useState(false);
	const inputRef = useRef<HTMLInputElement | null>(null);
	const invalidate = useInvalidateContacts();

	const isOpen = modal === "delete-channel";

	// Cache the target channel so details remain stable during deletion animations
	const targetChannelRef = useRef<Channel | null>(null);
	const matchedChannel = channels.find((channel) => channel.id === id);
	if (matchedChannel) {
		targetChannelRef.current = matchedChannel;
	}
	const channelToDelete = matchedChannel || targetChannelRef.current;

	const displayName = channelToDelete?.name || "Unnamed channel";
	// Exact match only — no partial / substring acceptance
	const isConfirmed = confirmationText === displayName;
	const canDelete = isConfirmed && deleteState === "idle" && !!channelToDelete;

	// Fetch contacts count for the channel
	const { data: contactsData, isPending: isLoadingContacts } = useQuery({
		queryKey: [
			"contacts",
			"legacy",
			channelToDelete && isOpen
				? `/api/contacts/v1/channels/${channelToDelete.id}/contacts?limit=1`
				: null,
		],
		queryFn: async () => {
			const url =
				channelToDelete && isOpen
					? `/api/contacts/v1/channels/${channelToDelete.id}/contacts?limit=1`
					: null;
			if (!url) throw new Error("Missing URL");
			const res = await fetch(url, { credentials: "include" });
			if (!res.ok) throw new Error("Failed to fetch contacts count");
			return res.json() as Promise<{ total: number }>;
		},
		enabled: Boolean(channelToDelete && isOpen),
	});

	const deleteStateRef = useRef(deleteState);
	const successNotifiedRef = useRef(false);
	useEffect(() => {
		deleteStateRef.current = deleteState;
	}, [deleteState]);

	const resetLocalState = () => {
		setDeleteState("idle");
		setConfirmationText("");
		setNameCopied(false);
		targetChannelRef.current = null;
		successNotifiedRef.current = false;
	};

	const notifySuccess = (name: string) => {
		if (successNotifiedRef.current) return;
		successNotifiedRef.current = true;
		onDeleteSuccess?.(name);
	};

	const handleClose = () => {
		if (deleteStateRef.current === "success" && targetChannelRef.current) {
			notifySuccess(targetChannelRef.current.name);
		}
		void setModal(null);
		void setId(null);
		setTimeout(resetLocalState, 300);
	};

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
		if (!canDelete || !channelToDelete) return;

		setDeleteState("deleting");
		try {
			await axios.delete(`/api/contacts/v1/channels/${channelToDelete.id}`, {
				withCredentials: true,
			});

			setDeleteState("success");
			const deletedName = channelToDelete.name;
			const isChannelDetailPage = pathname?.includes(`/${channelToDelete.id}`);

			setTimeout(() => {
				notifySuccess(deletedName);
				void setModal(null);
				void setId(null);
				if (isChannelDetailPage) {
					router.push("/contacts/channels");
				} else {
					void invalidate();
				}
				setTimeout(resetLocalState, 300);
			}, 750);
		} catch (error) {
			setDeleteState("idle");
			const errorMessage = axios.isAxiosError(error)
				? error.response?.data?.message || "Failed to delete channel"
				: "Failed to delete channel";
			toast.error(errorMessage);
		}
	};

	useHotkeys(
		"enter",
		(e) => {
			e.preventDefault();
			if (canDelete) void handleDelete();
		},
		{ enableOnFormTags: ["INPUT"], enabled: isOpen },
		[isOpen, canDelete],
	);

	useHotkeys(
		"escape",
		() => {
			if (isOpen && deleteState === "idle") handleClose();
		},
		{ enableOnFormTags: ["INPUT"], enabled: isOpen },
		[isOpen, deleteState],
	);

	useEffect(() => {
		if (!isOpen) {
			const timer = setTimeout(resetLocalState, 300);
			return () => clearTimeout(timer);
		}
	}, [isOpen]);

	return (
		<Modal.Root open={isOpen} onOpenChange={(o) => !o && handleClose()}>
			<Modal.Content
				className="overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0 p-6 sm:max-w-[460px] dark:border-stroke-soft-100/40"
				showClose={false}
				onOpenAutoFocus={(e) => {
					e.preventDefault();
					setTimeout(() => inputRef.current?.focus(), 0);
				}}
			>
				<motion.div
					layout
					transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
				>
					<div>
						<Modal.Title className="font-semibold text-[26px] text-text-strong-950 tracking-tight dark:text-white">
							Delete channel
						</Modal.Title>
						<p className="mt-2 text-sm text-text-sub-600 leading-relaxed dark:text-white/60">
							Are you sure you want to delete this channel? This action cannot
							be undone.
						</p>
					</div>

					{/* Details Card */}
					<div className="mt-5 space-y-3 rounded-xl border border-stroke-soft-100 bg-bg-weak-50/50 p-4 dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/20">
						<div>
							<p className="font-normal text-text-sub-600 text-xs dark:text-white/50">
								Channel name
							</p>
							<p className="mt-0.5 truncate font-medium text-sm text-text-strong-950 dark:text-white">
								{displayName}
							</p>
						</div>
						<div>
							<p className="font-normal text-text-sub-600 text-xs dark:text-white/50">
								Linked contacts
							</p>
							{isLoadingContacts ? (
								<Skeleton className="mt-1 h-4.5 w-32 rounded-full bg-black/10 dark:bg-white/15" />
							) : (
								<p className="mt-0.5 truncate font-medium text-sm text-text-strong-950 dark:text-white">
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
						Deleting this channel will permanently remove it along with all its
						settings. Any contacts in this channel will be unlinked.
					</div>

					{/* Type-to-confirm */}
					<div className="mt-4 space-y-2">
						<Label.Root
							htmlFor="delete-channel-confirmation"
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
									id="delete-channel-confirmation"
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

					{/* Footer Actions */}
					<div className="mt-6 flex items-center justify-end gap-3">
						<Button.Root
							type="button"
							variant="neutral"
							mode="stroke"
							size="small"
							onClick={() => {
								if (deleteState === "idle") handleClose();
							}}
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
											<ActionKbd className={actionKbdOnDestructiveClassName}>
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
