import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Modal from "@reloop/ui/modal";
import { Skeleton } from "@reloop/ui/skeleton";
import Spinner from "@reloop/ui/spinner";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useRouterState } from "@tanstack/react-router";
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
import { useInvalidateContacts } from "#/features/contacts/hooks/use-contacts-query";

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
}

type DeleteState = "idle" | "deleting" | "success";

export const DeleteChannelModal = ({ channels }: DeleteChannelModalProps) => {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const navigate = useNavigate();

	const [modal, setModal] = useQueryState("modal");
	const [id, setId] = useQueryState("id");
	const [deleteState, setDeleteState] = useState<DeleteState>("idle");
	const [isHolding, setIsHolding] = useState(false);
	const holdProgress = useMotionValue(0);
	const animationRef = useRef<AnimationPlaybackControls | null>(null);
	const invalidate = useInvalidateContacts();

	const isOpen = modal === "delete-channel";

	// Cache the target channel so details remain stable during deletion animations
	const targetChannelRef = useRef<Channel | null>(null);
	const matchedChannel = channels.find((channel) => channel.id === id);
	if (matchedChannel) {
		targetChannelRef.current = matchedChannel;
	}
	const channelToDelete = matchedChannel || targetChannelRef.current;

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

	const handleClose = () => {
		cancelHold();
		setModal(null);
		setId(null);
	};

	const handleDelete = async () => {
		if (!channelToDelete || deleteState !== "idle") return;

		setDeleteState("deleting");
		try {
			await axios.delete(`/api/contacts/v1/channels/${channelToDelete.id}`, {
				withCredentials: true,
			});

			setDeleteState("success");
			toast.success(`${channelToDelete.name} deleted successfully`);

			const isChannelDetailPage = pathname?.includes(`/${channelToDelete.id}`);

			setTimeout(() => {
				handleClose();
				if (isChannelDetailPage) {
					void navigate({ to: "/contacts/channels" });
				} else {
					void invalidate();
				}
				setTimeout(() => {
					setDeleteState("idle");
					targetChannelRef.current = null;
				}, 300);
			}, 750);
		} catch (error) {
			setDeleteState("idle");
			const errorMessage = axios.isAxiosError(error)
				? error.response?.data?.message || "Failed to delete channel"
				: "Failed to delete channel";
			toast.error(errorMessage);
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
			if (isOpen && channelToDelete && deleteState === "idle") {
				void handleDelete();
			}
		},
		{ enabled: isOpen && !!channelToDelete },
		[isOpen, channelToDelete, deleteState],
	);

	useEffect(() => {
		if (!isOpen) {
			cancelHold();
			const timer = setTimeout(() => {
				setDeleteState("idle");
				targetChannelRef.current = null;
			}, 300);
			return () => clearTimeout(timer);
		}
	}, [isOpen]);

	return (
		<Modal.Root open={isOpen} onOpenChange={(o) => !o && handleClose()}>
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
								{channelToDelete?.name || "Unnamed channel"}
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
						settings. Any contacts in this channel will be unlinked, but they
						will not be deleted.
					</div>

					{/* Footer Actions */}
					<div className="mt-6 flex items-center justify-end gap-3">
						<Button.Root
							type="button"
							variant="neutral"
							mode="ghost"
							size="small"
							onClick={handleClose}
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
